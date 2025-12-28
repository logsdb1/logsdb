"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Regex,
  Copy,
  Check,
  AlertCircle,
  BookOpen,
  Sparkles,
  Code,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Zap,
  FileText,
  Wand2,
  MousePointerClick,
  X,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Regex token types for syntax highlighting
type TokenType =
  | "literal"
  | "escape"
  | "quantifier"
  | "anchor"
  | "group"
  | "charClass"
  | "alternation"
  | "special"
  | "namedGroup"
  | "backreference"
  | "error";

interface Token {
  type: TokenType;
  value: string;
  start: number;
  end: number;
  description?: string;
}

// Common regex patterns library
const patternLibrary = [
  {
    category: "Network",
    patterns: [
      { name: "IPv4 Address", pattern: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}", description: "Matches IPv4 addresses" },
      { name: "IPv4 with Port", pattern: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}:\\d{1,5}", description: "IPv4 with port number" },
      { name: "IPv6 Address", pattern: "(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}", description: "Full IPv6 addresses" },
      { name: "CIDR Notation", pattern: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}/\\d{1,2}", description: "CIDR network notation" },
      { name: "MAC Address", pattern: "(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}", description: "MAC addresses" },
      { name: "URL", pattern: "https?://[^\\s\"'<>]+", description: "HTTP/HTTPS URLs" },
      { name: "Domain Name", pattern: "(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,}", description: "Domain names" },
      { name: "Port Number", pattern: ":\\d{1,5}\\b", description: "Port numbers" },
    ],
  },
  {
    category: "Web Server Logs",
    patterns: [
      { name: "Nginx Combined", pattern: '(?<ip>\\S+) - (?<user>\\S+) \\[(?<time>[^\\]]+)\\] "(?<request>[^"]+)" (?<status>\\d+) (?<bytes>\\d+)', description: "Nginx combined log format" },
      { name: "Nginx Error", pattern: "(?<time>\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(?<level>\\w+)\\] (?<pid>\\d+)#(?<tid>\\d+): (?<message>.*)", description: "Nginx error log format" },
      { name: "Apache Combined", pattern: '(?<ip>\\S+) \\S+ (?<user>\\S+) \\[(?<time>[^\\]]+)\\] "(?<request>[^"]+)" (?<status>\\d+) (?<bytes>\\d+) "(?<referer>[^"]*)" "(?<agent>[^"]*)"', description: "Apache combined log format" },
      { name: "Apache Error", pattern: "\\[(?<time>[^\\]]+)\\] \\[(?<module>[^\\]]+)\\] \\[pid (?<pid>\\d+)\\] (?<message>.*)", description: "Apache error log format" },
      { name: "HTTP Request Line", pattern: '(?<method>GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS) (?<path>\\S+) HTTP/(?<version>[\\d.]+)', description: "HTTP request line" },
      { name: "HTTP Status Code", pattern: "\\b[1-5]\\d{2}\\b", description: "HTTP status codes" },
      { name: "User Agent", pattern: '"(?<agent>Mozilla[^"]+)"', description: "Browser user agents" },
      { name: "Referer", pattern: '"https?://[^"]+"', description: "HTTP referer header" },
    ],
  },
  {
    category: "System Logs",
    patterns: [
      { name: "Syslog BSD", pattern: "<(?<priority>\\d+)>(?<timestamp>\\w{3} +\\d{1,2} \\d{2}:\\d{2}:\\d{2}) (?<host>\\S+) (?<process>[^:]+): (?<message>.*)", description: "BSD syslog format" },
      { name: "Syslog RFC5424", pattern: "<(?<pri>\\d+)>(?<ver>\\d+) (?<ts>\\S+) (?<host>\\S+) (?<app>\\S+) (?<pid>\\S+) (?<mid>\\S+) (?<msg>.*)", description: "RFC5424 syslog format" },
      { name: "Journald", pattern: "(?<month>\\w{3}) (?<day>\\d{2}) (?<time>\\d{2}:\\d{2}:\\d{2}) (?<host>\\S+) (?<unit>[^\\[]+)\\[(?<pid>\\d+)\\]: (?<message>.*)", description: "Systemd journal format" },
      { name: "Kernel Log", pattern: "\\[\\s*(?<uptime>[\\d.]+)\\] (?<message>.*)", description: "Linux kernel log (dmesg)" },
      { name: "Auth Log", pattern: "(?<process>\\w+)\\[(?<pid>\\d+)\\]: (?<message>.*)", description: "Authentication log format" },
      { name: "Cron Log", pattern: "\\((?<user>\\w+)\\) CMD \\((?<command>.*)\\)", description: "Cron job execution" },
      { name: "SSH Login", pattern: "Accepted (?<method>\\w+) for (?<user>\\S+) from (?<ip>\\S+) port (?<port>\\d+)", description: "SSH successful login" },
      { name: "SSH Failed", pattern: "Failed (?<method>\\w+) for (?<user>\\S+) from (?<ip>\\S+) port (?<port>\\d+)", description: "SSH failed login" },
    ],
  },
  {
    category: "Application Logs",
    patterns: [
      { name: "Java Exception", pattern: "(?<exception>[a-zA-Z.]+Exception): (?<message>.*)", description: "Java exception format" },
      { name: "Java Stack Trace", pattern: "\\tat (?<class>[^(]+)\\((?<file>[^:]+):(?<line>\\d+)\\)", description: "Java stack trace line" },
      { name: "Python Traceback", pattern: 'File "(?<file>[^"]+)", line (?<line>\\d+), in (?<func>\\w+)', description: "Python traceback format" },
      { name: "Node.js Error", pattern: "at (?<func>[^(]+) \\((?<file>[^:]+):(?<line>\\d+):(?<col>\\d+)\\)", description: "Node.js stack trace" },
      { name: "Go Panic", pattern: "panic: (?<message>.*)", description: "Go panic message" },
      { name: "Log4j Pattern", pattern: "(?<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2},\\d{3}) (?<level>\\w+) +\\[(?<thread>[^\\]]+)\\] (?<class>\\S+) - (?<message>.*)", description: "Log4j default pattern" },
      { name: "Spring Boot", pattern: "(?<time>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z)\\s+(?<level>\\w+) (?<pid>\\d+) --- \\[(?<thread>[^\\]]+)\\] (?<class>\\S+)\\s+: (?<message>.*)", description: "Spring Boot log format" },
    ],
  },
  {
    category: "Database Logs",
    patterns: [
      { name: "MySQL General", pattern: "(?<time>\\d{6} \\d{2}:\\d{2}:\\d{2})\\s+(?<id>\\d+) (?<command>\\w+)\\s+(?<argument>.*)", description: "MySQL general log" },
      { name: "MySQL Slow Query", pattern: "# Query_time: (?<query_time>[\\d.]+)\\s+Lock_time: (?<lock_time>[\\d.]+)\\s+Rows_sent: (?<rows_sent>\\d+)\\s+Rows_examined: (?<rows_examined>\\d+)", description: "MySQL slow query log" },
      { name: "PostgreSQL", pattern: "(?<time>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}.\\d+ \\w+) \\[(?<pid>\\d+)\\] (?<level>\\w+):\\s+(?<message>.*)", description: "PostgreSQL log format" },
      { name: "MongoDB", pattern: '(?<time>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+[+-]\\d{4}) (?<severity>\\w) (?<component>\\w+)\\s+\\[(?<context>[^\\]]+)\\] (?<message>.*)', description: "MongoDB log format" },
      { name: "Redis", pattern: "(?<pid>\\d+):(?<role>[XCSM]) (?<time>\\d{2} \\w+ \\d{4} \\d{2}:\\d{2}:\\d{2}.\\d+) (?<level>[.\\-*#]) (?<message>.*)", description: "Redis log format" },
      { name: "SQL Query", pattern: "(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\\s+.*", description: "SQL statements" },
    ],
  },
  {
    category: "Container & Cloud",
    patterns: [
      { name: "Docker Log", pattern: '(?<time>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z) (?<stream>stdout|stderr) (?<flag>[FP]) (?<message>.*)', description: "Docker JSON log format" },
      { name: "Kubernetes Event", pattern: "(?<time>\\S+)\\s+(?<type>\\w+)\\s+(?<reason>\\w+)\\s+(?<object>\\S+)\\s+(?<message>.*)", description: "Kubernetes event format" },
      { name: "AWS CloudTrail", pattern: '"eventName":\\s*"(?<event>[^"]+)"', description: "AWS CloudTrail event name" },
      { name: "AWS Request ID", pattern: "RequestId: (?<request_id>[a-f0-9-]+)", description: "AWS Lambda request ID" },
      { name: "Container ID", pattern: "[a-f0-9]{12,64}", description: "Docker container IDs" },
      { name: "K8s Pod Name", pattern: "(?<name>[a-z0-9-]+)-(?<hash>[a-z0-9]{5,10})-(?<id>[a-z0-9]{5})", description: "Kubernetes pod name" },
    ],
  },
  {
    category: "Timestamps",
    patterns: [
      { name: "ISO 8601", pattern: "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})?", description: "ISO 8601 timestamp" },
      { name: "Unix Timestamp", pattern: "\\b1[0-9]{9}\\b", description: "Unix epoch seconds" },
      { name: "Unix Millis", pattern: "\\b1[0-9]{12}\\b", description: "Unix epoch milliseconds" },
      { name: "Common Log Format", pattern: "\\d{2}/\\w{3}/\\d{4}:\\d{2}:\\d{2}:\\d{2} [+-]\\d{4}", description: "CLF timestamp" },
      { name: "Syslog Timestamp", pattern: "\\w{3}\\s+\\d{1,2} \\d{2}:\\d{2}:\\d{2}", description: "BSD syslog timestamp" },
      { name: "MySQL Timestamp", pattern: "\\d{6} \\d{2}:\\d{2}:\\d{2}", description: "MySQL timestamp format" },
      { name: "Date YYYY-MM-DD", pattern: "\\d{4}-\\d{2}-\\d{2}", description: "ISO date format" },
      { name: "Date DD/MM/YYYY", pattern: "\\d{2}/\\d{2}/\\d{4}", description: "European date format" },
      { name: "Time HH:MM:SS", pattern: "\\d{2}:\\d{2}:\\d{2}", description: "24-hour time format" },
      { name: "Time with MS", pattern: "\\d{2}:\\d{2}:\\d{2}[.,]\\d{3}", description: "Time with milliseconds" },
    ],
  },
  {
    category: "Security",
    patterns: [
      { name: "JWT Token", pattern: "eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+", description: "JSON Web Token" },
      { name: "API Key", pattern: "(?:api[_-]?key|apikey)[=:]\\s*['\"]?([A-Za-z0-9_-]{20,})['\"]?", description: "API key patterns" },
      { name: "Bearer Token", pattern: "Bearer\\s+[A-Za-z0-9_-]+", description: "Bearer authentication" },
      { name: "Basic Auth", pattern: "Basic\\s+[A-Za-z0-9+/=]+", description: "Basic authentication" },
      { name: "SHA256 Hash", pattern: "[a-fA-F0-9]{64}", description: "SHA256 hash values" },
      { name: "MD5 Hash", pattern: "[a-fA-F0-9]{32}", description: "MD5 hash values" },
      { name: "Credit Card", pattern: "\\b(?:\\d{4}[- ]?){3}\\d{4}\\b", description: "Credit card numbers" },
      { name: "SSN (US)", pattern: "\\b\\d{3}-\\d{2}-\\d{4}\\b", description: "US Social Security Number" },
    ],
  },
  {
    category: "Data Formats",
    patterns: [
      { name: "Email", pattern: "[\\w.+-]+@[\\w.-]+\\.[a-zA-Z]{2,}", description: "Email addresses" },
      { name: "UUID", pattern: "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}", description: "UUID format" },
      { name: "Phone (Intl)", pattern: "\\+?\\d{1,3}[-.\\s]?\\(?\\d{1,4}\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}", description: "International phone" },
      { name: "Hex Color", pattern: "#[0-9A-Fa-f]{3,8}\\b", description: "Hex color codes" },
      { name: "Semantic Version", pattern: "\\bv?\\d+\\.\\d+\\.\\d+(?:-[\\w.]+)?(?:\\+[\\w.]+)?\\b", description: "SemVer format" },
      { name: "File Path (Unix)", pattern: "(?:/[\\w.-]+)+/?", description: "Unix file paths" },
      { name: "File Path (Windows)", pattern: "[A-Za-z]:\\\\(?:[\\w.-]+\\\\)*[\\w.-]*", description: "Windows file paths" },
      { name: "JSON Object", pattern: "\\{[^{}]*\\}", description: "Simple JSON objects" },
      { name: "JSON Array", pattern: "\\[[^\\[\\]]*\\]", description: "Simple JSON arrays" },
      { name: "Quoted String", pattern: '"[^"\\\\]*(?:\\\\.[^"\\\\]*)*"', description: "Double-quoted strings" },
      { name: "Key=Value", pattern: "(?<key>\\w+)=(?<value>[^\\s,]+)", description: "Key-value pairs" },
    ],
  },
];

