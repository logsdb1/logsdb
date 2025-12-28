import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "@octokit/rest";
import { authOptions } from "@/lib/auth";
import {
  escapeRegex,
  isValidIdentifier,
  isValidFieldName,
  validateLength,
  INPUT_LIMITS,
} from "@/lib/security";

const REPO_OWNER = "logsdb1";
const REPO_NAME = "logsdb";

function escapeForQuote(str: string, quoteType: string): string {
  if (quoteType === "`") {
    return str.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
  } else if (quoteType === '"') {
    return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  } else {
    return str.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  }
}

function findStringBoundary(content: string, startPos: number): { end: number; quoteType: string } | null {
  const quoteType = content[startPos];
  if (!['"', "'", "`"].includes(quoteType)) return null;

  let pos = startPos + 1;
  while (pos < content.length) {
    if (content[pos] === "\\") {
      pos += 2; // Skip escaped character
      continue;
    }
    if (content[pos] === quoteType) {
      return { end: pos, quoteType };
    }
    pos++;
  }
  return null;
}

function updateField(
  content: string,
  logTypeId: string,
  fieldName: string,
  newValue: string,
  searchContext?: string
): string {
  // Validate inputs to prevent ReDoS attacks
  if (!isValidIdentifier(logTypeId)) {
    throw new Error("Invalid logTypeId format");
  }
  if (!isValidFieldName(fieldName)) {
    throw new Error("Invalid fieldName format");
  }

  // Escape user inputs for safe regex usage
  const safeLogTypeId = escapeRegex(logTypeId);
  const safeFieldName = escapeRegex(fieldName);

  // Find the LogType export for this logTypeId
  const logTypePattern = new RegExp(
    `(export\\s+const\\s+\\w+:\\s*LogType\\s*=\\s*\\{[\\s\\S]*?id:\\s*["'\`]${safeLogTypeId}["'\`])`,
    "s"
  );

  const logTypeMatch = content.match(logTypePattern);
  if (!logTypeMatch) return content;

  const logTypeStart = logTypeMatch.index!;

  // Find the field within context (if provided) or directly
  let searchStart = logTypeStart;
  if (searchContext) {
    // searchContext is a hardcoded string from our code, not user input
    const safeSearchContext = escapeRegex(searchContext);
    const contextPattern = new RegExp(
      `${safeSearchContext}[\\s\\S]*?${safeFieldName}:\\s*`,
      "s"
    );
    const contextMatch = content.slice(logTypeStart).match(contextPattern);
    if (!contextMatch) return content;
    searchStart = logTypeStart + contextMatch.index!;
  }

  // Find the field
  const fieldPattern = new RegExp(`(${safeFieldName}:\\s*)(["'\`])`, "s");
  const fieldMatch = content.slice(searchStart).match(fieldPattern);
  if (!fieldMatch) return content;

  const fieldStart = searchStart + fieldMatch.index!;
  const valueStart = fieldStart + fieldMatch[1].length;

  // Find the end of the string value
  const boundary = findStringBoundary(content, valueStart);
  if (!boundary) return content;

  // Replace the value
  const escaped = escapeForQuote(newValue, boundary.quoteType);
  return (
    content.slice(0, valueStart + 1) +
    escaped +
    content.slice(boundary.end)
  );
}

