"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  HardDrive,
  Filter,
  Upload,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";

const TECHNOLOGIES = [
  { id: "nginx", name: "Nginx" },
  { id: "apache", name: "Apache" },
  { id: "linux", name: "Linux" },
  { id: "windows", name: "Windows" },
  { id: "docker", name: "Docker" },
  { id: "postgresql", name: "PostgreSQL" },
  { id: "mysql", name: "MySQL" },
];

const LOG_TYPES = [
  { id: "access", name: "Access" },
  { id: "error", name: "Error" },
  { id: "security", name: "Security" },
  { id: "auth", name: "Authentication" },
  { id: "audit", name: "Audit" },
  { id: "debug", name: "Debug" },
  { id: "system", name: "System" },
  { id: "application", name: "Application" },
  { id: "other", name: "Other" },
];

const LOG_TYPES_MAP: Record<string, string> = {
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

interface LogUpload {
  id: string;
  filename: string;
  originalName: string;
  technology: string;
  logType?: string;
  uploadedAt: string;
  size: number;
  preview?: string;
  lineCount?: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function UploadsContent() {
  const searchParams = useSearchParams();
  const [uploads, setUploads] = useState<LogUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>(searchParams.get("technology") || "all");
  const [logTypeFilter, setLogTypeFilter] = useState<string>(searchParams.get("logType") || "all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedPreviews, setExpandedPreviews] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("technology", filter);
      if (logTypeFilter !== "all") params.set("logType", logTypeFilter);
      if (searchQuery) params.set("q", searchQuery);
      params.set("page", page.toString());
      params.set("limit", "10");

      const url = `/api/logs-upload?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();
      setUploads(data.uploads || []);
      if (data.pagination) {
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch uploads:", error);
      setUploads([]);
    } finally {
      setLoading(false);
    }
  }, [filter, logTypeFilter, searchQuery, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filter, logTypeFilter, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchUploads();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchUploads]);

  const togglePreview = (id: string) => {
    setExpandedPreviews((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTechnologyName = (id: string) => {
    return TECHNOLOGIES.find((t) => t.id === id)?.name || id;
  };

  return (
    <div className="container py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Uploaded Logs" },
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Uploaded Logs</h1>
          <p className="text-muted-foreground mt-1">
            Browse log files uploaded by the community
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Log
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs by content, filename, technology..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Technology" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Technologies</SelectItem>
              {TECHNOLOGIES.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={logTypeFilter} onValueChange={setLogTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Log Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {LOG_TYPES.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground mb-4">
        {pagination.total} file{pagination.total !== 1 ? "s" : ""} found
        {searchQuery && ` for "${searchQuery}"`}
        {pagination.totalPages > 1 && ` (page ${pagination.page} of ${pagination.totalPages})`}
      </div>

      {/* Uploads List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : uploads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {searchQuery ? "No logs found" : "No logs uploaded yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to upload a log file!"}
            </p>
            {!searchQuery && (
              <Button asChild>
                <Link href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Log
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {uploads.map((upload) => (
            <Card key={upload.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <FileText className="h-10 w-10 text-primary shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Link
                        href={`/uploads/${upload.id}`}
                        className="font-medium truncate hover:text-primary hover:underline"
                      >
                        {upload.originalName}
                      </Link>
                      <Badge variant="secondary">
                        {getTechnologyName(upload.technology)}
                      </Badge>
                      {upload.logType && (
                        <Badge variant="outline">
                          {LOG_TYPES_MAP[upload.logType] || upload.logType}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(upload.size)}
                      </span>
                      {upload.lineCount && (
                        <span className="flex items-center gap-1">
                          <FileCode className="h-3 w-3" />
                          {upload.lineCount} lines
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(upload.uploadedAt)}
                      </span>
                    </div>

                    {/* Preview toggle */}
                    {upload.preview && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePreview(upload.id)}
                          className="text-xs h-7 px-2"
                        >
                          {expandedPreviews.has(upload.id) ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide preview
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Show preview
                            </>
                          )}
                        </Button>
                        {expandedPreviews.has(upload.id) && (
                          <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-x-auto max-h-60 overflow-y-auto font-mono">
                            {upload.preview}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="default" size="sm" asChild>
                      <Link href={`/uploads/${upload.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={`/api/logs-upload/${upload.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum: number;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(pageNum)}
                  className="w-9"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(pagination.totalPages)}
            disabled={page === pagination.totalPages}
          >
            Last
          </Button>
        </div>
      )}
    </div>
  );
}

export default function UploadsClient() {
  return (
    <Suspense fallback={
      <div className="container py-8">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    }>
      <UploadsContent />
    </Suspense>
  );
}
