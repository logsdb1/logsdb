"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  MessageSquare,
  Calendar,
  ExternalLink,
  Send,
  FileQuestion,
  Wrench,
  User,
  CheckCircle,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Loader2,
  Share2,
  Bookmark,
  BookmarkCheck,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Copy,
  Check,
  PlusCircle,
  Database,
} from "lucide-react";
import { Reactions, ReactionGroup } from "@/components/reactions";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";

interface Author {
  login: string;
  avatarUrl: string;
  url: string;
}

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: Author | null;
  reactionGroups?: ReactionGroup[];
}

interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  url: string;
  author: Author | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  answerChosenAt?: string;
  answer?: Comment;
  comments: {
    totalCount: number;
    nodes: Comment[];
  };
  reactionGroups?: ReactionGroup[];
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "sample-requests":
      return <FileQuestion className="h-4 w-4" />;
    case "troubleshooting":
      return <Wrench className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
}

function getCategoryColor(slug: string) {
  switch (slug) {
    case "sample-requests":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "troubleshooting":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    default:
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  }
}

// Simple markdown-like rendering (basic)
// Extract file URL from markdown text
function extractFileUrl(text: string): string | null {
  const match = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
  if (match && match[2]) {
    const url = match[2];
    // Files uploaded via our site are in /uploads/
    if (url.startsWith("/uploads/")) {
      return `https://logsdb.com${url}`;
    }
    return url;
  }
  return null;
}

// Convert relative paths to full URLs
function resolveUrl(url: string): string {
  // Files uploaded via our site
  if (url.startsWith("/uploads/")) {
    return `https://logsdb.com${url}`;
  }
  // Other relative paths (GitHub)
  if (url.startsWith("/")) {
    return `https://github.com/logsdb1/logsdb${url}`;
  }
  return url;
}

// Render inline content with links
function renderInlineContent(text: string, keyPrefix: string) {
  // Match markdown links [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const linkText = match[1];
    const isUpload = match[2].startsWith("/uploads/");
    const linkUrl = resolveUrl(match[2]);
    const isFile = isUpload || linkText.match(/\.\w+$/);

    parts.push(
      <a
        key={`${keyPrefix}-link-${match.index}`}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-primary hover:underline"
        title={isUpload ? "Download file" : linkText}
      >
        {isFile && <FileText className="h-3 w-3" />}
        {linkText}
        <ExternalLink className="h-3 w-3" />
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

function renderBody(body: string) {
  // Split by code blocks first
  const parts = body.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
      return (
        <pre key={i} className="bg-muted rounded-lg p-4 overflow-x-auto my-4">
          <code className="text-sm">{code}</code>
        </pre>
      );
    }

    // Basic formatting
    return (
      <div key={i} className="prose dark:prose-invert max-w-none">
        {part.split("\n").map((line, j) => {
          const keyPrefix = `${i}-${j}`;
          if (line.startsWith("# ")) {
            return <h1 key={j} className="text-2xl font-bold mt-4 mb-2">{renderInlineContent(line.slice(2), keyPrefix)}</h1>;
          }
          if (line.startsWith("## ")) {
            return <h2 key={j} className="text-xl font-semibold mt-3 mb-2">{renderInlineContent(line.slice(3), keyPrefix)}</h2>;
          }
          if (line.startsWith("### ")) {
            return <h3 key={j} className="text-lg font-medium mt-2 mb-1">{renderInlineContent(line.slice(4), keyPrefix)}</h3>;
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            return <li key={j} className="ml-4">{renderInlineContent(line.slice(2), keyPrefix)}</li>;
          }
          if (line.trim() === "") {
            return <br key={j} />;
          }
          return <p key={j} className="my-1">{renderInlineContent(line, keyPrefix)}</p>;
        })}
      </div>
    );
  });
}

interface DiscussionClientProps {
  discussionId: string;
}

interface UploadedFile {
  url: string;
  filename: string;
  isImage: boolean;
  size: number;
}