// Regex syntax reference
const syntaxReference = [
  {
    category: "Character Classes",
    items: [
      { symbol: "\\d", description: "Digit [0-9]" },
      { symbol: "\\w", description: "Word [a-zA-Z0-9_]" },
      { symbol: "\\s", description: "Whitespace" },
      { symbol: "\\S", description: "Non-whitespace" },
      { symbol: ".", description: "Any character" },
      { symbol: "[abc]", description: "Character set" },
    ],
  },
  {
    category: "Quantifiers",
    items: [
      { symbol: "*", description: "0 or more" },
      { symbol: "+", description: "1 or more" },
      { symbol: "?", description: "0 or 1" },
      { symbol: "{n}", description: "Exactly n" },
      { symbol: "{n,m}", description: "n to m times" },
    ],
  },
  {
    category: "Anchors",
    items: [
      { symbol: "^", description: "Start of line" },
      { symbol: "$", description: "End of line" },
      { symbol: "\\b", description: "Word boundary" },
    ],
  },
  {
    category: "Groups",
    items: [
      { symbol: "(abc)", description: "Capture group" },
      { symbol: "(?:abc)", description: "Non-capture" },
      { symbol: "(?<n>abc)", description: "Named group" },
      { symbol: "a|b", description: "Alternation" },
    ],
  },
];

