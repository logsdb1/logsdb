import { Metadata } from "next";
import Link from "next/link";
import {
  GitPullRequest,
  FileText,
  CheckCircle2,
  BookOpen,
  Code,
  Users,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contribute",
  description: "Contribute to LogsDB - the open source log encyclopedia. Add new log types, improve documentation, and help engineers worldwide parse logs faster.",
  keywords: ["contribute", "open source", "log documentation", "github", "pull request"],
  openGraph: {
    title: "Contribute to LogsDB",
    description: "Help build the universal log encyclopedia. Add new log types and improve documentation.",
  },
};
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";

const logTypeTemplate = `{
  "id": "access",
  "name": "Access Log",
  "description": "HTTP request logs",
  "defaultPath": "/var/log/nginx/access.log",
  "paths": [
    {
      "os": "linux",
      "path": "/var/log/nginx/access.log"
    }
  ],
  "formats": [
    {
      "name": "Combined",
      "pattern": "$remote_addr - $remote_user [$time_local]...",
      "example": "192.168.1.1 - - [25/Dec/2025:10:15:30 +0000]...",
      "fields": [
        {
          "name": "remote_addr",
          "type": "IP Address",
          "description": "Client IP address"
        }
      ]
    }
  ]
}`;

const steps = [
  {
    icon: <BookOpen className="h-6 w-6" />,
    title: "1. Study the Format",
    description:
      "Look at existing log types to understand the data structure. Each log type follows a consistent schema.",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "2. Gather Real Examples",
    description:
      "Collect real log samples from actual systems. Include multiple formats and edge cases.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "3. Document Everything",
    description:
      "Add paths for all platforms, parsing patterns (regex, grok), field descriptions, and use cases.",
  },
  {
    icon: <GitPullRequest className="h-6 w-6" />,
    title: "4. Submit a PR",
    description:
      "Fork the repository, add your log type to the data folder, and submit a pull request.",
  },
];

const guidelines = [
  "Use real log examples from actual systems, not fabricated data",
  "Include paths for all supported operating systems",
  "Provide both regex and grok patterns when possible",
  "Document all fields with clear descriptions and types",
  "Add common use cases and troubleshooting scenarios",
  "Test your parsing patterns against the examples",
  "Follow the existing code style and structure",
];

const wantedLogTypes = [
  { name: "Kubernetes", types: ["API Server", "Kubelet", "Controller Manager"] },
  { name: "AWS", types: ["CloudTrail", "VPC Flow Logs", "ALB Access Logs"] },
  { name: "Elasticsearch", types: ["Cluster Logs", "Slow Logs", "Deprecation"] },
  { name: "Redis", types: ["Server Log", "Slow Log"] },
  { name: "MongoDB", types: ["mongod Log", "Audit Log"] },
  { name: "HAProxy", types: ["HTTP Log", "TCP Log"] },
];

export default function ContributePage() {
  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center mb-16">
        <Badge variant="secondary" className="mb-4">
          Open Source
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Contribute to LogsDB
        </h1>
        <p className="text-xl text-muted-foreground">
          Help build the universal log encyclopedia. Every contribution helps
          engineers around the world understand and parse logs faster.
        </p>
        <div className="flex justify-center gap-4 mt-8">
          <Button size="lg" asChild>
            <Link href="/contribute/new">
              <FileText className="mr-2 h-4 w-4" />
              Add New Log Type
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a
              href="https://github.com/logsdb1/logsdb"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitPullRequest className="mr-2 h-4 w-4" />
              View on GitHub
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">100%</div>
          <div className="text-sm text-muted-foreground">Open Source</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-primary">MIT</div>
          <div className="text-sm text-muted-foreground">License</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="text-sm text-muted-foreground">Community Driven</div>
        </div>
      </div>

      {/* How to Contribute */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">How to Contribute</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
                  {step.icon}
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Log Type Structure */}
      <section className="mb-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4">
            Log Type Structure
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Each log type follows this JSON schema. Add your log type to{" "}
            <code className="bg-muted px-1 rounded">src/data/technologies/</code>
          </p>
          <CodeBlock code={logTypeTemplate} language="json" title="example-log-type.json" />
        </div>
      </section>

      {/* Guidelines */}
      <section className="mb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Contribution Guidelines
          </h2>
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {guidelines.map((guideline, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{guideline}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Wanted Log Types */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-4">Wanted Log Types</h2>
        <p className="text-center text-muted-foreground mb-8">
          These log types are highly requested. Pick one and start contributing!
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {wantedLogTypes.map((tech) => (
            <Card key={tech.name}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{tech.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tech.types.map((type) => (
                    <Badge key={type} variant="outline">
                      {type}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 border-t">
        <h2 className="text-2xl font-bold mb-4">Ready to contribute?</h2>
        <p className="text-muted-foreground mb-6">
          Join the community and help make log parsing easier for everyone.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <a
              href="https://github.com/logsdb1/logsdb"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/logs">Browse Existing Logs</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
