import Link from "next/link";
import { Metadata } from "next";
import {
  Braces,
  Download,
  FlaskConical,
  Regex,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Tools",
  description: "Log parsing and analysis tools",
};

const tools = [
  {
    id: "parser",
    name: "Log Parser",
    description: "Test regex patterns and parse logs in real-time. Extract fields from any log format.",
    icon: Braces,
    href: "/tools/parser",
    badge: "Popular",
  },
  {
    id: "export",
    name: "Config Exporter",
    description: "Generate ready-to-use configurations for Splunk, Elastic, Loki, and more.",
    icon: Download,
    href: "/tools/export",
    badge: null,
  },
  {
    id: "generator",
    name: "Log Generator",
    description: "Generate realistic sample logs for testing. Supports multiple formats and attack scenarios.",
    icon: FlaskConical,
    href: "/tools/generator",
    badge: "New",
  },
  {
    id: "regex",
    name: "Regex Builder",
    description: "Build, test, and understand regex with syntax highlighting, real-time matching, and code export.",
    icon: Regex,
    href: "/tools/regex",
    badge: "New",
  },
];

export default function ToolsPage() {
  return (
    <div className="container py-10">
      <Breadcrumb items={[{ label: "Tools" }]} className="mb-6" />

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Tools</h1>
        <p className="text-muted-foreground text-lg">
          Utilities to help you parse, analyze, and configure logs
        </p>
      </div>

      {/* Available Tools */}
      <section>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.href}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <tool.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{tool.name}</CardTitle>
                    </div>
                    {tool.badge && (
                      <Badge variant="secondary">{tool.badge}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                  <div className="flex items-center gap-1 mt-4 text-primary text-sm font-medium">
                    Open tool
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
