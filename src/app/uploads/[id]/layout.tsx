import { Metadata } from "next";
import { readFile } from "fs/promises";
import path from "path";

const METADATA_FILE = path.join(process.cwd(), "public", "uploads", "logs-metadata.json");

const TECHNOLOGIES: Record<string, string> = {
  nginx: "Nginx",
  apache: "Apache",
  linux: "Linux",
  windows: "Windows",
  docker: "Docker",
  postgresql: "PostgreSQL",
  mysql: "MySQL",
};

const LOG_TYPES: Record<string, string> = {
  access: "Access",
  error: "Error",
  security: "Security",
  auth: "Authentication",
  audit: "Audit",
  debug: "Debug",
  system: "System",
  application: "Application",
};

interface LogUploadMetadata {
  id: string;
  filename: string;
  originalName: string;
  technology: string;
  logType: string;
  uploadedAt: string;
  size: number;
}

async function getLogMetadata(id: string): Promise<LogUploadMetadata | null> {
  try {
    const data = await readFile(METADATA_FILE, "utf-8");
    const metadata = JSON.parse(data);
    return metadata.uploads.find((u: LogUploadMetadata) => u.id === id) || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const log = await getLogMetadata(params.id);

  if (!log) {
    return {
      title: "Log Not Found",
      description: "The requested log file could not be found.",
    };
  }

  const techName = TECHNOLOGIES[log.technology] || log.technology;
  const typeName = LOG_TYPES[log.logType] || log.logType;

  // Create intelligent title: "filename - Technology Type Log Sample"
  const title = `${log.originalName} - ${techName} ${typeName} Log Sample`;

  // Create description
  const description = `View and download ${log.originalName}, a real-world ${techName} ${typeName.toLowerCase()} log sample. Free log file example for learning, testing and reference.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | LogsDB`,
      description,
      type: "article",
    },
  };
}

export default function LogDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