// Code export templates
const codeTemplates: Record<string, (p: string, f: string) => string> = {
  javascript: (pattern, flags) => `const regex = /${pattern.replace(/\//g, "\\/")}/${flags};
const matches = text.matchAll(regex);
for (const m of matches) console.log(m[0], m.groups);`,

  python: (pattern, flags) => `import re
pattern = r'${pattern}'
for m in re.finditer(pattern, text${flags.includes("i") ? ", re.IGNORECASE" : ""}):
    print(m.group(), m.groupdict())`,

  go: (pattern) => `re := regexp.MustCompile(\`${pattern}\`)
matches := re.FindAllStringSubmatch(text, -1)`,

  grok: (pattern) => `# Logstash grok filter
filter { grok { match => { "message" => "${pattern}" } } }`,
};

// Generation modes - VARIABLES FIRST, exact last
type GenerationMode = "smart" | "digits" | "word" | "nonspace" | "ip" | "status" | "method" | "path" | "date" | "time" | "any" | "exact";

interface GenerationOption {
  mode: GenerationMode;
  label: string;
  pattern: string;
  description: string;
  detect?: (text: string) => boolean;
  generate?: (text: string) => string;
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Ordered by priority - variables first, exact last
const generationOptions: GenerationOption[] = [
  {
    mode: "smart",
    label: "Smart",
    pattern: "auto",
    description: "Auto-detect best pattern",
  },
  {
    mode: "ip",
    label: "IP",
    pattern: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}",
    description: "IPv4 address",
    detect: (t) => /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(t),
  },
  {
    mode: "status",
    label: "Status",
    pattern: "[1-5]\\d{2}",
    description: "HTTP status code",
    detect: (t) => /^[1-5]\d{2}$/.test(t),
  },
  {
    mode: "method",
    label: "Method",
    pattern: "(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)",
    description: "HTTP method",
    detect: (t) => /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)$/.test(t),
  },
  {
    mode: "path",
    label: "Path",
    pattern: "/[^\\s\"]*",
    description: "URL path",
    detect: (t) => /^\/\S*$/.test(t),
  },
  {
    mode: "date",
    label: "Date",
    pattern: "\\d{2}/\\w{3}/\\d{4}",
    description: "Date pattern",
    detect: (t) => /^\d{2}\/\w{3}\/\d{4}/.test(t),
    generate: (t) => {
      if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return "\\d{4}-\\d{2}-\\d{2}";
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(t)) return "\\d{2}/\\d{2}/\\d{4}";
      return "\\d{2}/\\w{3}/\\d{4}";
    },
  },
  {
    mode: "time",
    label: "Time",
    pattern: "\\d{2}:\\d{2}:\\d{2}",
    description: "Time HH:MM:SS",
    detect: (t) => /^\d{2}:\d{2}:\d{2}$/.test(t),
  },
  {
    mode: "digits",
    label: "\\d+",
    pattern: "\\d+",
    description: "Any digits",
    detect: (t) => /^\d+$/.test(t),
  },
  {
    mode: "word",
    label: "\\w+",
    pattern: "\\w+",
    description: "Word characters",
    detect: (t) => /^\w+$/.test(t) && /[a-zA-Z]/.test(t),
  },
  {
    mode: "nonspace",
    label: "\\S+",
    pattern: "\\S+",
    description: "Non-whitespace",
    detect: (t) => /^\S+$/.test(t),
  },
  {
    mode: "any",
    label: ".*",
    pattern: ".*",
    description: "Match anything",
  },
  {
    mode: "exact",
    label: "Exact",
    pattern: "literal",
    description: "Exact text (escaped)",
    generate: escapeRegex,
  },
];

