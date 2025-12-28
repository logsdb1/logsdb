"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  HardDrive,
  FileCode,
  Copy,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";

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

interface LogDetail {
  id: string;
  filename: string;
  originalName: string;
  technology: string;
  logType?: string;
  uploadedAt: string;
  size: number;
  lineCount?: number;
  content: string;
}

export default function LogDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [log, setLog] = useState<LogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchLog() {
      try {
        const response = await fetch(`/api/logs-upload/detail/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Log not found");
          } else {
            setError("Failed to load log");
          }
          return;
        }
        const data = await response.json();
        setLog(data);
      } catch {
        setError("Failed to load log");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchLog();
    }
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTechnologyName = (id: string) => {
    return TECHNOLOGIES[id] || id;
  };

  const getLogTypeName = (type: string) => {
    return LOG_TYPES[type] || type;
  };

  const handleCopy = async () => {
    if (log?.content) {
      await navigator.clipboard.writeText(log.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="container py-8">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Uploaded Logs", href: "/uploads" },
            { label: "Not Found" },
          ]}
        />
        <Card className="mt-8">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{error || "Log not found"}</h3>
            <p className="text-muted-foreground mb-4">
              This log file may have been removed or the link is incorrect.
            </p>
            <Button asChild>
              <Link href="/uploads">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Uploads
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Uploaded Logs", href: "/uploads" },
          { label: log.originalName },
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/uploads">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {log.originalName}
            </h1>
            <Badge variant="secondary">
              {getTechnologyName(log.technology)}
            </Badge>
            {log.logType && (
              <Badge variant="outline">
                {getLogTypeName(log.logType)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              {formatFileSize(log.size)}
            </span>
            {log.lineCount && (
              <span className="flex items-center gap-1">
                <FileCode className="h-3 w-3" />
                {log.lineCount} lines
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(log.uploadedAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mb-6">
        <Button asChild>
          <a
            href={`/api/logs-upload/${log.filename}`}
            download={log.originalName}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </a>
        </Button>
        <Button variant="outline" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Content
            </>
          )}
        </Button>
        <Button variant="outline" asChild>
          <a
            href={`/api/logs-upload/${log.filename}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Raw
          </a>
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Log Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto max-h-[70vh] overflow-y-auto font-mono whitespace-pre">
            {log.content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
