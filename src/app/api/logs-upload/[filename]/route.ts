import { NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// Allowlist pattern: timestamp-randomhex-safefilename
const VALID_FILENAME_PATTERN = /^\d+-[a-f0-9]{16}-[a-zA-Z0-9._-]+$/;

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    // Strict allowlist validation
    if (!VALID_FILENAME_PATTERN.test(filename)) {
      return NextResponse.json(
        { error: "Invalid filename format" },
        { status: 400 }
      );
    }

    // Additional length check
    if (filename.length > 200) {
      return NextResponse.json({ error: "Filename too long" }, { status: 400 });
    }

    // Construct expected path
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "logs");
    const filePath = path.join(uploadsDir, filename);

    // CRITICAL: Verify resolved path is within uploads directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadsDir = path.resolve(uploadsDir);

    if (!resolvedPath.startsWith(resolvedUploadsDir + path.sep)) {
      console.error(`Path traversal attempt detected: ${filename}`);
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    // Verify file exists and is a regular file
    const stats = await stat(resolvedPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: "Not a file" }, { status: 400 });
    }

    const content = await readFile(resolvedPath);

    // Sanitize filename for Content-Disposition header
    const safeDisplayName = filename.replace(/[^\w.-]/g, "_");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `inline; filename="${safeDisplayName}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("File read error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
