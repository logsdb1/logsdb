"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import {
  FileQuestion,
  Wrench,
  MessageSquare,
  Send,
  ArrowLeft,
  Github,
  AlertCircle,
  ExternalLink,
  CheckCircle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";

interface ExistingDiscussion {
  id: string;
  number: number;
  title: string;
  body: string;
  createdAt: string;
  author: { login: string; avatarUrl: string } | null;
  category: { name: string; slug: string };
  comments: { totalCount: number };
}

interface UploadedFile {
  url: string;
  filename: string;
  isImage: boolean;
  size: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  emoji: string;
}

const CATEGORY_INFO: Record<string, { icon: React.ReactNode; description: string; placeholder: string }> = {
  "sample-requests": {
    icon: <FileQuestion className="h-5 w-5" />,
    description: "Request log samples for a specific technology or log format",
    placeholder: `## Log Sample Request

**Technology:** [e.g., Nginx, Apache, PostgreSQL]

**Log Type:** [e.g., access logs, error logs, slow query logs]

**Use Case:** [Why do you need these samples?]

**Specific Requirements:**
- [Any specific fields or formats you need]
- [Version requirements if applicable]

Thank you!`,
  },
  "troubleshooting": {
    icon: <Wrench className="h-5 w-5" />,
    description: "Get help with log parsing issues, errors, or analysis",
    placeholder: `## Problem Description

[Describe what you're trying to do]

## Log Sample

\`\`\`
[Paste your log sample here]
\`\`\`

## What I've Tried

[List any parsing patterns or approaches you've attempted]

## Expected Result

[What should the parsed output look like?]`,
  },
  "use-cases": {
    icon: <Lightbulb className="h-5 w-5" />,
    description: "Share real-world log analysis scenarios and solutions",
    placeholder: `## Use Case Title

[Describe your use case scenario]

## Context

**Industry/Domain:** [e.g., DevOps, Security, E-commerce]
**Technology Stack:** [e.g., Nginx, PostgreSQL, Kubernetes]

## Problem

[What challenge did you face with logs?]

## Solution

[How did you solve it? Include parsing patterns, tools, or techniques]

## Results

[What improvements or insights did you gain?]

## Log Samples

\`\`\`
[Paste relevant log samples here]
\`\`\``,
  },
  "general": {
    icon: <MessageSquare className="h-5 w-5" />,
    description: "Discuss log formats, best practices, tools, and more",
    placeholder: `## Topic

[What would you like to discuss?]

## Context

[Provide any relevant background or context]

## Questions

- [Your specific questions or discussion points]`,
  },
};

function NewDiscussionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [existingDiscussions, setExistingDiscussions] = useState<ExistingDiscussion[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Get query params for pre-filling
  const categoryParam = searchParams.get("category");
  const techParam = searchParams.get("tech");
  const logParam = searchParams.get("log");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/community/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories);
        }
      } catch {
        // Use fallback categories
      }
    }
    fetchCategories();
  }, []);

  // Search for existing discussions when tech/log params are present
  useEffect(() => {
    async function searchExisting() {
      if (!techParam && !logParam) {
        setShowForm(true);
        return;
      }

      setLoadingExisting(true);
      try {
        const params = new URLSearchParams();
        if (techParam) params.set("tech", techParam);
        if (logParam) params.set("log", logParam);
        if (categoryParam) params.set("category", categoryParam);

        const res = await fetch(`/api/community/discussions/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setExistingDiscussions(data.discussions || []);
          // If no existing discussions, show form directly
          if (!data.discussions || data.discussions.length === 0) {
            setShowForm(true);
          }
        } else {
          setShowForm(true);
        }
      } catch {
        setShowForm(true);
      } finally {
        setLoadingExisting(false);
      }
    }

    searchExisting();
  }, [techParam, logParam, categoryParam]);

  // Pre-fill form based on query params
  useEffect(() => {
    if (initialized) return;

    if (categoryParam && CATEGORY_INFO[categoryParam]) {
      setSelectedCategory(categoryParam);

      // Generate pre-filled content based on tech and log params
      if (techParam && logParam) {
        const techName = techParam.charAt(0).toUpperCase() + techParam.slice(1);
        const logName = logParam.charAt(0).toUpperCase() + logParam.slice(1);

        if (categoryParam === "sample-requests") {
          setTitle(`[${techName}] Request for ${logName} log samples`);
          setContent(`## Log Sample Request

**Technology:** ${techName}

**Log Type:** ${logName}

**Use Case:** [Describe why you need these log samples]

**Specific Requirements:**
- [Any specific fields or formats you need]
- [Specific scenarios or edge cases]
- [Version requirements if applicable]

Thank you!`);
        } else if (categoryParam === "troubleshooting") {
          setTitle(`[${techName}] Help with ${logName} logs`);
          setContent(`## Problem Description

I'm having trouble with ${techName} ${logName} logs.

[Describe what you're trying to do]

## Log Sample

\`\`\`
[Paste your log sample here]
\`\`\`

## What I've Tried

[List any parsing patterns or approaches you've attempted]

## Expected Result

[What should the parsed output look like?]`);
        }
      }
      setInitialized(true);
    }
  }, [categoryParam, techParam, logParam, initialized]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug);
    if (CATEGORY_INFO[slug] && !content) {
      setContent(CATEGORY_INFO[slug].placeholder);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !session) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          setUploadedFiles((prev) => [...prev, data]);

          // Insert markdown link at cursor position or at the end
          const markdown = data.isImage
            ? `![${data.filename}](${data.url})`
            : `[${data.filename}](${data.url})`;

          setContent((prev) => prev + "\n\n" + markdown);
        } else {
          const data = await res.json();
          setError(data.error || "Failed to upload file");
        }
      }
    } catch {
      setError("Failed to upload file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
    // Remove from content
    setContent((prev) => {
      const file = uploadedFiles.find((f) => f.url === url);
      if (file) {
        const imagePattern = `![${file.filename}](${file.url})`;
        const linkPattern = `[${file.filename}](${file.url})`;
        return prev.replace(imagePattern, "").replace(linkPattern, "").trim();
      }
      return prev;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !title.trim() || !content.trim() || !selectedCategory) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/community/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: selectedCategory,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/community/${data.discussion.number}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create discussion");
      }
    } catch {
      setError("Failed to create discussion. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container py-10 max-w-3xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-10 max-w-3xl">
        <Breadcrumb
          items={[
            { label: "Community", href: "/community" },
            { label: "New Discussion" },
          ]}
          className="mb-6"
        />

        <Card>
          <CardContent className="py-10 text-center">
            <Github className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Sign in to Continue</h2>
            <p className="text-muted-foreground mb-6">
              You need a GitHub account to create discussions
            </p>
            <Button onClick={() => signIn("github")}>
              <Github className="h-4 w-4 mr-2" />
              Sign in with GitHub
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const techName = techParam ? techParam.charAt(0).toUpperCase() + techParam.slice(1) : "";
  const logName = logParam ? logParam.charAt(0).toUpperCase() + logParam.slice(1) : "";

  // Loading state for searching existing discussions
  if (loadingExisting) {
    return (
      <div className="container py-10 max-w-3xl">
        <Breadcrumb
          items={[
            { label: "Community", href: "/community" },
            { label: "New Discussion" },
          ]}
          className="mb-6"
        />
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  // Show existing discussions if found
  if (existingDiscussions.length > 0 && !showForm) {
    return (
      <div className="container py-10 max-w-3xl">
        <Breadcrumb
          items={[
            { label: "Community", href: "/community" },
            { label: "New Discussion" },
          ]}
          className="mb-6"
        />

        <Card className="mb-6 border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg">Existing Discussions Found</CardTitle>
            </div>
            <CardDescription>
              We found {existingDiscussions.length} discussion{existingDiscussions.length > 1 ? "s" : ""} about{" "}
              <strong>{techName} {logName}</strong> logs. Check if your question has already been answered:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingDiscussions.map((discussion) => (
              <Link
                key={discussion.id}
                href={`/community/${discussion.number}`}
                className="block"
              >
                <div className="p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{discussion.title}</h3>
                        <Badge variant="outline" className="shrink-0">
                          {discussion.category.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {discussion.body.slice(0, 150).replace(/[#*`\n]/g, " ").trim()}...
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>by {discussion.author?.login || "Unknown"}</span>
                        <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {discussion.comments.totalCount} replies
                        </span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Not what you&apos;re looking for?</p>
                <p className="text-sm text-muted-foreground">
                  You can still create a new discussion
                </p>
              </div>
              <Button onClick={() => setShowForm(true)}>
                Create New Discussion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-3xl">
      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "New Discussion" },
        ]}
        className="mb-6"
      />

      {/* Show info banner if there were existing discussions */}
      {existingDiscussions.length > 0 && (
        <Card className="mb-6 border-green-500/50 bg-green-500/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="underline hover:no-underline"
                >
                  {existingDiscussions.length} related discussion{existingDiscussions.length > 1 ? "s" : ""}
                </button>
                {" "}found. Creating a new one anyway.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Start a Discussion</h1>
        <p className="text-muted-foreground">
          Ask questions, request log samples, or share knowledge with the community
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Category Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Category</CardTitle>
            <CardDescription>
              Choose the type of discussion you want to start
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {["sample-requests", "troubleshooting", "use-cases", "general"].map((slug) => {
                const info = CATEGORY_INFO[slug];
                const category = categories.find((c) => c.slug === slug);
                const isSelected = selectedCategory === slug;

                return (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => handleCategorySelect(slug)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`${isSelected ? "text-primary" : "text-muted-foreground"}`}>
                        {info.icon}
                      </div>
                      <span className="font-medium">
                        {category?.name || slug.replace("-", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {info.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Title & Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Discussion Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="A clear, descriptive title for your discussion"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative ${dragOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your question or topic in detail..."
                  className="mt-1 min-h-[300px] font-mono text-sm"
                  required
                />
                {dragOver && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-md mt-1">
                    <div className="text-primary font-medium">Drop files here</div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Markdown formatting is supported. Drag & drop files or use the upload button below.
              </p>
            </div>

            {/* File Upload */}
            <div>
              <Label>Attachments</Label>
              <div className="mt-1 flex items-center gap-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.webp,.txt,.log,.csv,.json,.pdf"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={uploading}
                  />
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                    {uploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    <span className="text-sm">{uploading ? "Uploading..." : "Upload Files"}</span>
                  </div>
                </label>
                <span className="text-xs text-muted-foreground">
                  Max 5MB. Images, logs, text, CSV, JSON, PDF
                </span>
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.url}
                      className="flex items-center gap-3 p-2 bg-muted/50 rounded-md"
                    >
                      {file.isImage ? (
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                      ) : (
                        <FileText className="h-4 w-4 text-orange-500" />
                      )}
                      <span className="flex-1 text-sm truncate">{file.filename}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(file.url)}
                        className="p-1 hover:bg-muted rounded"
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="py-4 text-destructive">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" asChild>
            <Link href="/community">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancel
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || !content.trim() || !selectedCategory || submitting}
          >
            <Send className="h-4 w-4 mr-2" />
            {submitting ? "Creating..." : "Create Discussion"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewDiscussionPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      }
    >
      <NewDiscussionForm />
    </Suspense>
  );
}
