import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Octokit } from "@octokit/rest";
import { authOptions } from "@/lib/auth";
import { validateNewLogTypeRequest } from "@/lib/validators";

const REPO_OWNER = "logsdb1";
const REPO_NAME = "logsdb";

interface LinuxPath {
  distro: string;
  path: string;
}

interface NewLogTypeRequest {
  isNewTechnology: boolean;
  technologyId: string;
  technologyName: string;
  technologyDescription: string;
  technologyCategory: string;
  logTypeId: string;
  logTypeName: string;
  logTypeDescription: string;
  linuxPaths: LinuxPath[];
  windowsPath: string;
  macPath: string;
  example: string;
  structure: string;
  grokPattern: string;
  regexPattern: string;
  additionalNotes: string;
}

function generateLogTypeCode(data: NewLogTypeRequest): string {
  const linuxPathsCode = data.linuxPaths
    .filter((p) => p.path)
    .map((p) => `      { distro: "${p.distro}", path: "${p.path}" }`)
    .join(",\n");

  const windowsPathCode = data.windowsPath
    ? `    windows: [{ variant: "Default", path: "${data.windowsPath}" }],`
    : "";

  const macPathCode = data.macPath
    ? `    macos: [{ variant: "Default", path: "${data.macPath}" }],`
    : "";

  return `
export const ${data.logTypeId.replace(/-/g, "")}Log: LogType = {
  id: "${data.logTypeId}",
  name: "${data.logTypeName}",
  description: "${data.logTypeDescription.replace(/"/g, '\\"')}",
  category: "operational",
  paths: {
    linux: [
${linuxPathsCode}
    ],
${windowsPathCode}
${macPathCode}
  },
  formats: {
    default: {
      name: "Default",
      example: \`${data.example.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,
      structure: \`${data.structure.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,
    },
  },
  fields: [],
  parsing: {
    grok: {
      combined: \`${data.grokPattern.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,
    },
    regex: {
      combined: \`${data.regexPattern.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`,
    },
  },
  collectors: {},
};
`;
}

function generateNewTechnologyFile(data: NewLogTypeRequest): string {
  const logTypeCode = generateLogTypeCode(data);
  const varName = data.logTypeId.replace(/-/g, "");

  return `import { Technology, LogType } from "@/types/logs";
${logTypeCode}

export const ${data.technologyId}: Technology = {
  id: "${data.technologyId}",
  name: "${data.technologyName}",
  description: "${data.technologyDescription.replace(/"/g, '\\"')}",
  category: "${data.technologyCategory}",
  tags: [],
  logTypes: [
    { id: "${data.logTypeId}", name: "${data.logTypeName}" },
  ],
};

export const logTypes: LogType[] = [${varName}Log];
`;
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

    // Comprehensive input validation
    const validation = validateNewLogTypeRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.errors },
        { status: 400 }
      );
    }

    // Cast to typed request after validation
    const validatedBody = body as NewLogTypeRequest;

    const octokit = new Octokit({
      auth: session.accessToken,
    });

    const { data: user } = await octokit.users.getAuthenticated();

    // Fork repo if needed
    try {
      await octokit.repos.get({
        owner: user.login,
        repo: REPO_NAME,
      });
    } catch {
      await octokit.repos.createFork({
        owner: REPO_OWNER,
        repo: REPO_NAME,
      });
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    // Sync fork
    try {
      await octokit.repos.mergeUpstream({
        owner: user.login,
        repo: REPO_NAME,
        branch: "main",
      });
    } catch {
      // Ignore
    }

    // Get default branch ref
    const { data: ref } = await octokit.git.getRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: "heads/main",
    });

    // Create branch with sanitized name
    const branchName = `new-${validatedBody.technologyId}-${validatedBody.logTypeId}-${Date.now()}`;
    await octokit.git.createRef({
      owner: user.login,
      repo: REPO_NAME,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha,
    });

    const filePath = `src/data/technologies/${validatedBody.technologyId}.ts`;

    if (validatedBody.isNewTechnology) {
      // Create new technology file
      const newFileContent = generateNewTechnologyFile(validatedBody);

      await octokit.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: REPO_NAME,
        path: filePath,
        message: `feat(${validatedBody.technologyId}): add ${validatedBody.technologyName} with ${validatedBody.logTypeName}

Added new technology: ${validatedBody.technologyName}
Added log type: ${validatedBody.logTypeName}

