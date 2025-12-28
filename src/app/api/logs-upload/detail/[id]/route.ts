import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

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
  preview?: string;
  lineCount?: number;
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get metadata
    const metadata = await getMetadata();
    const log = metadata.uploads.find((u) => u.id === id);

    if (!log) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    // Read full content
    const filePath = path.join(process.cwd(), "public", "uploads", "logs", log.filename);
    let content = "";
    try {
      content = await readFile(filePath, "utf-8");
    } catch {
      content = log.preview || "Content not available";
    }

    return NextResponse.json({
      ...log,
      content,
    });
  } catch (error) {
    console.error("Error fetching log detail:", error);
    return NextResponse.json({ error: "Failed to fetch log" }, { status: 500 });
  }
}
