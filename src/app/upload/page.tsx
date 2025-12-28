"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Breadcrumb } from "@/components/breadcrumb";

const TECHNOLOGIES = [
  { id: "nginx", name: "Nginx" },
  { id: "apache", name: "Apache" },
  { id: "linux", name: "Linux" },
  { id: "windows", name: "Windows" },
  { id: "docker", name: "Docker" },
  { id: "postgresql", name: "PostgreSQL" },
  { id: "mysql", name: "MySQL" },
  { id: "other", name: "Other (custom)" },
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
  { id: "other", name: "Other (custom)" },
];

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [technology, setTechnology] = useState<string>("");
  const [customTechnology, setCustomTechnology] = useState<string>("");
  const [logType, setLogType] = useState<string>("");
  const [customLogType, setCustomLogType] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    url?: string;
    error?: string;
  } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  }, []);

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.toLowerCase();
    if (!ext.endsWith(".log") && !ext.endsWith(".txt")) {
      setUploadResult({
        success: false,
        error: "Only .log and .txt files are allowed",
      });
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadResult({
        success: false,
        error: "File size must be less than 5MB",
      });
      return;
    }
    setFile(selectedFile);
    setUploadResult(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    const finalTechnology = technology === "other" ? customTechnology : technology;
    const finalLogType = logType === "other" ? customLogType : logType;

    if (!file || !finalTechnology || !finalLogType) return;

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("technology", finalTechnology);
      formData.append("logType", finalLogType);

      const response = await fetch("/api/logs-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult({
          success: true,
          url: data.url,
        });
        setFile(null);
        setTechnology("");
        setCustomTechnology("");
        setLogType("");
        setCustomLogType("");
      } else {
        setUploadResult({
          success: false,
          error: data.error || "Upload failed",
        });
      }
    } catch {
      setUploadResult({
        success: false,
        error: "Network error. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadResult(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="container py-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Upload Log File" },
        ]}
      />

      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Upload Log File</h1>
          <p className="text-muted-foreground mt-1">
            Share your log files with the community
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/uploads">
            <FileText className="h-4 w-4 mr-2" />
            Browse Uploads
          </Link>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload a Log File
            </CardTitle>
            <CardDescription>
              Upload your .log or .txt file and select the associated technology.
              Files are public and accessible to everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="text-left">
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">
                    Drag and drop your log file here, or
                  </p>
                  <label htmlFor="file-upload">
                    <Button variant="outline" asChild>
                      <span className="cursor-pointer">Browse Files</span>
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".log,.txt"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-muted-foreground mt-4">
                    Accepted formats: .log, .txt (max 5MB)
                  </p>
                </>
              )}
            </div>

            {/* Technology Select */}
            <div className="space-y-2">
              <Label htmlFor="technology">Technology</Label>
              <Select value={technology} onValueChange={setTechnology}>
                <SelectTrigger id="technology">
                  <SelectValue placeholder="Select a technology..." />
                </SelectTrigger>
                <SelectContent>
                  {TECHNOLOGIES.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {technology === "other" && (
                <Input
                  placeholder="Enter technology name (e.g., Caddy, Traefik, Redis...)"
                  value={customTechnology}
                  onChange={(e) => setCustomTechnology(e.target.value)}
                  className="mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                Choose which technology generated this log file
              </p>
            </div>

            {/* Log Type Select */}
            <div className="space-y-2">
              <Label htmlFor="logType">Log Type</Label>
              <Select value={logType} onValueChange={setLogType}>
                <SelectTrigger id="logType">
                  <SelectValue placeholder="Select a log type..." />
                </SelectTrigger>
                <SelectContent>
                  {LOG_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {logType === "other" && (
                <Input
                  placeholder="Enter log type (e.g., slow-query, audit, metrics...)"
                  value={customLogType}
                  onChange={(e) => setCustomLogType(e.target.value)}
                  className="mt-2"
                />
              )}
              <p className="text-xs text-muted-foreground">
                What type of log is this? (access, error, security, etc.)
              </p>
            </div>

            {/* Result Message */}
            {uploadResult && (
              <div
                className={`flex items-start gap-3 p-4 rounded-lg ${
                  uploadResult.success
                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                    : "bg-destructive/10 text-destructive"
                }`}
              >
                {uploadResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Upload successful!</p>
                      <p className="text-sm mt-1">
                        Your file is available at:{" "}
                        <a
                          href={uploadResult.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          {uploadResult.url}
                        </a>
                      </p>
                      <Link
                        href="/uploads"
                        className="text-sm underline mt-2 inline-block"
                      >
                        View all uploaded logs
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Upload failed</p>
                      <p className="text-sm mt-1">{uploadResult.error}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={
                !file ||
                !technology ||
                !logType ||
                (technology === "other" && !customTechnology) ||
                (logType === "other" && !customLogType) ||
                isUploading
              }
              className="w-full"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                • Only upload log files (.log, .txt) - no executables or scripts
              </li>
              <li>
                • Remove or mask any sensitive information (passwords, API keys, IPs)
              </li>
              <li>• Maximum file size is 5MB</li>
              <li>• Uploaded files are public and can be viewed by anyone</li>
              <li>
                • Consider anonymizing data before uploading (replace usernames,
                emails, etc.)
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