function updateFileContent(
  content: string,
  logTypeId: string,
  changes: {
    description?: string;
    defaultPath?: string;
    example?: string;
    structure?: string;
    grokPattern?: string;
    regexPattern?: string;
  }
): string {
  let updatedContent = content;

  // Update description
  if (changes.description) {
    updatedContent = updateField(updatedContent, logTypeId, "description", changes.description);
  }

  // Update example (in formats section)
  if (changes.example) {
    updatedContent = updateField(updatedContent, logTypeId, "example", changes.example, "formats:");
  }

  // Update structure (in formats section)
  if (changes.structure) {
    updatedContent = updateField(updatedContent, logTypeId, "structure", changes.structure, "formats:");
  }

  // Update grok pattern
  if (changes.grokPattern) {
    updatedContent = updateField(updatedContent, logTypeId, "combined", changes.grokPattern, "grok:");
  }

  // Update regex pattern
  if (changes.regexPattern) {
    updatedContent = updateField(updatedContent, logTypeId, "combined", changes.regexPattern, "regex:");
  }

  return updatedContent;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { technology, logType, changes } = body;

    if (!technology || !logType || !changes) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate technology and logType identifiers
    if (!isValidIdentifier(technology) || !isValidIdentifier(logType)) {
      return NextResponse.json(
        { error: "Invalid technology or logType format" },
        { status: 400 }
      );
    }

    // Validate field lengths
    const fieldValidations = [
      validateLength(changes.description, INPUT_LIMITS.DESCRIPTION, "description"),
      validateLength(changes.example, INPUT_LIMITS.EXAMPLE, "example"),
      validateLength(changes.structure, INPUT_LIMITS.STRUCTURE, "structure"),
      validateLength(changes.grokPattern, INPUT_LIMITS.PATTERN, "grokPattern"),
      validateLength(changes.regexPattern, INPUT_LIMITS.PATTERN, "regexPattern"),
      validateLength(changes.additionalNotes, INPUT_LIMITS.NOTES, "additionalNotes"),
    ];

    for (const validation of fieldValidations) {
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
    }

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    // Get authenticated user info
    const { data: user } = await octokit.users.getAuthenticated();

    // Check if user has already forked the repo
    try {
      await octokit.repos.get({
        owner: user.login,
        repo: REPO_NAME,
      });
    } catch (e) {
      // Fork doesn't exist, create it
      await octokit.repos.createFork({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });

      // Wait for the fork to be ready
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Sync fork with upstream
    try {
      await octokit.repos.mergeUpstream({
        owner: user.login,
        repo: REPO_NAME,
        branch: "main",
      });
    } catch (e) {
      // Ignore if already up to date
    }

    // Get the default branch ref from user's fork
    const { data: ref } = await octokit.git.getRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: "heads/main",
    });

    // Create a new branch
    const branchName = `edit-${technology}-${logType}-${Date.now()}`;
    await octokit.git.createRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });

    // Get the current file content
    const filePath = `src/data/technologies/${technology}.ts`;
    const { data: fileData } = await octokit.repos.getContent({
      owner: user.login,
      repo: REPO_NAME,
      path: filePath,
      ref: branchName,
    });

    if (!("content" in fileData)) {
      return NextResponse.json(
        { error: "Could not read file" },
        { status: 500 }
      );
    }

    // Decode the file content
    const currentContent = Buffer.from(fileData.content, "base64").toString(
      "utf-8"
    );

    // Update the content with the changes
    const updatedContent = updateFileContent(currentContent, logType, {
      description: changes.description,
      example: changes.example,
      structure: changes.structure,
      grokPattern: changes.grokPattern,
      regexPattern: changes.regexPattern,
    });

    // Check if content actually changed
    if (currentContent === updatedContent) {
      return NextResponse.json(
        { error: "No changes detected" },
        { status: 400 }
      );
    }

    // Update the file
    await octokit.repos.createOrUpdateFileContents({
      owner: user.login,
      repo: REPO_NAME,
      path: filePath,
      message: `docs(${technology}): update ${logType} documentation

Updated fields:
${changes.description ? "- description" : ""}
${changes.example ? "- example" : ""}
${changes.structure ? "- structure" : ""}
${changes.grokPattern ? "- grok pattern" : ""}
${changes.regexPattern ? "- regex pattern" : ""}

${changes.additionalNotes ? `Notes: ${changes.additionalNotes}` : ""}`.trim(),
      content: Buffer.from(updatedContent).toString("base64"),
      sha: fileData.sha,
      branch: branchName,
    });

    // Create a pull request
    const { data: pr } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `docs(${technology}): update ${logType} documentation`,
      body: `## Summary

This PR updates the **${technology}/${logType}** documentation.

### Changes

| Field | Status |
|-------|--------|
| Description | ${changes.description ? "Updated" : "-"} |
| Example | ${changes.example ? "Updated" : "-"} |
| Structure | ${changes.structure ? "Updated" : "-"} |
| Grok Pattern | ${changes.grokPattern ? "Updated" : "-"} |
| Regex Pattern | ${changes.regexPattern ? "Updated" : "-"} |

### Additional Notes
${changes.additionalNotes || "None"}

---
Submitted via [LogsDB Edit Interface](https://logsdb.com/edit/${technology}/${logType})
Author: @${user.login}
`,
      head: `${user.login}:${branchName}`,
      base: "main",
    });

    return NextResponse.json({
      success: true,
      prUrl: pr.html_url,
      prNumber: pr.number,
    });
  } catch (error: any) {
    console.error("Error creating PR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create pull request" },
      { status: 500 }
    );
  }
}
