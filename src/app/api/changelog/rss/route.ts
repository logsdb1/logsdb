import { NextResponse } from "next/server";

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

// Same data as the changelog page - keep in sync
const changelog: ChangelogEntry[] = [
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

const typeLabels: Record<ChangeType, string> = {
  feature: "New Feature",
  improvement: "Improvement",
  fix: "Bug Fix",
  content: "Content",
  tool: "Tool",
};

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateRss(): string {
  const baseUrl = "https://logsdb.com";
  const now = new Date().toUTCString();

  const items = changelog.flatMap((entry) =>
    entry.changes.map((change) => {
      const date = new Date(entry.date);
      const link = change.link ? `${baseUrl}${change.link}` : `${baseUrl}/changelog`;
      const guid = `${baseUrl}/changelog#${entry.date}-${change.title.toLowerCase().replace(/\s+/g, "-")}`;

      return `    <item>
      <title>${escapeXml(`[${typeLabels[change.type]}] ${change.title}`)}</title>
      <description>${escapeXml(change.description)}</description>
      <link>${link}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${date.toUTCString()}</pubDate>
      <category>${escapeXml(typeLabels[change.type])}</category>
    </item>`;
    })
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LogsDB Changelog</title>
    <description>Latest updates, features, and improvements to LogsDB - The Universal Log Encyclopedia</description>
    <link>${baseUrl}/changelog</link>
    <atom:link href="${baseUrl}/api/changelog/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/icon.svg</url>
      <title>LogsDB</title>
      <link>${baseUrl}</link>
    </image>
${items.join("\n")}
  </channel>
</rss>`;
}

export async function GET() {
  const rss = generateRss();

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
