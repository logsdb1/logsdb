"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Github,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/breadcrumb";

interface EditForm {
  description: string;
  defaultPath: string;
  example: string;
  structure: string;
  grokPattern: string;
  regexPattern: string;
  additionalNotes: string;
}

interface LogTypeData {
  technology: { id: string; name: string };
  logType: {
    id: string;
    name: string;
    description: string;
    defaultPath: string;
    example: string;
    structure: string;
    grokPattern: string;
    regexPattern: string;
  };
}

export default function EditLogTypePage() {
  const params = useParams<{ technology: string; logType: string }>();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [logTypeData, setLogTypeData] = useState<LogTypeData | null>(null);
  const [form, setForm] = useState<EditForm>({
    description: "",
    defaultPath: "",
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
  const [activeTab, setActiveTab] = useState("edit");

  const technology = params.technology;
  const logType = params.logType;

  // Fetch existing data
  useEffect(() => {
    if (technology && logType) {
      fetch(`/api/logs/${technology}/${logType}`)
        .then((res) => res.json())
        .then((data) => {
          setLogTypeData(data);
          setForm({
            description: data.logType.description || "",
            defaultPath: data.logType.defaultPath || "",
            example: data.logType.example || "",
            structure: data.logType.structure || "",
            grokPattern: data.logType.grokPattern || "",
            regexPattern: data.logType.regexPattern || "",
            additionalNotes: "",
          });
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [technology, logType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technology || !logType || !logTypeData) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    // Only send fields that were actually changed
    const changedFields: Partial<EditForm> = {};
    if (form.description !== logTypeData.logType.description) {
      changedFields.description = form.description;
    }
    if (form.example !== logTypeData.logType.example) {
      changedFields.example = form.example;
    }
    if (form.structure !== logTypeData.logType.structure) {
      changedFields.structure = form.structure;
    }
    if (form.grokPattern !== logTypeData.logType.grokPattern) {
      changedFields.grokPattern = form.grokPattern;
    }
    if (form.regexPattern !== logTypeData.logType.regexPattern) {
      changedFields.regexPattern = form.regexPattern;
    }
    if (form.additionalNotes) {
      changedFields.additionalNotes = form.additionalNotes;
    }

    // Check if any fields were changed
    if (Object.keys(changedFields).filter(k => k !== 'additionalNotes').length === 0) {
      setSubmitStatus({
        type: "error",
        message: "No changes detected. Please modify at least one field.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/contribute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          technology,
          logType,
          changes: changedFields,
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
        message: "An error occurred while submitting your changes",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading data
  if (isLoading || status === "loading") {
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
                Connect your GitHub account to suggest changes to{" "}
                <strong>
                  {logTypeData?.technology.name || technology} {logTypeData?.logType.name || logType}
                </strong>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Your changes will be submitted as a Pull Request on GitHub,
                which will be reviewed before being merged into the
                documentation.
              </p>
              <Button size="lg" onClick={() => signIn("github")}>
                <Github className="mr-2 h-5 w-5" />
                Sign in with GitHub
              </Button>
              <p className="text-xs text-muted-foreground">
                We only request access to create pull requests on your behalf.
              </p>
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
          { label: "Logs", href: "/logs" },
          {
            label: technology,
            href: `/logs/${technology}`,
          },
          {
            label: logType,
            href: `/logs/${technology}/${logType}`,
          },
          { label: "Edit" },
        ]}
        className="mb-6"
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">
              Edit {technology} {logType}
            </h1>
            <p className="text-muted-foreground mt-1">
              Suggest improvements to this documentation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Github className="h-3 w-3" />
              {session?.user?.name}
            </Badge>
          </div>
        </div>

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
                <Button variant="outline" size="sm" asChild>
                  <Link
                    href={`/logs/${technology}/${logType}`}
                  >
                    Back to page
                  </Link>
                </Button>
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of this log type..."
                      value={form.description}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultPath">Default Path (Linux)</Label>
                    <Input
                      id="defaultPath"
                      name="defaultPath"
                      placeholder="/var/log/..."
                      value={form.defaultPath}
                      onChange={handleChange}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Log Example */}
              <Card>
                <CardHeader>
                  <CardTitle>Log Example</CardTitle>
                  <CardDescription>
                    Provide a real example of this log format
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="example">Example Log Entry</Label>
                    <Textarea
                      id="example"
                      name="example"
                      placeholder="Paste a real log example here..."
                      value={form.example}
                      onChange={handleChange}
                      rows={4}
                      className="font-mono text-sm"
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
                    Add or update parsing patterns
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
                  <CardDescription>
                    Any other information or context for reviewers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="additionalNotes"
                    name="additionalNotes"
                    placeholder="Explain your changes, why they are needed, etc..."
                    value={form.additionalNotes}
                    onChange={handleChange}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4">
                <Button variant="outline" asChild>
                  <Link
                    href={`/logs/${technology}/${logType}`}
                  >
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
                      <Save className="mr-2 h-4 w-4" />
                      Submit Pull Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is a preview of your suggested changes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {form.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground">{form.description}</p>
                  </div>
                )}
                {form.defaultPath && (
                  <div>
                    <h3 className="font-semibold mb-2">Default Path</h3>
                    <code className="bg-muted px-2 py-1 rounded">
                      {form.defaultPath}
                    </code>
                  </div>
                )}
                {form.example && (
                  <div>
                    <h3 className="font-semibold mb-2">Log Example</h3>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {form.example}
                    </pre>
                  </div>
                )}
                {form.grokPattern && (
                  <div>
                    <h3 className="font-semibold mb-2">Grok Pattern</h3>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {form.grokPattern}
                    </pre>
                  </div>
                )}
                {form.regexPattern && (
                  <div>
                    <h3 className="font-semibold mb-2">Regex Pattern</h3>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      {form.regexPattern}
                    </pre>
                  </div>
                )}
                {!form.description &&
                  !form.example &&
                  !form.grokPattern &&
                  !form.regexPattern && (
                    <p className="text-muted-foreground text-center py-8">
                      Fill in the form to see a preview of your changes
                    </p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