${validatedBody.additionalNotes ? `Notes: ${validatedBody.additionalNotes}` : ""}`.trim(),
        content: Buffer.from(newFileContent).toString("base64"),
        branch: branchName,
      });

      // Also update index.ts to export the new technology
      try {
        const { data: indexFile } = await octokit.repos.getContent({
          owner: user.login,
          repo: REPO_NAME,
          path: "src/data/technologies/index.ts",
          ref: branchName,
        });

        if ("content" in indexFile) {
          let indexContent = Buffer.from(indexFile.content, "base64").toString("utf-8");

          // Add import
          const importLine = `import { ${validatedBody.technologyId}, logTypes as ${validatedBody.technologyId}LogTypes } from "./${validatedBody.technologyId}";\n`;
          indexContent = importLine + indexContent;

          // Add to technologies array
          indexContent = indexContent.replace(
            /export const technologies: Technology\[\] = \[/,
            `export const technologies: Technology[] = [\n  ${validatedBody.technologyId},`
          );

          // Add to allLogTypes
          indexContent = indexContent.replace(
            /export const allLogTypes: LogType\[\] = \[/,
            `export const allLogTypes: LogType[] = [\n  ...${validatedBody.technologyId}LogTypes,`
          );

          await octokit.repos.createOrUpdateFileContents({
            owner: user.login,
            repo: REPO_NAME,
            path: "src/data/technologies/index.ts",
            message: `feat(${validatedBody.technologyId}): register new technology`,
            content: Buffer.from(indexContent).toString("base64"),
            sha: indexFile.sha,
            branch: branchName,
          });
        }
      } catch {
        // Index update failed, PR will need manual adjustment
      }
    } else {
      // Add to existing technology file
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

      let content = Buffer.from(fileData.content, "base64").toString("utf-8");
      const logTypeCode = generateLogTypeCode(validatedBody);
      const varName = validatedBody.logTypeId.replace(/-/g, "");

      // Add log type export before the technology export
      const techExportMatch = content.match(/export const \w+: Technology/);
      if (techExportMatch) {
        content = content.slice(0, techExportMatch.index) +
          logTypeCode + "\n" +
          content.slice(techExportMatch.index);
      }

      // Add to logTypes array
      content = content.replace(
        /export const logTypes: LogType\[\] = \[/,
        `export const logTypes: LogType[] = [${varName}Log, `
      );

      // Add to technology's logTypes
      content = content.replace(
        /logTypes: \[/,
        `logTypes: [\n    { id: "${validatedBody.logTypeId}", name: "${validatedBody.logTypeName}" },`
      );

      await octokit.repos.createOrUpdateFileContents({
        owner: user.login,
        repo: REPO_NAME,
        path: filePath,
        message: `feat(${validatedBody.technologyId}): add ${validatedBody.logTypeName}

Added new log type: ${validatedBody.logTypeName}

${validatedBody.additionalNotes ? `Notes: ${validatedBody.additionalNotes}` : ""}`.trim(),
        content: Buffer.from(content).toString("base64"),
        sha: fileData.sha,
        branch: branchName,
      });
    }

    // Create PR
    const { data: pr } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: validatedBody.isNewTechnology
        ? `feat(${validatedBody.technologyId}): add ${validatedBody.technologyName} with ${validatedBody.logTypeName}`
        : `feat(${validatedBody.technologyId}): add ${validatedBody.logTypeName}`,
      body: `## Summary

${validatedBody.isNewTechnology ? `Adds new technology **${validatedBody.technologyName}** with ` : "Adds "}**${validatedBody.logTypeName}** log type.

### Log Type Details

| Field | Value |
|-------|-------|
| ID | \`${validatedBody.logTypeId}\` |
| Name | ${validatedBody.logTypeName} |
| Description | ${validatedBody.logTypeDescription} |

### Paths

**Linux:**
${validatedBody.linuxPaths?.filter(p => p.path).map(p => `- ${p.distro}: \`${p.path}\``).join("\n") || "N/A"}

${validatedBody.windowsPath ? `**Windows:** \`${validatedBody.windowsPath}\`` : ""}
${validatedBody.macPath ? `**macOS:** \`${validatedBody.macPath}\`` : ""}

### Example
\`\`\`
${validatedBody.example}
\`\`\`

${validatedBody.additionalNotes ? `### Notes\n${validatedBody.additionalNotes}` : ""}

---
Submitted via [LogsDB Contribute](https://logsdb.com/contribute/new)
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