// Analyze text and generate a smart regex pattern
function analyzeAndGeneratePattern(text: string): string {
  if (!text) return ".*";

  const parts: string[] = [];
  let i = 0;

  while (i < text.length) {
    const remaining = text.slice(i);

    // Check for common patterns first

    // IPv4 address
    const ipMatch = remaining.match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
    if (ipMatch) {
      parts.push("\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}");
      i += ipMatch[1].length;
      continue;
    }

    // HTTP method
    const methodMatch = remaining.match(/^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/);
    if (methodMatch) {
      parts.push("(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)");
      i += methodMatch[1].length;
      continue;
    }

    // HTTP version
    const httpMatch = remaining.match(/^(HTTP\/\d\.\d)/);
    if (httpMatch) {
      parts.push("HTTP/\\d\\.\\d");
      i += httpMatch[1].length;
      continue;
    }

    // HTTP status code (3 digits starting with 1-5)
    const statusMatch = remaining.match(/^([1-5]\d{2})(?:\s|$)/);
    if (statusMatch) {
      parts.push("[1-5]\\d{2}");
      i += statusMatch[1].length;
      continue;
    }

    // Date pattern like 25/Dec/2025
    const dateMatch = remaining.match(/^(\d{1,2}\/\w{3}\/\d{4})/);
    if (dateMatch) {
      parts.push("\\d{1,2}/\\w{3}/\\d{4}");
      i += dateMatch[1].length;
      continue;
    }

    // ISO date pattern like 2025-12-25
    const isoDateMatch = remaining.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDateMatch) {
      parts.push("\\d{4}-\\d{2}-\\d{2}");
      i += isoDateMatch[1].length;
      continue;
    }

    // Time pattern like 10:15:32
    const timeMatch = remaining.match(/^(\d{2}:\d{2}:\d{2})/);
    if (timeMatch) {
      parts.push("\\d{2}:\\d{2}:\\d{2}");
      i += timeMatch[1].length;
      continue;
    }

    // Timezone offset like +0000
    const tzMatch = remaining.match(/^([+-]\d{4})/);
    if (tzMatch) {
      parts.push("[+-]\\d{4}");
      i += tzMatch[1].length;
      continue;
    }

    // URL path starting with /
    const pathMatch = remaining.match(/^(\/[^\s"]*)/);
    if (pathMatch) {
      parts.push("/[^\\s\"]*");
      i += pathMatch[1].length;
      continue;
    }

    // Sequence of digits
    const digitsMatch = remaining.match(/^(\d+)/);
    if (digitsMatch) {
      parts.push("\\d+");
      i += digitsMatch[1].length;
      continue;
    }

    // Sequence of lowercase letters
    const lowerMatch = remaining.match(/^([a-z]+)/);
    if (lowerMatch) {
      parts.push("[a-z]+");
      i += lowerMatch[1].length;
      continue;
    }

    // Sequence of uppercase letters
    const upperMatch = remaining.match(/^([A-Z]+)/);
    if (upperMatch) {
      parts.push("[A-Z]+");
      i += upperMatch[1].length;
      continue;
    }

    // Mixed word characters
    const wordMatch = remaining.match(/^(\w+)/);
    if (wordMatch) {
      parts.push("\\w+");
      i += wordMatch[1].length;
      continue;
    }

    // Whitespace sequence
    const spaceMatch = remaining.match(/^(\s+)/);
    if (spaceMatch) {
      parts.push(spaceMatch[1].length === 1 ? " " : "\\s+");
      i += spaceMatch[1].length;
      continue;
    }

    // Special characters - escape them
    const char = text[i];
    if ("[]*+?^${}()|\\.-".includes(char)) {
      parts.push("\\" + char);
    } else {
      parts.push(char);
    }
    i++;
  }

  return parts.join("");
}

// Smart pattern detection - NEVER returns exact text
function getSmartPattern(text: string): string {
  // Check specific patterns first
  for (const opt of generationOptions) {
    if (opt.mode !== "smart" && opt.mode !== "exact" && opt.mode !== "any" && opt.detect?.(text)) {
      return opt.generate?.(text) || opt.pattern;
    }
  }
  // Fallback to generic variable patterns - NEVER exact
  if (/^\d+$/.test(text)) return "\\d+";
  if (/^\w+$/.test(text)) return "\\w+";
  if (/^\S+$/.test(text)) return "\\S+";
  // Contains whitespace or special chars - use smart analysis
  if (/^\[.*\]$/.test(text)) return "\\[[^\\]]+\\]"; // Bracketed content
  if (/^".*"$/.test(text)) return '"[^"]+"'; // Quoted content
  // For complex text, analyze and generate pattern
  return analyzeAndGeneratePattern(text);
}

function detectBestMode(text: string): GenerationMode {
  for (const opt of generationOptions) {
    if (opt.mode !== "smart" && opt.mode !== "exact" && opt.detect?.(text)) {
      return opt.mode;
    }
  }
  if (/^\d+$/.test(text)) return "digits";
  if (/^\w+$/.test(text)) return "word";
  if (/^\S+$/.test(text)) return "nonspace";
  return "smart"; // Use smart analysis for complex text
}

// Tokenize regex for syntax highlighting
function tokenizeRegex(pattern: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];
    const remaining = pattern.slice(i);

    // Named groups
    if (remaining.startsWith("(?<")) {
      const endName = remaining.indexOf(">");
      if (endName > 3) {
        tokens.push({ type: "namedGroup", value: remaining.slice(0, endName + 1), start: i, end: i + endName + 1, description: `Named group: ${remaining.slice(3, endName)}` });
        i += endName + 1;
        continue;
      }
    }

    // Non-capturing groups
    if (remaining.startsWith("(?:")) {
      tokens.push({ type: "group", value: "(?:", start: i, end: i + 3, description: "Non-capturing group" });
      i += 3;
      continue;
    }

    // Escape sequences
    if (char === "\\") {
      const next = pattern[i + 1];
      if (next) {
        const escapes: Record<string, string> = { d: "Digit", D: "Non-digit", w: "Word char", W: "Non-word", s: "Whitespace", S: "Non-whitespace", b: "Boundary", n: "Newline" };
        tokens.push({ type: "escape", value: `\\${next}`, start: i, end: i + 2, description: escapes[next] || `Escaped: ${next}` });
        i += 2;
        continue;
      }
    }

    // Character classes
    if (char === "[") {
      let j = i + 1;
      if (pattern[j] === "^") j++;
      while (j < pattern.length && pattern[j] !== "]") { if (pattern[j] === "\\") j++; j++; }
      tokens.push({ type: "charClass", value: pattern.slice(i, j + 1), start: i, end: j + 1, description: "Character class" });
      i = j + 1;
      continue;
    }

    // Groups
    if (char === "(" || char === ")") {
      tokens.push({ type: "group", value: char, start: i, end: i + 1, description: char === "(" ? "Group start" : "Group end" });
      i++;
      continue;
    }

    // Quantifiers
    if ("*+?".includes(char)) {
      tokens.push({ type: "quantifier", value: char, start: i, end: i + 1, description: char === "*" ? "0+" : char === "+" ? "1+" : "0 or 1" });
      i++;
      continue;
    }

    if (char === "{") {
      const match = remaining.match(/^\{\d+(?:,\d*)?\}/);
      if (match) {
        tokens.push({ type: "quantifier", value: match[0], start: i, end: i + match[0].length, description: "Quantifier" });
        i += match[0].length;
        continue;
      }
    }

    // Anchors
    if (char === "^" || char === "$") {
      tokens.push({ type: "anchor", value: char, start: i, end: i + 1, description: char === "^" ? "Start" : "End" });
      i++;
      continue;
    }

    // Alternation
    if (char === "|") {
      tokens.push({ type: "alternation", value: "|", start: i, end: i + 1, description: "OR" });
      i++;
      continue;
    }

    // Dot
    if (char === ".") {
      tokens.push({ type: "special", value: ".", start: i, end: i + 1, description: "Any char" });
      i++;
      continue;
    }

    // Literal
    tokens.push({ type: "literal", value: char, start: i, end: i + 1, description: `Literal: ${char}` });
    i++;
  }

  return tokens;
}

