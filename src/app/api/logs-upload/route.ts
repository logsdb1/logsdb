import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import {
  generateChallenge,
  verifyChallenge,
  checkHoneypot,
  validateLogContent,
  checkSubmissionTiming,
} from "@/lib/anti-bot";
import { validateUploadMetadata } from "@/lib/validators";
import { getClientIP } from "@/lib/rate-limiter";

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
    const parsed = JSON.parse(data);

    // Validate structure after parsing
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.uploads)) {
      console.error("Invalid metadata structure, resetting to empty");
      return { uploads: [] };
    }

    // Filter valid entries only
    const validUploads = parsed.uploads.filter(
      (u: unknown): u is LogUploadMetadata =>
        u !== null &&
        typeof u === "object" &&
        typeof (u as LogUploadMetadata).id === "string" &&
        typeof (u as LogUploadMetadata).filename === "string" &&
        typeof (u as LogUploadMetadata).originalName === "string" &&
        typeof (u as LogUploadMetadata).technology === "string" &&
        typeof (u as LogUploadMetadata).uploadedAt === "string"
    );

    return { uploads: validUploads };
  } catch {
    return { uploads: [] };
  }
}

async function saveMetadata(metadata: MetadataStore): Promise<void> {
  await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2));
}

export async function POST(request: Request) {
  const ip = getClientIP(request);

  try {
    const formData = await request.formData();

    // Check honeypot fields (anti-bot)
    const honeypotResult = checkHoneypot(formData);
    if (!honeypotResult.valid) {
      // Return success to not tip off bots, but don't actually process
      console.log(`Bot detected from ${ip}: ${honeypotResult.reason}`);
      return NextResponse.json({ success: true, url: "/uploads/processed" });
    }

    // Verify challenge token
    const challengeToken = formData.get("_token") as string | null;
    const challengeTimestamp = parseInt(
      (formData.get("_timestamp") as string) || "0",
      10
    );

    if (!challengeToken || !challengeTimestamp) {
      return NextResponse.json(
        { error: "Security verification required. Please refresh the page." },
        { status: 400 }
      );
    }

    const challengeResult = verifyChallenge(challengeToken, challengeTimestamp);
    if (!challengeResult.valid) {
      return NextResponse.json(
        { error: challengeResult.reason },
        { status: 400 }
      );
    }

    // Check submission timing (too fast = likely bot)
    const timingResult = checkSubmissionTiming(challengeTimestamp);
    if (!timingResult.valid) {
      console.log(`Suspicious timing from ${ip}: ${timingResult.reason}`);
      // Don't reject, but log for review
    }

    const file = formData.get("file") as File | null;
    const technology = formData.get("technology") as string | null;
    const logType = formData.get("logType") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate technology and logType
    const metadataValidation = validateUploadMetadata(technology, logType);
    if (!metadataValidation.valid) {
      return NextResponse.json(
        { error: metadataValidation.errors.join(", ") },
        { status: 400 }
      );
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

    // Read and validate file content
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate file content (no binaries, scripts, etc.)
    const contentResult = validateLogContent(buffer);
    if (!contentResult.valid) {
      return NextResponse.json(
        { error: contentResult.reason },
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
    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    // Extract preview (first 10 lines) and count total lines
    const content = buffer.toString("utf-8");
    const lines = content.split("\n");
    const lineCount = lines.length;
    const preview = lines.slice(0, 10).join("\n");

    // Save metadata (technology and logType are validated above)
    const metadata = await getMetadata();
    const uploadEntry: LogUploadMetadata = {
      id: randomId,
      filename,
      originalName: file.name,
      technology: technology as string,
      logType: logType as string,
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

// GET endpoint to list all uploaded logs or get challenge token
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // If requesting a challenge token for anti-bot protection
    if (searchParams.get("action") === "challenge") {
      const challenge = generateChallenge();
      return NextResponse.json(challenge);
    }

    const technology = searchParams.get("technology");
    const logType = searchParams.get("logType");
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";

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

    // Sorting
    uploads.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      } else if (sortBy === "size") {
        comparison = a.size - b.size;
      } else if (sortBy === "name") {
        comparison = a.originalName.localeCompare(b.originalName);
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

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
