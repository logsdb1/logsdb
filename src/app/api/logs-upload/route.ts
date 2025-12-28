import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Only allow log file extensions
const ALLOWED_EXTENSIONS = [".log", ".txt"];

// Metadata file path
const METADATA_FILE = path.join(process.cwd(), "public", "uploads", "logs-metadata.json");

interface LogUploadMetadata {
  id: string;
  filename: string;
  originalName: string;
  technology: string;
  logType: string;
  uploadedAt: string;
  size: number;
  preview: string;
  lineCount: number;
}

interface MetadataStore {
  uploads: LogUploadMetadata[];
}

async function getMetadata(): Promise<MetadataStore> {
  try {
    const data = await readFile(METADATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { uploads: [] };
  }
}

async function saveMetadata(metadata: MetadataStore): Promise<void> {
  await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const technology = formData.get("technology") as string | null;
    const logType = formData.get("logType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!technology) {
      return NextResponse.json({ error: "Technology is required" }, { status: 400 });
    }

    if (!logType) {
      return NextResponse.json({ error: "Log type is required" }, { status: 400 });
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
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: `Only log files allowed (.log, .txt)` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomBytes(8).toString("hex");
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}-${randomId}-${safeFilename}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "logs");
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Extract preview (first 10 lines) and count total lines
    const content = buffer.toString("utf-8");
    const lines = content.split("\n");
    const lineCount = lines.length;
    const preview = lines.slice(0, 10).join("\n");

    // Save metadata
    const metadata = await getMetadata();
    const uploadEntry: LogUploadMetadata = {
      id: randomId,
      filename,
      originalName: file.name,
      technology,
      logType,
      uploadedAt: new Date().toISOString(),
      size: file.size,
      preview,
      lineCount,
    };
    metadata.uploads.unshift(uploadEntry);
    await saveMetadata(metadata);

    // Return URL (use API route for file serving)
    const url = `/api/logs-upload/${filename}`;

    return NextResponse.json({
      success: true,
      url,
      id: randomId,
      filename: file.name,
      technology,
      logType,
      size: file.size,
    });
  } catch (error) {
    console.error("Log upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

// GET endpoint to list all uploaded logs
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const technology = searchParams.get("technology");
    const logType = searchParams.get("logType");
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const metadata = await getMetadata();
    let uploads = metadata.uploads;

    // Filter by technology if specified
    if (technology && technology !== "all") {
      uploads = uploads.filter((u) => u.technology === technology);
    }

    // Filter by log type if specified
    if (logType && logType !== "all") {
      uploads = uploads.filter((u) => u.logType === logType);
    }

    // Search in preview content and filename
    if (query) {
      const q = query.toLowerCase();
      uploads = uploads.filter(
        (u) =>
          u.originalName.toLowerCase().includes(q) ||
          u.preview?.toLowerCase().includes(q) ||
          u.technology.toLowerCase().includes(q) ||
          u.logType?.toLowerCase().includes(q)
      );
    }

    // Pagination
    const total = uploads.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedUploads = uploads.slice(offset, offset + limit);

    return NextResponse.json({
      uploads: paginatedUploads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching uploads:", error);
    return NextResponse.json({ error: "Failed to fetch uploads" }, { status: 500 });
  }
}
