import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Map extensions to expected MIME types
const ALLOWED_FILES: Record<string, string[]> = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".gif": ["image/gif"],
  ".webp": ["image/webp"],
  ".txt": ["text/plain"],
  ".log": ["text/plain", "text/x-log", "application/octet-stream"],
  ".csv": ["text/csv", "text/plain"],
  ".json": ["application/json", "text/plain"],
  ".pdf": ["application/pdf"],
};

// Magic bytes for file type detection
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/gif": [0x47, 0x49, 0x46],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF header
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
};

function detectMimeType(buffer: Buffer): string | null {
  for (const [mime, bytes] of Object.entries(MAGIC_BYTES)) {
    if (bytes.every((byte, i) => buffer[i] === byte)) {
      return mime;
    }
  }
  return null;
}

function validateMimeType(
  file: File,
  buffer: Buffer,
  ext: string
): { valid: boolean; error?: string } {
  const allowedMimes = ALLOWED_FILES[ext];

  if (!allowedMimes) {
    return { valid: false, error: `File extension ${ext} not allowed` };
  }

  // Check declared MIME type
  if (
    !allowedMimes.includes(file.type) &&
    file.type !== "application/octet-stream"
  ) {
    return {
      valid: false,
      error: `MIME type ${file.type} not allowed for ${ext} files`,
    };
  }

  // For binary files, verify magic bytes
  if (ext.match(/\.(jpg|jpeg|png|gif|webp|pdf)$/)) {
    const detected = detectMimeType(buffer);
    if (detected && !allowedMimes.includes(detected)) {
      return { valid: false, error: "File content does not match extension" };
    }
  }

  return { valid: true };
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB" },
        { status: 400 }
      );
    }

    // Check file extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_FILES[ext]) {
      return NextResponse.json(
        {
          error: `File type not allowed. Allowed: ${Object.keys(ALLOWED_FILES).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Read file content for validation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate MIME type
    const mimeValidation = validateMimeType(file, buffer, ext);
    if (!mimeValidation.valid) {
      return NextResponse.json(
        { error: mimeValidation.error },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString("hex");
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${randomId}-${safeFilename}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Return URL
    const url = `/uploads/${filename}`;

    // Determine if it's an image
    const isImage = file.type.startsWith("image/");

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      isImage,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
