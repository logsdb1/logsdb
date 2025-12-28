import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Server,
  Shield,
  BarChart,
  Pencil,
  GitPullRequest,
  MessageSquare,
  FileQuestion,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/breadcrumb";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { SectionHeading } from "@/components/section-heading";
import { TableOfContents } from "@/components/table-of-contents";
import {
  getTechnology,
  getLogType,
  getAllTechnologies,
  getLogTypesForTechnology,
} from "@/data";
import { RelatedDiscussions } from "@/components/related-discussions";

interface Props {
  params: Promise<{ technology: string; logType: string }>;
}

export async function generateStaticParams() {
  const technologies = getAllTechnologies();
  const params: { technology: string; logType: string }[] = [];

  for (const tech of technologies) {
    const logTypes = getLogTypesForTechnology(tech.id);
    for (const lt of logTypes) {
      params.push({ technology: tech.id, logType: lt.id });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology: technologyId, logType: logTypeId } = await params;
  const technology = getTechnology(technologyId);
  const logType = getLogType(technologyId, logTypeId);

  if (!technology || !logType) {
    return { title: "Not Found" };
  }

  return {
    title: `${technology.name} ${logType.name}`,
    description: `${logType.description}. Complete reference with log formats, parsing patterns, and configuration examples.`,
  };
}

export default async function LogTypePage({ params }: Props) {
  const { technology: technologyId, logType: logTypeId } = await params;
  const technology = getTechnology(technologyId);
  const logType = getLogType(technologyId, logTypeId);

  if (!technology || !logType) {
    notFound();
  }

  const tocItems = [
    { id: "quick-facts", label: "Quick Facts" },
    { id: "example", label: "Log Example" },
    { id: "paths", label: "Paths by Platform" },
    { id: "formats", label: "Available Formats" },
    { id: "fields", label: "Fields Reference" },
    { id: "parsing", label: "Parsing Patterns" },
    { id: "configuration", label: "Configuration" },
    { id: "use-cases", label: "Use Cases" },
    { id: "troubleshooting", label: "Troubleshooting" },
    ...(logType.allVariables ? [{ id: "variables", label: "All Variables" }] : []),
    { id: "tested-on", label: "Tested On" },
  ];

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": `${technology.name} ${logType.name} - Complete Reference`,
    "description": logType.description,
    "author": {
      "@type": "Organization",
      "name": "LogsDB",
      "url": "https://logsdb.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "LogsDB",
      "url": "https://logsdb.com"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://logsdb.com/logs/${technologyId}/${logTypeId}`
    },
    "about": {
      "@type": "SoftwareApplication",
      "name": technology.name,
      "applicationCategory": technology.categories?.[0] || "Software"
    },
    "keywords": `${technology.name}, ${logType.name}, log parsing, log analysis, grok patterns, regex`,
    "inLanguage": "en"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container py-10">
        <Breadcrumb
        items={[
          { label: "Logs", href: "/logs" },
          { label: technology.name, href: `/logs/${technology.id}` },
          { label: logType.name },
        ]}
        className="mb-6"
      />

      <div className="flex gap-10">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-start gap-5">
              {technology.logo && (
                <Image
                  src={technology.logo}
                  alt={`${technology.name} logo`}
                  width={64}
                  height={64}
                  className="rounded-xl"
                />
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                      {technology.name} {logType.name}
                    </h1>
                    <p className="text-xl text-muted-foreground">{logType.description}</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0">
                    <Link href={`/edit/${technologyId}/${logTypeId}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit this page
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

      {/* Quick Facts */}
      <section id="quick-facts" className="mb-12 scroll-mt-20">
        <Card className="bg-muted/40">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Quick Facts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <div className="text-sm text-muted-foreground">
                  Default Path (Linux)
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm bg-background px-2 py-1 rounded">
                    {logType.quickFacts.defaultPathLinux}
                  </code>
                  <CopyButton
                    text={logType.quickFacts.defaultPathLinux}
                    className="h-6 w-6"
                  />
                </div>
              </div>
              {logType.quickFacts.defaultPathDocker && (
                <div>
                  <div className="text-sm text-muted-foreground">
                    Docker
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-background px-2 py-1 rounded">
                      {logType.quickFacts.defaultPathDocker}
                    </code>
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm text-muted-foreground">
                  Default Format
                </div>
                <div className="mt-1 font-medium">
                  {logType.quickFacts.defaultFormat}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">JSON Native</div>
                <div className="mt-1">
                  {logType.quickFacts.jsonNative ? (
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Yes
                      {logType.quickFacts.jsonSinceVersion &&
                        ` (since ${logType.quickFacts.jsonSinceVersion})`}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">No</Badge>
                  )}
                </div>
              </div>
              {logType.quickFacts.rotation && (
                <div>
                  <div className="text-sm text-muted-foreground">Rotation</div>
                  <div className="mt-1 font-medium">
                    {logType.quickFacts.rotation}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Log Example */}
      <section id="example" className="mb-12 scroll-mt-20">
        <SectionHeading id="example">Log Example</SectionHeading>
        {logType.formats
          .filter((f) => f.isDefault)
          .map((format) => (
            <div key={format.id}>
              <p className="text-muted-foreground mb-4">
                Default format: <strong>{format.name}</strong>
              </p>
              <CodeBlock
                code={format.example}
                title="Example Log Entry"
                language="log"
              />
              {format.structure && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Structure:
                  </p>
                  <CodeBlock code={format.structure} language="text" />
                </div>
              )}
            </div>
          ))}
      </section>

      {/* Paths by Platform */}
      <section id="paths" className="mb-12 scroll-mt-20">
        <SectionHeading id="paths">Paths by Platform</SectionHeading>
        <Tabs defaultValue="linux" className="w-full">
          <TabsList className="mb-4">
            {logType.paths.linux && <TabsTrigger value="linux">Linux</TabsTrigger>}
            {logType.paths.windows && (
              <TabsTrigger value="windows">Windows</TabsTrigger>
            )}
            {logType.paths.macos && <TabsTrigger value="macos">macOS</TabsTrigger>}
            {logType.paths.containers && (
              <TabsTrigger value="containers">Containers</TabsTrigger>
            )}
            {logType.paths.cloud && <TabsTrigger value="cloud">Cloud</TabsTrigger>}
          </TabsList>

          {logType.paths.linux && (
            <TabsContent value="linux">
              <Card>
                <CardContent className="pt-6">
                  {logType.paths.linux.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <span className="text-sm font-medium">{entry.distro}</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {entry.path}
                        </code>
                        <CopyButton text={entry.path} className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {logType.paths.windows && (
            <TabsContent value="windows">
              <Card>
                <CardContent className="pt-6">
                  {logType.paths.windows.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <span className="text-sm font-medium">{entry.variant}</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {entry.path}
                        </code>
                        <CopyButton text={entry.path} className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {logType.paths.macos && (
            <TabsContent value="macos">
              <Card>
                <CardContent className="pt-6">
                  {logType.paths.macos.map((entry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <span className="text-sm font-medium">{entry.variant}</span>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {entry.path}
                        </code>
                        <CopyButton text={entry.path} className="h-6 w-6" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {logType.paths.containers && (
            <TabsContent value="containers">
              <Card>
                <CardContent className="pt-6">
                  {logType.paths.containers.map((entry, idx) => (
                    <div key={idx} className="py-3 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {entry.platform}
                        </span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {entry.path}
                          </code>
                          <CopyButton text={entry.path} className="h-6 w-6" />
                        </div>
                      </div>
                      {entry.note && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {logType.paths.cloud && (
            <TabsContent value="cloud">
              <Card>
                <CardContent className="pt-6">
                  {logType.paths.cloud.map((entry, idx) => (
                    <div key={idx} className="py-3 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {entry.provider}
                        </span>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {entry.path}
                        </code>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </section>

      {/* Log Formats */}
      <section id="formats" className="mb-12 scroll-mt-20">
        <SectionHeading id="formats">Available Formats</SectionHeading>
        <div className="space-y-6">
          {logType.formats.map((format) => (
            <Card key={format.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{format.name}</CardTitle>
                  <div className="flex gap-2">
                    {format.isDefault && (
                      <Badge variant="default">Default</Badge>
                    )}
                    {format.nativeSupport && (
                      <Badge variant="outline">Native</Badge>
                    )}
                    {format.configRequired && (
                      <Badge variant="secondary">Config Required</Badge>
                    )}
                  </div>
                </div>
                {format.sinceVersion && (
                  <CardDescription>
                    Available since version {format.sinceVersion}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Example:</p>
                  <CodeBlock code={format.example} />
                </div>
                {format.structure && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Structure:
                    </p>
                    <CodeBlock code={format.structure} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Fields */}
      <section id="fields" className="mb-12 scroll-mt-20">
        <SectionHeading id="fields">Fields Reference</SectionHeading>
        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Field</th>
                    <th className="text-left py-3 px-2 font-medium">Type</th>
                    <th className="text-left py-3 px-2 font-medium">
                      Description
                    </th>
                    <th className="text-left py-3 px-2 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody>
                  {logType.fields.map((field) => (
                    <tr key={field.name} className="border-b last:border-0">
                      <td className="py-3 px-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {field.name}
                        </code>
                        {field.variable && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            {field.variable}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="text-xs">
                          {field.type}
                        </Badge>
                        {field.unit && (
                          <span className="text-xs text-muted-foreground ml-1">
                            ({field.unit})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {field.description}
                        {field.note && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            Note: {field.note}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {String(field.example)}
                        </code>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Parsing */}
      <section id="parsing" className="mb-12 scroll-mt-20">
        <SectionHeading id="parsing">Parsing Patterns</SectionHeading>

        {/* Grok */}
        {logType.parsing.grok && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Grok Patterns</h3>
            {Object.entries(logType.parsing.grok).map(([name, pattern]) => (
              <div key={name} className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{name}:</p>
                <CodeBlock code={pattern} language="grok" />
              </div>
            ))}
          </div>
        )}

        {/* Regex */}
        {logType.parsing.regex && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Regular Expressions</h3>
            {Object.entries(logType.parsing.regex).map(([name, pattern]) => (
              <div key={name} className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">{name}:</p>
                <CodeBlock code={pattern} language="regex" />
              </div>
            ))}
          </div>
        )}

        {/* Collector Examples */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Collector Configurations</h3>
          <Tabs
            defaultValue={Object.keys(logType.parsing.examples)[0]}
            className="w-full"
          >
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              {Object.keys(logType.parsing.examples).map((collector) => (
                <TabsTrigger key={collector} value={collector} className="capitalize">
                  {collector.replace(/_/g, " ")}
                </TabsTrigger>
              ))}
            </TabsList>
            {Object.entries(logType.parsing.examples).map(
              ([collector, config]) => (
                <TabsContent key={collector} value={collector}>
                  <CodeBlock
                    code={config}
                    title={collector.replace(/_/g, " ")}
                    language={
                      collector === "logstash"
                        ? "ruby"
                        : collector.includes("fluent")
                        ? "yaml"
                        : "yaml"
                    }
                    showLineNumbers
                  />
                </TabsContent>
              )
            )}
          </Tabs>
        </div>
      </section>

      {/* Configuration */}
      <section id="configuration" className="mb-12 scroll-mt-20">
        <SectionHeading id="configuration">Configuration</SectionHeading>
        <div className="space-y-6">
          {Object.entries(logType.configuration).map(([key, config]) => {
            if (!config) return null;
            const title = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());

            if ("steps" in config) {
              // ConfigSteps
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-decimal list-inside mb-4 space-y-1 text-sm">
                      {config.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                    <CodeBlock code={config.example} />
                  </CardContent>
                </Card>
              );
            }

            if ("tool" in config && "configPath" in config) {
              // LogRotationConfig
              return (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <CardDescription>
                      Tool: {config.tool} | Config: {config.configPath}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock code={config.example} title={config.configPath} />
                  </CardContent>
                </Card>
              );
            }

            // ConfigExample
            const configExample = config as {
              directive?: string;
              file?: string;
              example?: string;
              note?: string;
              description?: string;
              recommended?: boolean;
            };

            return (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    {configExample.recommended && (
                      <Badge variant="default">Recommended</Badge>
                    )}
                  </div>
                  {configExample.description && (
                    <CardDescription>{configExample.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {configExample.directive && (
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Directive:
                      </p>
                      <CodeBlock code={configExample.directive} />
                    </div>
                  )}
                  {configExample.example && (
                    <CodeBlock
                      code={configExample.example}
                      title={configExample.file}
                    />
                  )}
                  {configExample.note && (
                    <p className="text-sm text-muted-foreground mt-4 flex items-start gap-2">
                      <Info className="h-4 w-4 mt-0.5 shrink-0" />
                      {configExample.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="mb-12 scroll-mt-20">
        <SectionHeading id="use-cases">Use Cases</SectionHeading>
        <Tabs defaultValue="operational" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="operational" className="gap-2">
              <Server className="h-4 w-4" />
              Operational
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="business" className="gap-2">
              <BarChart className="h-4 w-4" />
              Business
            </TabsTrigger>
          </TabsList>

          {(["operational", "security", "business"] as const).map((category) => (
            <TabsContent key={category} value={category}>
              {logType.useCases[category].length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No {category} use cases documented yet.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {logType.useCases[category].map((useCase, idx) => (
                    <Card key={idx}>
                      <CardHeader>
                        <CardTitle className="text-base">{useCase.name}</CardTitle>
                        <CardDescription>{useCase.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {useCase.fieldsUsed.map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                        {useCase.logic && (
                          <code className="text-xs bg-muted px-2 py-1 rounded block mt-2">
                            {useCase.logic}
                          </code>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Troubleshooting */}
      <section id="troubleshooting" className="mb-12 scroll-mt-20">
        <SectionHeading id="troubleshooting">Troubleshooting</SectionHeading>
        <Accordion type="single" collapsible className="w-full">
          {logType.troubleshooting.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                  {item.problem}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-2">
                  <div>
                    <h4 className="font-medium mb-2">Possible Causes:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {item.causes.map((cause, cidx) => (
                        <li key={cidx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Solutions:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {item.solutions.map((solution, sidx) => (
                        <li key={sidx}>{solution}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* All Variables */}
      {logType.allVariables && (
        <section id="variables" className="mb-12 scroll-mt-20">
          <SectionHeading id="variables">All Available Variables</SectionHeading>
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(logType.allVariables).map(([category, variables]) => {
              if (!variables) return null;
              return (
                <Card key={category}>
                  <CardHeader>
                    <CardTitle className="text-lg capitalize">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {variables.map((v) => (
                        <div
                          key={v.var}
                          className="flex items-start justify-between py-1 text-sm"
                        >
                          <code className="bg-muted px-1.5 py-0.5 rounded text-xs">
                            {v.var}
                          </code>
                          <span className="text-muted-foreground text-right ml-2">
                            {v.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Tested On */}
      <section id="tested-on" className="mb-12 scroll-mt-20">
        <SectionHeading id="tested-on">Tested On</SectionHeading>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {logType.testedOn.map((test, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <div>
                    <div className="font-medium text-sm">
                      v{test.version} on {test.os}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {test.testedBy} - {test.testedAt}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Contribution Info */}
      <section className="pt-8 border-t">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <Clock className="h-4 w-4" />
              <span>
                Last updated: {logType.contribution.updatedAt} by{" "}
                {logType.contribution.updatedBy}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {logType.contribution.contributors.length} contributor
                {logType.contribution.contributors.length > 1 ? "s" : ""}
              </span>
              {logType.contribution.upvotes !== undefined && (
                <span>{logType.contribution.upvotes} upvotes</span>
              )}
              {logType.contribution.validated && (
                <Badge variant="outline" className="text-green-500 border-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Validated
                </Badge>
              )}
            </div>
          </div>

          {/* Related Community Discussions */}
          <RelatedDiscussions
            technology={technologyId}
            logType={logTypeId}
            technologyName={technology.name}
            logTypeName={logType.name}
          />

          {/* Contribution Actions */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Help improve this documentation</p>
                  <p className="text-sm text-muted-foreground">
                    Found an error or want to add more examples? Contributions are welcome!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/edit/${technologyId}/${logTypeId}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://github.com/logsdb1/logsdb/issues/new?title=Issue+with+${technology.name}+${logType.name}&labels=documentation`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <GitPullRequest className="h-4 w-4 mr-2" />
                      Report Issue
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
        </div>

        {/* Table of Contents Sidebar */}
        <aside className="hidden xl:block w-64 shrink-0">
          <div className="sticky top-20">
            <TableOfContents items={tocItems} />
          </div>
        </aside>
      </div>
      </div>
    </>
  );
}
