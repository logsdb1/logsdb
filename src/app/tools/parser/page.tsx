"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Play,
  Copy,
  Check,
  AlertCircle,
  Braces,
  FileText,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/breadcrumb";

interface ParsedField {
  name: string;
  value: string;
  index: number;
}

interface PresetPattern {
  id: string;
  name: string;
  technology: string;
  logType: string;
  regex: string;
  example: string;
}

const PRESET_PATTERNS: PresetPattern[] = [
  {
    id: "nginx-combined",
    name: "Nginx Combined",
    technology: "nginx",
    logType: "access",
    regex: '^(?<client_ip>\\S+) - (?<user>\\S+) \\[(?<timestamp>[^\\]]+)\\] "(?<method>\\S+) (?<path>\\S+) (?<protocol>[^"]+)" (?<status>\\d+) (?<bytes>\\d+) "(?<referrer>[^"]*)" "(?<user_agent>[^"]*)"',
    example: '192.168.1.1 - - [25/Dec/2025:10:15:30 +0000] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0"',
  },
  {
    id: "apache-combined",
    name: "Apache Combined",
    technology: "apache",
    logType: "access",
    regex: '^(?<client_ip>\\S+) (?<ident>\\S+) (?<user>\\S+) \\[(?<timestamp>[^\\]]+)\\] "(?<method>\\S+) (?<path>\\S+) (?<protocol>[^"]+)" (?<status>\\d+) (?<bytes>\\S+) "(?<referrer>[^"]*)" "(?<user_agent>[^"]*)"',
    example: '192.168.1.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 "http://www.example.com/start.html" "Mozilla/4.08"',
  },
  {
    id: "syslog-rfc3164",
    name: "Syslog RFC3164",
    technology: "linux",
    logType: "syslog",
    regex: '^(?<timestamp>\\w{3}\\s+\\d{1,2} \\d{2}:\\d{2}:\\d{2}) (?<hostname>\\S+) (?<process>[^\\[]+)\\[(?<pid>\\d+)\\]: (?<message>.*)$',
    example: 'Dec 25 10:15:30 myserver sshd[12345]: Accepted password for user from 192.168.1.100 port 22 ssh2',
  },
  {
    id: "json-log",
    name: "JSON Log",
    technology: "generic",
    logType: "json",
    regex: '^\\{.*\\}$',
    example: '{"timestamp":"2025-12-25T10:15:30Z","level":"INFO","message":"User logged in","user_id":123}',
  },
];

export default function ParserPage() {
  const [logInput, setLogInput] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [parseMode, setParseMode] = useState<"regex" | "json">("regex");

  const parseLog = () => {
    setError(null);
    setParsedFields([]);

    if (!logInput.trim()) {
      setError("Please enter a log entry");
      return;
    }

    if (parseMode === "json") {
      try {
        const parsed = JSON.parse(logInput);
        const fields: ParsedField[] = Object.entries(parsed).map(
          ([key, value], index) => ({
            name: key,
            value: typeof value === "object" ? JSON.stringify(value) : String(value),
            index,
          })
        );
        setParsedFields(fields);
      } catch (e) {
        setError("Invalid JSON format");
      }
      return;
    }

    if (!regexPattern.trim()) {
      setError("Please enter a regex pattern");
      return;
    }

    try {
      const regex = new RegExp(regexPattern);
      const match = logInput.match(regex);

      if (!match) {
        setError("Pattern did not match the log entry");
        return;
      }

      const fields: ParsedField[] = [];

      // Named groups
      if (match.groups) {
        Object.entries(match.groups).forEach(([name, value], index) => {
          if (value !== undefined) {
            fields.push({ name, value, index });
          }
        });
      }

      // Numbered groups (if no named groups)
      if (fields.length === 0 && match.length > 1) {
        for (let i = 1; i < match.length; i++) {
          if (match[i] !== undefined) {
            fields.push({ name: `group_${i}`, value: match[i], index: i - 1 });
          }
        }
      }

      if (fields.length === 0) {
        fields.push({ name: "match", value: match[0], index: 0 });
      }

      setParsedFields(fields);
    } catch (e: any) {
      setError(`Invalid regex: ${e.message}`);
    }
  };

  const loadPreset = (presetId: string) => {
    const preset = PRESET_PATTERNS.find((p) => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      setRegexPattern(preset.regex);
      setLogInput(preset.example);
      setParseMode("regex");
      setParsedFields([]);
      setError(null);
    }
  };

  const copyResults = () => {
    const text = parsedFields
      .map((f) => `${f.name}: ${f.value}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAsJson = () => {
    const obj: Record<string, string> = {};
    parsedFields.forEach((f) => {
      obj[f.name] = f.value;
    });
    const text = JSON.stringify(obj, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[
          { label: "Tools", href: "/tools" },
          { label: "Log Parser" },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Braces className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Log Parser</h1>
            <p className="text-muted-foreground">
              Test regex patterns and parse logs in real-time
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Preset Patterns */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Quick Start
              </CardTitle>
              <CardDescription>
                Load a preset pattern or enter your own
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPreset} onValueChange={loadPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a preset pattern..." />
                </SelectTrigger>
                <SelectContent>
                  {PRESET_PATTERNS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name} ({preset.technology})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Parse Mode */}
          <Tabs value={parseMode} onValueChange={(v) => setParseMode(v as "regex" | "json")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regex">Regex Pattern</TabsTrigger>
              <TabsTrigger value="json">JSON Parse</TabsTrigger>
            </TabsList>

            <TabsContent value="regex" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Regex Pattern</CardTitle>
                  <CardDescription>
                    Use named groups like (?&lt;field_name&gt;...) to extract fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="^(?<ip>\S+) - (?<user>\S+) \[(?<time>[^\]]+)\]..."
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="json" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    JSON logs will be automatically parsed into fields.
                    Just paste your JSON log below.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Log Input */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Log Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your log entry here..."
                value={logInput}
                onChange={(e) => setLogInput(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
              <Button onClick={parseLog} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Parse Log
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Extracted Fields</CardTitle>
                {parsedFields.length > 0 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyResults}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportAsJson}
                    >
                      Export JSON
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {parsedFields.length > 0 ? (
                <div className="space-y-2">
                  {parsedFields.map((field, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border"
                    >
                      <Badge variant="secondary" className="shrink-0 font-mono">
                        {field.name}
                      </Badge>
                      <code className="text-sm break-all">{field.value}</code>
                    </div>
                  ))}
                  <div className="pt-4 text-center text-sm text-muted-foreground">
                    {parsedFields.length} field{parsedFields.length > 1 ? "s" : ""} extracted
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Braces className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Parsed fields will appear here</p>
                  <p className="text-sm mt-1">
                    Enter a log and pattern, then click Parse
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
            <li>Use <code className="bg-muted px-1 rounded">(?&lt;name&gt;...)</code> for named capture groups</li>
            <li>Use <code className="bg-muted px-1 rounded">\S+</code> to match non-whitespace</li>
            <li>Use <code className="bg-muted px-1 rounded">[^\]]+</code> to match until a specific char</li>
            <li>Use <code className="bg-muted px-1 rounded">{'"([^"]*)"'}</code> to match quoted strings</li>
          </ul>
        </CardContent>
      </Card>

      {/* Link to log types */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground mb-2">
          Need patterns for specific log types?
        </p>
        <Button variant="outline" asChild>
          <Link href="/logs">Browse Log Types</Link>
        </Button>
      </div>
    </div>
  );
}
