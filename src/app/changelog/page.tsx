"use client";

import { useState } from "react";
import {
  Sparkles,
  Wrench,
  Bug,
  Zap,
  FileText,
  Database,
  Filter,
  Calendar,
  Tag,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Rss,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/breadcrumb";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ChangeType = "feature" | "improvement" | "fix" | "content" | "tool";

interface ChangelogEntry {
  date: string;
  version?: string;
  changes: {
    type: ChangeType;
    title: string;
    description: string;
    link?: string;
  }[];
}

const changeTypeConfig: Record<
  ChangeType,
  { icon: React.ElementType; label: string; color: string }
> = {
  feature: {
    icon: Sparkles,
    label: "New Feature",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  improvement: {
    icon: Zap,
    label: "Improvement",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  fix: {
    icon: Bug,
    label: "Bug Fix",
    color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  },
  content: {
    icon: FileText,
    label: "Content",
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  tool: {
    icon: Wrench,
    label: "Tool",
    color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  },
};

// Changelog data - newest first
const changelog: ChangelogEntry[] = [
  {
    date: "2026-01-02",
    changes: [
      {
        type: "content",
        title: "Palo Alto Networks Logs",
        description:
          "Added complete documentation for Palo Alto Networks firewall logs: Traffic Log, Threat Log, and URL Filtering Log with full field descriptions, parsing patterns, and SIEM configurations.",
        link: "/logs/paloalto",
      },
      {
        type: "feature",
        title: "Palo Alto Log Samples",
        description:
          "Added sample log files for all three Palo Alto log types with realistic security scenarios: network sessions, threat detections (CVEs, malware, C2), and URL filtering events.",
        link: "/uploads",
      },
      {
        type: "improvement",
        title: "New App Logo & Favicon",
        description:
          "Updated the application logo and favicon with a new design. Added full favicon compatibility for Google, iOS (apple-touch-icon), Android, and PWA with multiple sizes (16px to 512px).",
      },
      {
        type: "fix",
        title: "Log Sample Downloads",
        description:
          "Fixed file download API that was returning duplicate Content-Disposition headers causing browser errors.",
      },
    ],
  },
  {
    date: "2025-12-28",
    changes: [
      {
        type: "feature",
        title: "Security Hardening",
        description:
          "Comprehensive security update: rate limiting (10 uploads/hour, 100 API requests/minute), anti-bot protection with challenge tokens and honeypot fields, input validation, and MIME type verification.",
      },
      {
        type: "improvement",
        title: "Security Headers",
        description:
          "Added Content-Security-Policy, Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options, and other security headers to protect against XSS, clickjacking, and MIME sniffing attacks.",
      },
      {
        type: "fix",
        title: "Security Vulnerabilities Fixed",
        description:
          "Fixed ReDoS vulnerability in contribution routes, path traversal in file downloads, and unsafe JSON parsing. Updated Next.js to 14.2.35 to address multiple CVEs.",
      },
      {
        type: "feature",
        title: "Role-Based Access Control",
        description:
          "Added RBAC system with user, contributor, and admin roles. Roles are configurable via environment variables.",
      },
      {
        type: "feature",
        title: "Log Sample Uploads",
        description:
          "Contributors can now upload log files (.log, .txt) directly without authentication. Files are stored with metadata and publicly accessible.",
        link: "/upload",
      },
      {
        type: "feature",
        title: "Browse Log Samples",
        description:
          "New page to browse all uploaded log samples with filtering by technology and log type, pagination, and sorting options.",
        link: "/uploads",
      },
      {
        type: "feature",
        title: "View Samples on Log Pages",
        description:
          "Each log type documentation page now has a 'View Samples' button linking to real-world log examples from the community.",
      },
      {
        type: "improvement",
        title: "Sorting Options for Uploads",
        description:
          "Sort uploaded log samples by date, file size, or name in ascending or descending order.",
        link: "/uploads",
      },
      {
        type: "improvement",
        title: "SEO Optimizations",
        description:
          "Dynamic meta titles for log sample detail pages, noindex for filtered pages to avoid thin content issues.",
      },
    ],
  },
  {
    date: "2025-12-27",
    changes: [
      {
        type: "feature",
        title: "Community Discussions",
        description:
          "Integrated GitHub Discussions for community Q&A, sample requests, and troubleshooting help.",
        link: "/community",
      },
      {
        type: "feature",
        title: "Related Discussions on Log Pages",
        description:
          "Each log type page now shows related community discussions for that technology.",
      },
    ],
  },
  {
    date: "2025-12-26",
    changes: [
      {
        type: "feature",
        title: "Smart Regex Generator",
        description:
          "Select any text in the Regex Builder and it now analyzes the structure to generate an intelligent pattern instead of generic .*",
        link: "/tools/regex",
      },
      {
        type: "content",
        title: "70+ Regex Pattern Library",
        description:
          "Added comprehensive pattern library: Web Server Logs (Nginx, Apache), System Logs (Syslog, Journald, SSH), Application Logs (Java, Python, Node.js), Database Logs (MySQL, PostgreSQL, MongoDB, Redis), Container & Cloud (Docker, Kubernetes, AWS), Timestamps, Security patterns, and more.",
        link: "/tools/regex",
      },
      {
        type: "improvement",
        title: "Enhanced SEO for Regex Builder",
        description:
          "Added structured data (JSON-LD), optimized meta tags, and rich keywords for better search engine visibility.",
      },
    ],
  },
  {
    date: "2025-12-25",
    changes: [
      {
        type: "feature",
        title: "Wikipedia-style Contribution System",
        description:
          "Anyone can now propose edits to log documentation. Changes go through GitHub PR review before being merged.",
        link: "/contribute",
      },
      {
        type: "feature",
        title: "Contributors Page",
        description:
          "New page showcasing all community contributors with their contribution stats and history.",
        link: "/contributors",
      },
      {
        type: "tool",
        title: "Log Parser Tool",
        description:
          "Interactive tool to test regex patterns against sample logs with real-time match highlighting.",
        link: "/tools/parser",
      },
      {
        type: "tool",
        title: "Regex Builder",
        description:
          "Build, test, and export regular expressions with syntax highlighting and code generation for multiple languages.",
        link: "/tools/regex",
      },
      {
        type: "tool",
        title: "Log Generator",
        description:
          "Generate sample log entries for testing with customizable formats and parameters.",
        link: "/tools/generator",
      },
      {
        type: "tool",
        title: "Export Tool",
        description:
          "Export log configurations to various formats: Logstash, Fluentd, Vector, Cribl, and more.",
        link: "/tools/export",
      },
    ],
  },
  {
    date: "2025-12-24",
    changes: [
      {
        type: "content",
        title: "Nginx Log Documentation",
        description:
          "Complete documentation for Nginx access and error logs including format specifications, field descriptions, and parsing patterns.",
        link: "/logs/nginx/access",
      },
      {
        type: "content",
        title: "Apache Log Documentation",
        description:
          "Added Apache access and error log documentation with combined log format details.",
        link: "/logs/apache/access",
      },
      {
        type: "content",
        title: "Linux System Logs",
        description:
          "Documentation for syslog, auth.log, kern.log, and other Linux system logs.",
        link: "/logs/linux/syslog",
      },
    ],
  },
  {
    date: "2025-12-23",
    changes: [
      {
        type: "feature",
        title: "LogsDB Launch",
        description:
          "Initial release of LogsDB - The Universal Log Encyclopedia. Browse log formats, parsing patterns, and configurations for all technologies.",
        link: "/",
      },
      {
        type: "feature",
        title: "Dark Mode Support",
        description:
          "Full dark mode support with system preference detection and manual toggle.",
      },
      {
        type: "feature",
        title: "Search Functionality",
        description:
          "Quick search across all log types and technologies with keyboard shortcut (Ctrl+K).",
      },
    ],
  },
];

export default function ChangelogPage() {
  const [filter, setFilter] = useState<ChangeType | "all">("all");
  const [expandedDates, setExpandedDates] = useState<Set<string>>(
    new Set(changelog.slice(0, 3).map((e) => e.date))
  );

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  };

  const filteredChangelog = changelog
    .map((entry) => ({
      ...entry,
      changes:
        filter === "all"
          ? entry.changes
          : entry.changes.filter((c) => c.type === filter),
    }))
    .filter((entry) => entry.changes.length > 0);

  const totalChanges = changelog.reduce(
    (acc, entry) => acc + entry.changes.length,
    0
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container py-10 max-w-4xl">
      <Breadcrumb items={[{ label: "Changelog" }]} className="mb-6" />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Changelog</h1>
            <p className="text-muted-foreground">
              What&apos;s new in LogsDB
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Database className="h-4 w-4" />
            {totalChanges} updates
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            Since Dec 2025
          </span>
          <Button variant="outline" size="sm" className="ml-auto gap-2" asChild>
            <a href="/api/changelog/rss" target="_blank" rel="noopener">
              <Rss className="h-4 w-4" />
              RSS Feed
            </a>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground mr-2">Filter:</span>
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            {(Object.keys(changeTypeConfig) as ChangeType[]).map((type) => {
              const config = changeTypeConfig[type];
              const Icon = config.icon;
              return (
                <Button
                  key={type}
                  variant={filter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className="gap-1"
                >
                  <Icon className="h-3 w-3" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

        <div className="space-y-6">
          {filteredChangelog.map((entry) => {
            const isExpanded = expandedDates.has(entry.date);
            return (
              <div key={entry.date} className="relative">
                {/* Date header */}
                <button
                  onClick={() => toggleDate(entry.date)}
                  className="flex items-center gap-3 mb-4 group w-full text-left"
                >
                  <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        {formatDate(entry.date)}
                      </span>
                      {entry.version && (
                        <Badge variant="outline">{entry.version}</Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {entry.changes.length} change
                        {entry.changes.length !== 1 ? "s" : ""}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {entry.date}
                    </span>
                  </div>
                </button>

                {/* Changes */}
                {isExpanded && (
                  <div className="ml-[52px] space-y-3">
                    {entry.changes.map((change, idx) => {
                      const config = changeTypeConfig[change.type];
                      const Icon = config.icon;
                      return (
                        <Card
                          key={idx}
                          className="transition-all hover:shadow-md"
                        >
                          <CardHeader className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              <Badge
                                variant="outline"
                                className={`${config.color} gap-1 shrink-0`}
                              >
                                <Icon className="h-3 w-3" />
                                {config.label}
                              </Badge>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                  {change.title}
                                  {change.link && (
                                    <a
                                      href={change.link}
                                      className="text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </CardTitle>
                                <CardDescription className="mt-1 text-sm">
                                  {change.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscribe CTA */}
      <Card className="mt-12 bg-primary/5 border-primary/20">
        <CardContent className="py-6 text-center">
          <h3 className="font-semibold text-lg mb-2">Stay Updated</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Get notified when we add new log formats, tools, and features.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a
                href="https://github.com/logsdb1/logsdb"
                target="_blank"
                rel="noopener"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Watch on GitHub
              </a>
            </Button>
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <a href="/api/changelog/rss" target="_blank" rel="noopener">
                <Rss className="h-4 w-4" />
                RSS Feed
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
