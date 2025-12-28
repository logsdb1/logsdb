import { Metadata } from "next";
import UploadsClient from "./uploads-client";

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
  other: "Other",
};

interface Props {
  searchParams: Promise<{ technology?: string; logType?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const technology = params.technology;
  const logType = params.logType;

  const techName = technology ? TECHNOLOGIES[technology] || technology : null;
  const typeName = logType ? LOG_TYPES[logType] || logType : null;

  // Build dynamic title based on filters
  let title = "Uploaded Log Samples";
  let description = "Browse log files uploaded by the LogsDB community. Filter by technology and download real-world log examples for learning and testing.";

  if (techName && typeName) {
    title = `${techName} ${typeName} Log Samples`;
    description = `Browse real-world ${techName} ${typeName.toLowerCase()} log samples uploaded by the community. Download free log file examples for learning and testing.`;
  } else if (techName) {
    title = `${techName} Log Samples`;
    description = `Browse real-world ${techName} log samples uploaded by the community. Download free log file examples for learning and testing.`;
  } else if (typeName) {
    title = `${typeName} Log Samples`;
    description = `Browse real-world ${typeName.toLowerCase()} log samples uploaded by the community. Download free log file examples for learning and testing.`;
  }

  // Add noindex for filtered pages to avoid thin content issues
  const hasFilters = technology || logType;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | LogsDB`,
      description,
    },
    robots: hasFilters ? { index: false, follow: true } : undefined,
  };
}

export default function UploadsPage() {
  return <UploadsClient />;
}