function getTokenColor(type: TokenType): string {
  const colors: Record<TokenType, string> = {
    escape: "text-cyan-400",
    quantifier: "text-yellow-400",
    anchor: "text-purple-400",
    group: "text-green-400",
    charClass: "text-orange-400",
    alternation: "text-pink-400",
    special: "text-red-400",
    namedGroup: "text-blue-400",
    backreference: "text-indigo-400",
    error: "text-red-600",
    literal: "text-foreground",
  };
  return colors[type];
}

export default function RegexBuilderPage() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [flags, setFlags] = useState({ global: true, ignoreCase: false, multiline: true, dotAll: false });
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["Log Parsing"]));

  // Selection state
  const [selectedText, setSelectedText] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const sampleLog = `192.168.1.100 - john [25/Dec/2025:10:15:32 +0000] "GET /api/users HTTP/1.1" 200 1234
192.168.1.101 - - [25/Dec/2025:10:15:33 +0000] "POST /api/login HTTP/1.1" 401 89
10.0.0.50 - admin [25/Dec/2025:10:15:34 +0000] "DELETE /admin/user/5 HTTP/1.1" 204 0`;

  const flagString = useMemo(() => {
    return (flags.global ? "g" : "") + (flags.ignoreCase ? "i" : "") + (flags.multiline ? "m" : "") + (flags.dotAll ? "s" : "");
  }, [flags]);

  const tokens = useMemo(() => tokenizeRegex(pattern), [pattern]);

  const { error, matches } = useMemo(() => {
    if (!pattern) return { error: null, matches: [] };
    try {
      const matchList: Array<{ match: string; index: number; groups: Record<string, string>; line: number }> = [];
      if (testText) {
        const re = new RegExp(pattern, flagString.includes("g") ? flagString : flagString + "g");
        let m;
        while ((m = re.exec(testText)) !== null) {
          matchList.push({ match: m[0], index: m.index, groups: m.groups || {}, line: testText.substring(0, m.index).split("\n").length });
          if (!flags.global) break;
        }
      }
      return { error: null, matches: matchList };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Invalid regex", matches: [] };
    }
  }, [pattern, testText, flagString, flags.global]);

  const highlightedText = useMemo(() => {
    if (!testText || matches.length === 0) return null;
    const parts: Array<{ text: string; isMatch: boolean }> = [];
    let last = 0;
    matches.forEach((m) => {
      if (m.index > last) parts.push({ text: testText.slice(last, m.index), isMatch: false });
      parts.push({ text: m.match, isMatch: true });
      last = m.index + m.match.length;
    });
    if (last < testText.length) parts.push({ text: testText.slice(last), isMatch: false });
    return parts;
  }, [testText, matches]);

  const handleTextSelection = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const selected = testText.slice(start, end);
      setSelectedText(selected);
      setShowGenerator(true);
      // Auto-suggest group name
      const mode = detectBestMode(selected);
      const suggestions: Record<string, string> = { ip: "ip", status: "status", method: "method", path: "path", date: "date", time: "time", digits: "value", word: "name" };
      setGroupNameInput(suggestions[mode] || "");
    }
  }, [testText]);

  const addPattern = useCallback((mode: GenerationMode, withGroup?: string) => {
    if (!selectedText) return;
    let generated: string;
    if (mode === "smart") {
      generated = getSmartPattern(selectedText);
    } else if (mode === "exact") {
      generated = escapeRegex(selectedText);
    } else {
      const opt = generationOptions.find(o => o.mode === mode);
      generated = opt?.generate?.(selectedText) || opt?.pattern || escapeRegex(selectedText);
    }
    const final = withGroup ? `(?<${withGroup}>${generated})` : generated;
    setPattern(prev => prev + final);
    setShowGenerator(false);
    setSelectedText("");
    setGroupNameInput("");
  }, [selectedText]);

  const copyToClipboard = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }, []);

  return (
    <div className="container py-10">
      <Breadcrumb items={[{ label: "Tools", href: "/tools" }, { label: "Regex Builder" }]} className="mb-6" />

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Regex className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Regex Builder</h1>
          <p className="text-muted-foreground">Type patterns or select text to auto-generate</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Pattern Input */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Pattern
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={error ? "destructive" : matches.length > 0 ? "default" : "secondary"}>
                    {error ? "Error" : `${matches.length} match${matches.length !== 1 ? "es" : ""}`}
                  </Badge>
                  {pattern && (
                    <Button variant="ghost" size="sm" onClick={() => setPattern("")}>
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(pattern, "pattern")} disabled={!pattern}>
                    {copied === "pattern" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Type your regex or select text below..."
                className="font-mono text-base h-11"
              />

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}

              {pattern && !error && (
                <div className="p-3 bg-muted rounded-lg font-mono text-sm overflow-x-auto">
                  {tokens.map((t, i) => (
                    <span key={i} className={getTokenColor(t.type)} title={t.description}>{t.value}</span>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-4">
                {Object.entries(flags).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch id={key} checked={val} onCheckedChange={(c) => setFlags(f => ({ ...f, [key]: c }))} />
                    <Label htmlFor={key} className="text-sm cursor-pointer">
                      {key === "global" ? "Global (g)" : key === "ignoreCase" ? "Case insensitive (i)" : key === "multiline" ? "Multiline (m)" : "Dot all (s)"}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Test Text */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Test Text
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setTestText(sampleLog)}>
                    Load Sample
                  </Button>
                  <Badge variant="outline" className="gap-1">
                    <MousePointerClick className="h-3 w-3" />
                    Select to generate
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  onMouseUp={handleTextSelection}
                  placeholder="Paste logs here, then select any text to generate a pattern..."
                  className="font-mono min-h-[140px] text-sm"
                />

                {/* Generator Popup - Variables First! */}
                {showGenerator && selectedText && (
                  <div className="absolute left-0 right-0 top-full mt-2 z-50">
                    <Card className="border-primary shadow-xl">
                      <CardHeader className="pb-2 pt-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <Wand2 className="h-4 w-4 text-primary" />
                            Generate Pattern
                          </CardTitle>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => { setShowGenerator(false); setSelectedText(""); }}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <code className="bg-primary/20 text-primary px-2 py-0.5 rounded">
                            {selectedText.length > 30 ? selectedText.slice(0, 30) + "..." : selectedText}
                          </code>
                          <Badge variant="default" className="text-[10px]">
                            {detectBestMode(selectedText)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-3 space-y-3">
                        {/* Main action - Variable pattern (recommended) */}
                        <Button className="w-full justify-between h-14 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => addPattern("smart")}>
                          <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                              <Wand2 className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">Use Variable Pattern</div>
                              <div className="text-xs opacity-80">Matches similar values</div>
                            </div>
                          </div>
                          <code className="text-sm bg-white/20 px-3 py-1.5 rounded font-bold">{getSmartPattern(selectedText)}</code>
                        </Button>

                        {/* Other variable patterns */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">Or choose another pattern:</div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {generationOptions.filter(o => !["smart", "exact"].includes(o.mode)).map((opt) => {
                              const isMatch = opt.detect?.(selectedText);
                              const isBest = detectBestMode(selectedText) === opt.mode;
                              return (
                                <Button
                                  key={opt.mode}
                                  variant={isBest ? "default" : isMatch ? "secondary" : "outline"}
                                  size="sm"
                                  className={`h-10 text-xs font-mono flex-col gap-0.5 ${isBest ? "ring-2 ring-offset-1" : ""}`}
                                  onClick={() => addPattern(opt.mode)}
                                  title={opt.description}
                                >
                                  <span className="font-bold">{opt.label}</span>
                                  <span className="text-[9px] opacity-70 truncate w-full">{opt.description}</span>
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        {/* With named group */}
                        <div className="pt-3 border-t">
                          <div className="text-xs text-muted-foreground mb-2">Add as named capture group:</div>
                          <div className="flex gap-2">
                            <Input
                              value={groupNameInput}
                              onChange={(e) => setGroupNameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                              placeholder="e.g., ip, status, user"
                              className="h-9 text-sm font-mono"
                              onKeyDown={(e) => { if (e.key === "Enter" && groupNameInput) addPattern("smart", groupNameInput); }}
                            />
                            <Button size="sm" className="h-9 px-4" disabled={!groupNameInput} onClick={() => addPattern("smart", groupNameInput)}>
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-1.5">
                            Result: <code className="bg-muted px-1.5 py-0.5 rounded">(?&lt;{groupNameInput || "name"}&gt;{getSmartPattern(selectedText)})</code>
                          </div>
                        </div>

                        {/* Exact match - hidden secondary option */}
                        <div className="pt-2 border-t border-dashed">
                          <Button variant="ghost" size="sm" className="w-full justify-center text-xs text-muted-foreground/60 hover:text-muted-foreground" onClick={() => addPattern("exact")}>
                            Or use exact text (not recommended): <code className="ml-1 opacity-60">{escapeRegex(selectedText).slice(0, 25)}{selectedText.length > 25 ? "..." : ""}</code>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              {/* Highlighted matches */}
              {highlightedText && (
                <div className="p-3 bg-muted/50 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto max-h-[200px]">
                  {highlightedText.map((p, i) => (
                    <span key={i} className={p.isMatch ? "bg-green-500/30 text-green-400 rounded px-0.5" : ""}>{p.text}</span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Details */}
          {matches.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {matches.slice(0, 15).map((m, i) => (
                    <div key={i} className="p-2 bg-muted rounded-lg font-mono text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">#{i + 1}</Badge>
                        <Badge variant="secondary" className="text-[10px]">Line {m.line}</Badge>
                        <span className="text-green-400 truncate flex-1">{m.match}</span>
                      </div>
                      {Object.keys(m.groups).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(m.groups).map(([k, v]) => (
                            <span key={k} className="text-xs bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                              {k}: {v}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {matches.length > 15 && <div className="text-center text-sm text-muted-foreground">+{matches.length - 15} more</div>}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Code Export */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-4 w-4" />
                Export
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="javascript">
                <TabsList className="mb-3">
                  {Object.keys(codeTemplates).map(lang => (
                    <TabsTrigger key={lang} value={lang} className="capitalize">{lang}</TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(codeTemplates).map(([lang, fn]) => (
                  <TabsContent key={lang} value={lang}>
                    <div className="relative">
                      <pre className="p-3 bg-muted rounded-lg font-mono text-xs overflow-x-auto">
                        {pattern ? fn(pattern, flagString) : `// Enter a pattern to see ${lang} code`}
                      </pre>
                      {pattern && (
                        <Button variant="ghost" size="sm" className="absolute top-1 right-1" onClick={() => copyToClipboard(fn(pattern, flagString), lang)}>
                          {copied === lang ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pattern Library */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {patternLibrary.map((cat) => (
                <div key={cat.category}>
                  <button
                    onClick={() => setExpandedCategories(prev => {
                      const next = new Set(prev);
                      next.has(cat.category) ? next.delete(cat.category) : next.add(cat.category);
                      return next;
                    })}
                    className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary"
                  >
                    {cat.category}
                    {expandedCategories.has(cat.category) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {expandedCategories.has(cat.category) && (
                    <div className="space-y-1 pb-2">
                      {cat.patterns.map((p) => (
                        <button
                          key={p.name}
                          onClick={() => { setPattern(p.pattern); setSelectedPattern(p.pattern); }}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${selectedPattern === p.pattern ? "bg-primary/20 text-primary" : "hover:bg-muted"}`}
                        >
                          <div className="font-medium">{p.name}</div>
                          <div className="text-xs text-muted-foreground">{p.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pattern Breakdown */}
          {pattern && tokens.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-[250px] overflow-y-auto">
                  {tokens.map((t, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm p-1 rounded hover:bg-muted">
                      <code className={`font-mono px-1 rounded bg-muted ${getTokenColor(t.type)}`}>{t.value}</code>
                      <span className="text-muted-foreground text-xs">{t.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Reference */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Ref</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm max-h-[300px] overflow-y-auto">
                {syntaxReference.map((cat) => (
                  <div key={cat.category}>
                    <div className="font-medium text-primary mb-1">{cat.category}</div>
                    <div className="grid grid-cols-2 gap-0.5">
                      {cat.items.map((item) => (
                        <button
                          key={item.symbol}
                          onClick={() => setPattern(p => p + item.symbol)}
                          className="flex items-center gap-1 p-1 rounded hover:bg-muted text-left"
                        >
                          <code className="font-mono text-xs bg-muted px-1 rounded">{item.symbol}</code>
                          <span className="text-[10px] text-muted-foreground truncate">{item.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
