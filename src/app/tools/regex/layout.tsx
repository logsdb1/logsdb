import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regex Builder & Tester Online - Log Parsing Patterns",
  description:
    "Free online regex builder with 70+ ready-to-use patterns for log parsing. Test regular expressions in real-time with syntax highlighting. Export to JavaScript, Python, Go, Grok. Parse Nginx, Apache, Syslog, Docker, Kubernetes logs instantly.",
  keywords: [
    "regex builder",
    "regex tester",
    "regular expression",
    "regex online",
    "log parsing regex",
    "nginx log regex",
    "apache log regex",
    "syslog regex",
    "grok patterns",
    "regex generator",
    "regex pattern library",
    "ip address regex",
    "timestamp regex",
    "log analysis",
    "regex cheat sheet",
    "docker logs regex",
    "kubernetes logs regex",
    "java exception regex",
    "python traceback regex",
    "mysql log regex",
    "postgresql log regex",
  ],
  alternates: {
    canonical: "https://logsdb.com/tools/regex",
  },
  openGraph: {
    title: "Regex Builder & Tester - 70+ Log Parsing Patterns | LogsDB",
    description:
      "Build and test regex patterns with a library of 70+ ready-to-use patterns for parsing Nginx, Apache, Syslog, Docker, Kubernetes, MySQL, and more.",
    url: "https://logsdb.com/tools/regex",
    type: "website",
    images: [
      {
        url: "https://logsdb.com/og/regex-builder.png",
        width: 1200,
        height: 630,
        alt: "LogsDB Regex Builder - Online Regex Tester with Pattern Library",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Regex Builder & Tester - 70+ Log Parsing Patterns",
    description:
      "Free online regex builder with ready-to-use patterns for log parsing. Test regex in real-time, export to JavaScript, Python, Go, Grok.",
  },
};

// JSON-LD structured data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "LogsDB Regex Builder",
  description:
    "Online regex builder and tester with a library of 70+ patterns for log parsing",
  url: "https://logsdb.com/tools/regex",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "Real-time regex testing",
    "Syntax highlighting",
    "70+ pre-built patterns",
    "Named capture groups",
    "Export to JavaScript, Python, Go, Grok",
    "Log parsing patterns for Nginx, Apache, Syslog, Docker, Kubernetes",
  ],
  author: {
    "@type": "Organization",
    name: "LogsDB",
    url: "https://logsdb.com",
  },
};

export default function RegexBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
