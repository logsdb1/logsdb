"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Github,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  FileCode,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/breadcrumb";

interface LogPath {
  distro: string;
  path: string;
}

interface NewLogForm {
  // Technology info
  technologyId: string;
  technologyName: string;
  technologyDescription: string;
  technologyCategory: string;

  // Log type info
  logTypeId: string;
  logTypeName: string;
  logTypeDescription: string;

  // Paths
  linuxPaths: LogPath[];
  windowsPath: string;
  macPath: string;

  // Format
  example: string;
  structure: string;

  // Parsing
  grokPattern: string;
  regexPattern: string;

  // Additional
  additionalNotes: string;
}

const CATEGORIES = [
  "Web Server",
  "Database",
  "Operating System",
  "Container",
  "Cloud",
  "Security",
  "Network",
  "Application",
  "Other",
];

const EXISTING_TECHNOLOGIES = [
  { id: "nginx", name: "Nginx" },
  { id: "apache", name: "Apache" },
  { id: "linux", name: "Linux" },
  { id: "windows", name: "Windows" },
  { id: "docker", name: "Docker" },
  { id: "postgresql", name: "PostgreSQL" },
  { id: "mysql", name: "MySQL" },
];

interface DiscussionInfo {
  number: number;
  title: string;
  answer: string;
  fileUrl?: string;
}