export function DiscussionClient({ discussionId }: DiscussionClientProps) {
  const { data: session } = useSession();
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDiscussion() {
      try {
        const res = await fetch(`/api/community/discussions/${discussionId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError("Discussion not found");
          } else {
            setError("Failed to load discussion");
          }
          return;
        }
        const data = await res.json();
        setDiscussion(data.discussion);
      } catch {
        setError("Failed to load discussion");
      } finally {
        setLoading(false);
      }
    }

    fetchDiscussion();
  }, [discussionId]);

  // Load bookmark state from localStorage
  useEffect(() => {
    const bookmarks = JSON.parse(localStorage.getItem("discussionBookmarks") || "[]");
    setBookmarked(bookmarks.includes(discussionId));
  }, [discussionId]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem("discussionBookmarks") || "[]");
    let newBookmarks;
    if (bookmarked) {
      newBookmarks = bookmarks.filter((id: string) => id !== discussionId);
    } else {
      newBookmarks = [...bookmarks, discussionId];
    }
    localStorage.setItem("discussionBookmarks", JSON.stringify(newBookmarks));
    setBookmarked(!bookmarked);
  };

  const copyLink = async () => {
    const url = `https://logsdb.com/community/${discussionId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = () => {
    if (!discussion) return;
    const url = `https://logsdb.com/community/${discussion.number}`;
    const text = discussion.title;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareLinkedIn = () => {
    if (!discussion) return;
    const url = `https://logsdb.com/community/${discussion.number}`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !session) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/community/discussions/${discussionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });

      if (res.ok) {
        const data = await res.json();
        // Add the new comment to the list
        setDiscussion((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            comments: {
              totalCount: prev.comments.totalCount + 1,
              nodes: [...prev.comments.nodes, data.comment],
            },
          };
        });
        setComment("");
        setUploadedFiles([]);
      }
    } catch {
      // Handle error silently
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !session) return;

    setUploading(true);
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

          const markdown = data.isImage
            ? `![${data.filename}](${data.url})`
            : `[${data.filename}](${data.url})`;

          setComment((prev) => prev + "\n\n" + markdown);
        }
      }
    } catch {
      // Handle error silently
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
    const file = uploadedFiles.find((f) => f.url === url);
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
    if (file) {
      const imagePattern = `![${file.filename}](${file.url})`;
      const linkPattern = `[${file.filename}](${file.url})`;
      setComment((prev) => prev.replace(imagePattern, "").replace(linkPattern, "").trim());
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading) {
    return (
      <div className="container py-10 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 bg-muted rounded" />
          <div className="h-8 w-2/3 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (error || !discussion) {
    return (
      <div className="container py-10 max-w-4xl">
        <Card>
          <CardContent className="py-10 text-center">
            <MessageSquare className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">{error || "Discussion not found"}</p>
            <Button variant="outline" asChild>
              <Link href="/community">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Community
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-4xl">
      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: discussion.title },
        ]}
        className="mb-6"
      />

      {/* Discussion Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="outline"
            className={`gap-1 ${getCategoryColor(discussion.category.slug)}`}
          >
            {getCategoryIcon(discussion.category.slug)}
            {discussion.category.name}
          </Badge>
          {discussion.answerChosenAt && (
            <Badge variant="outline" className="gap-1 bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="h-3 w-3" />
              Answered
            </Badge>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-4">{discussion.title}</h1>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            {discussion.author ? (
              <>
                <img
                  src={discussion.author.avatarUrl}
                  alt={discussion.author.login}
                  className="h-6 w-6 rounded-full"
                />
                <span>{discussion.author.login}</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>Unknown</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(discussion.createdAt)}</span>
          </div>
          <a
            href={discussion.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" />
            View on GitHub
          </a>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          {/* Bookmark Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleBookmark}
            className={bookmarked ? "text-primary" : ""}
          >
            {bookmarked ? (
              <BookmarkCheck className="h-4 w-4 mr-1" />
            ) : (
              <Bookmark className="h-4 w-4 mr-1" />
            )}
            {bookmarked ? "Saved" : "Save"}
          </Button>

          {/* Share Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="space-y-1">
                <button
                  onClick={copyLink}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={shareTwitter}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted"
                >
                  <Twitter className="h-4 w-4" />
                  Share on X
                </button>
                <button
                  onClick={shareLinkedIn}
                  className="flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded hover:bg-muted"
                >
                  <Linkedin className="h-4 w-4" />
                  Share on LinkedIn
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Discussion Body */}
      <Card className="mb-8">
        <CardContent className="py-6">
          {renderBody(discussion.body)}

          {/* Reactions for Discussion */}
          <div className="mt-6 pt-4 border-t">
            <Reactions
              subjectId={discussion.id}
              reactionGroups={discussion.reactionGroups}
            />
          </div>
        </CardContent>
      </Card>

      {/* Accepted Answer */}
      {discussion.answer && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Accepted Answer
          </h2>
          <Card className="border-green-500/30 bg-green-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 mb-3">
                {discussion.answer.author && (
                  <>
                    <img
                      src={discussion.answer.author.avatarUrl}
                      alt={discussion.answer.author.login}
                      className="h-6 w-6 rounded-full"
                    />
                    <span className="font-medium">
                      {discussion.answer.author.login}
                    </span>
                  </>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatDate(discussion.answer.createdAt)}
                </span>
              </div>
              {renderBody(discussion.answer.body)}
            </CardContent>
          </Card>

          {/* Create Log Type from Answer - Show for sample-requests category */}
          {discussion.category.slug === "sample-requests" && (
            <Card className="mt-4 bg-primary/5 border-primary/20">
              <CardContent className="py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Turn this into a Log Type</p>
                      <p className="text-sm text-muted-foreground">
                        Create a permanent log type entry from this sample
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link
                      href={`/contribute/new?from_discussion=${discussion.number}&answer=${encodeURIComponent(discussion.answer.body.slice(0, 1000))}&file=${encodeURIComponent(extractFileUrl(discussion.answer.body) || "")}`}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Log Type
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Comments */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Replies ({discussion.comments.totalCount})
        </h2>

        {discussion.comments.nodes.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground">
              No replies yet. Be the first to respond!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {discussion.comments.nodes.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-2 mb-3">
                    {c.author ? (
                      <>
                        <img
                          src={c.author.avatarUrl}
                          alt={c.author.login}
                          className="h-6 w-6 rounded-full"
                        />
                        <span className="font-medium">{c.author.login}</span>
                      </>
                    ) : (
                      <span className="font-medium">Unknown</span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                  {renderBody(c.body)}

                  {/* Reactions for Comment */}
                  <div className="mt-3 pt-3 border-t">
                    <Reactions
                      subjectId={c.id}
                      reactionGroups={c.reactionGroups}
                      size="sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Comment Form */}
      {session ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add a Reply</CardTitle>
            <CardDescription>
              Share your knowledge or ask for clarification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment}>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`relative mb-4 ${dragOver ? "ring-2 ring-primary ring-offset-2" : ""}`}
              >
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write your reply... (Markdown supported)"
                  className="min-h-[120px]"
                />
                {dragOver && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center rounded-md">
                    <div className="text-primary font-medium">Drop files here</div>
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="mb-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept=".jpg,.jpeg,.png,.gif,.webp,.txt,.log,.csv,.json,.pdf"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      disabled={uploading}
                    />
                    <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md hover:bg-muted transition-colors text-sm">
                      {uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      <span>{uploading ? "Uploading..." : "Attach"}</span>
                    </div>
                  </label>
                  <span className="text-xs text-muted-foreground">
                    Drag & drop or click to attach files (max 5MB)
                  </span>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.url}
                        className="flex items-center gap-2 px-2 py-1 bg-muted/50 rounded text-sm"
                      >
                        {file.isImage ? (
                          <ImageIcon className="h-3 w-3 text-blue-500" />
                        ) : (
                          <FileText className="h-3 w-3 text-orange-500" />
                        )}
                        <span className="truncate max-w-[150px]">{file.filename}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(file.url)}
                          className="p-0.5 hover:bg-muted rounded"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!comment.trim() || submitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Posting..." : "Post Reply"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground mb-4">
              Sign in with GitHub to reply to this discussion
            </p>
            <Button asChild>
              <Link href="/api/auth/signin">Sign in with GitHub</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