function NewLogTypeForm() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [isNewTechnology, setIsNewTechnology] = useState(false);
  const [fromDiscussion, setFromDiscussion] = useState<DiscussionInfo | null>(null);
  const [form, setForm] = useState<NewLogForm>({
    technologyId: "",
    technologyName: "",
    technologyDescription: "",
    technologyCategory: "",
    logTypeId: "",
    logTypeName: "",
    logTypeDescription: "",
    linuxPaths: [{ distro: "Debian / Ubuntu", path: "" }],
    windowsPath: "",
    macPath: "",
    example: "",
    structure: "",
    grokPattern: "",
    regexPattern: "",
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
    prUrl?: string;
  } | null>(null);

  // Load discussion data from URL params
  useEffect(() => {
    const discussionNumber = searchParams.get("from_discussion");
    const answerContent = searchParams.get("answer");
    const fileUrl = searchParams.get("file");

    if (discussionNumber && answerContent) {
      // Pre-fill the example with the answer content
      const decodedAnswer = decodeURIComponent(answerContent);

      // Check if answer contains a file attachment link
      const fileMatch = decodedAnswer.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const hasFileAttachment = fileMatch && (fileMatch[2].includes("/uploads/") || fileMatch[1].match(/\.\w+$/));

      // Extract code blocks from the answer if present
      const codeBlockMatch = decodedAnswer.match(/```[\s\S]*?```/);

      let logExample = "";
      let notes = `Created from community discussion #${discussionNumber}\nhttps://github.com/logsdb1/logsdb/discussions/${discussionNumber}`;

      if (codeBlockMatch) {
        // If there's a code block, use that as the example
        logExample = codeBlockMatch[0].replace(/```\w*\n?/g, "").trim();
      } else if (hasFileAttachment && fileUrl) {
        // If there's a file attachment, add instructions
        logExample = `# File attachment from discussion\n# Please download the file and paste the log sample here:\n# ${decodeURIComponent(fileUrl)}`;
        notes += `\n\nFile attachment: ${decodeURIComponent(fileUrl)}`;
      } else if (!hasFileAttachment) {
        // Use the answer text directly (without file links)
        logExample = decodedAnswer.replace(/\[([^\]]+)\]\([^)]+\)/g, "").trim();
      }

      setFromDiscussion({
        number: parseInt(discussionNumber),
        title: `Discussion #${discussionNumber}`,
        answer: decodedAnswer,
        fileUrl: fileUrl ? decodeURIComponent(fileUrl) : undefined,
      });

      setForm((prev) => ({
        ...prev,
        example: logExample,
        additionalNotes: notes,
      }));
    }
  }, [searchParams]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addLinuxPath = () => {
    setForm((prev) => ({
      ...prev,
      linuxPaths: [...prev.linuxPaths, { distro: "", path: "" }],
    }));
  };

  const removeLinuxPath = (index: number) => {
    setForm((prev) => ({
      ...prev,
      linuxPaths: prev.linuxPaths.filter((_, i) => i !== index),
    }));
  };

  const updateLinuxPath = (index: number, field: "distro" | "path", value: string) => {
    setForm((prev) => ({
      ...prev,
      linuxPaths: prev.linuxPaths.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contribute/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isNewTechnology,
          ...form,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Pull Request created successfully!",
          prUrl: data.prUrl,
        });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to create Pull Request",
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: "An error occurred while submitting",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (status === "loading") {
    return (
      <div className="container py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  // Not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Sign in to Contribute</CardTitle>
              <CardDescription>
                Connect your GitHub account to add a new log type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Your contribution will be submitted as a Pull Request on GitHub,
                which will be reviewed before being merged.
              </p>
              <Button size="lg" onClick={() => signIn("github")}>
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[
          { label: "Contribute", href: "/contribute" },
          { label: "New Log Type" },
        ]}
        className="mb-6"
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileCode className="h-8 w-8" />
              Add New Log Type
            </h1>
            <p className="text-muted-foreground mt-1">
              Contribute a new log type to the database
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Github className="h-3 w-3" />
            {session?.user?.name}
          </Badge>
        </div>

        {/* From Discussion Banner */}
        {fromDiscussion && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Creating from Community Discussion</p>
                  <p className="text-sm text-muted-foreground">
                    {fromDiscussion.fileUrl
                      ? "Download the attached file and paste the log sample below."
                      : "The log sample has been pre-filled from the discussion answer."}
                  </p>
                </div>
                <div className="flex gap-2">
                  {fromDiscussion.fileUrl && (
                    <Button variant="default" size="sm" asChild>
                      <a
                        href={fromDiscussion.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileCode className="h-4 w-4 mr-1" />
                        Download File
                      </a>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/community/${fromDiscussion.number}`}
                      target="_blank"
                    >
                      View Discussion
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {submitStatus?.type === "success" && (
          <Card className="mb-6 border-green-500 bg-green-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">{submitStatus.message}</p>
                  {submitStatus.prUrl && (
                    <a
                      href={submitStatus.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      View Pull Request on GitHub
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {submitStatus?.type === "error" && (
          <Card className="mb-6 border-red-500 bg-red-500/10">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="font-medium">{submitStatus.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Technology Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Technology</CardTitle>
              <CardDescription>
                Choose an existing technology or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={!isNewTechnology ? "default" : "outline"}
                  onClick={() => setIsNewTechnology(false)}
                >
                  Existing Technology
                </Button>
                <Button
                  type="button"
                  variant={isNewTechnology ? "default" : "outline"}
                  onClick={() => setIsNewTechnology(true)}
                >
                  New Technology
                </Button>
              </div>

              {!isNewTechnology ? (
                <div className="space-y-2">
                  <Label>Select Technology</Label>
                  <Select
                    value={form.technologyId}
                    onValueChange={(v) => handleSelectChange("technologyId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a technology..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EXISTING_TECHNOLOGIES.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="technologyId">Technology ID</Label>
                      <Input
                        id="technologyId"
                        name="technologyId"
                        placeholder="e.g., redis"
                        value={form.technologyId}
                        onChange={handleChange}
                        required={isNewTechnology}
                      />
                      <p className="text-xs text-muted-foreground">
                        Lowercase, no spaces (used in URLs)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="technologyName">Technology Name</Label>
                      <Input
                        id="technologyName"
                        name="technologyName"
                        placeholder="e.g., Redis"
                        value={form.technologyName}
                        onChange={handleChange}
                        required={isNewTechnology}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="technologyDescription">Description</Label>
                    <Textarea
                      id="technologyDescription"
                      name="technologyDescription"
                      placeholder="Brief description of the technology..."
                      value={form.technologyDescription}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={form.technologyCategory}
                      onValueChange={(v) => handleSelectChange("technologyCategory", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Log Type Info */}
          <Card>
            <CardHeader>
              <CardTitle>Log Type Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="logTypeId">Log Type ID *</Label>
                  <Input
                    id="logTypeId"
                    name="logTypeId"
                    placeholder="e.g., access, error, slow-query"
                    value={form.logTypeId}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logTypeName">Log Type Name *</Label>
                  <Input
                    id="logTypeName"
                    name="logTypeName"
                    placeholder="e.g., Access Log, Error Log"
                    value={form.logTypeName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="logTypeDescription">Description *</Label>
                <Textarea
                  id="logTypeDescription"
                  name="logTypeDescription"
                  placeholder="What does this log record? When is it useful?"
                  value={form.logTypeDescription}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Log Paths */}
          <Card>
            <CardHeader>
              <CardTitle>Log File Paths</CardTitle>
              <CardDescription>
                Where can this log be found on different systems?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Linux Paths</Label>
                {form.linuxPaths.map((lp, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Distro (e.g., Debian / Ubuntu)"
                      value={lp.distro}
                      onChange={(e) => updateLinuxPath(index, "distro", e.target.value)}
                      className="w-1/3"
                    />
                    <Input
                      placeholder="/var/log/..."
                      value={lp.path}
                      onChange={(e) => updateLinuxPath(index, "path", e.target.value)}
                      className="flex-1"
                    />
                    {form.linuxPaths.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLinuxPath(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLinuxPath}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Linux Path
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="windowsPath">Windows Path</Label>
                  <Input
                    id="windowsPath"
                    name="windowsPath"
                    placeholder="C:\..."
                    value={form.windowsPath}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="macPath">macOS Path</Label>
                  <Input
                    id="macPath"
                    name="macPath"
                    placeholder="/var/log/..."
                    value={form.macPath}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Log Format */}
          <Card>
            <CardHeader>
              <CardTitle>Log Format</CardTitle>
              <CardDescription>
                Provide an example and explain the structure
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="example">Example Log Entry *</Label>
                <Textarea
                  id="example"
                  name="example"
                  placeholder="Paste a real log example here..."
                  value={form.example}
                  onChange={handleChange}
                  rows={4}
                  className="font-mono text-sm"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="structure">Structure / Format</Label>
                <Textarea
                  id="structure"
                  name="structure"
                  placeholder="$field1 $field2 [$timestamp] ..."
                  value={form.structure}
                  onChange={handleChange}
                  rows={2}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Parsing Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Parsing Patterns</CardTitle>
              <CardDescription>
                Add patterns for log parsing (optional but helpful)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="grokPattern">Grok Pattern</Label>
                <Textarea
                  id="grokPattern"
                  name="grokPattern"
                  placeholder="%{IPORHOST:client_ip} ..."
                  value={form.grokPattern}
                  onChange={handleChange}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regexPattern">Regex Pattern</Label>
                <Textarea
                  id="regexPattern"
                  name="regexPattern"
                  placeholder="^(\S+) (\S+) ..."
                  value={form.regexPattern}
                  onChange={handleChange}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                placeholder="Any other context, sources, or notes for reviewers..."
                value={form.additionalNotes}
                onChange={handleChange}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" asChild>
              <Link href="/contribute">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating PR...
                </>
              ) : (
                <>
                  <Github className="mr-2 h-4 w-4" />
                  Submit Pull Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NewLogTypePage() {
  return (
    <Suspense
      fallback={
        <div className="container py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <NewLogTypeForm />
    </Suspense>
  );
}
