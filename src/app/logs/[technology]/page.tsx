import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ExternalLink, FileText, Github, ArrowRight, Pencil, GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { CopyButton } from "@/components/copy-button";
import { getTechnology, getLogTypesForTechnology, getAllTechnologies } from "@/data";

interface Props {
  params: Promise<{ technology: string }>;
}

export async function generateStaticParams() {
  const technologies = getAllTechnologies();
  return technologies.map((tech) => ({
    technology: tech.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { technology: technologyId } = await params;
  const technology = getTechnology(technologyId);

  if (!technology) {
    return { title: "Not Found" };
  }

  return {
    title: `${technology.name} Logs`,
    description: `${technology.description}. Browse all log types, formats, and parsing patterns for ${technology.name}.`,
  };
}

export default async function TechnologyPage({ params }: Props) {
  const { technology: technologyId } = await params;
  const technology = getTechnology(technologyId);

  if (!technology) {
    notFound();
  }

  const logTypes = getLogTypesForTechnology(technologyId);

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[{ label: "Logs", href: "/logs" }, { label: technology.name }]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start gap-6">
          {technology.logo && (
            <Image
              src={technology.logo}
              alt={`${technology.name} logo`}
              width={80}
              height={80}
              className="rounded-xl"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold tracking-tight">
                {technology.name}
              </h1>
              {technology.openSource && (
                <Badge variant="outline">Open Source</Badge>
              )}
            </div>
            <p className="text-xl text-muted-foreground">
              {technology.description}
            </p>
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-6 flex flex-wrap gap-4">
          {technology.vendor && (
            <div className="text-sm">
              <span className="text-muted-foreground">Vendor:</span>{" "}
              <span className="font-medium">{technology.vendor}</span>
            </div>
          )}
          {technology.currentVersion && (
            <div className="text-sm">
              <span className="text-muted-foreground">Version:</span>{" "}
              <span className="font-medium">{technology.currentVersion}</span>
            </div>
          )}
          {technology.license && (
            <div className="text-sm">
              <span className="text-muted-foreground">License:</span>{" "}
              <span className="font-medium">{technology.license}</span>
            </div>
          )}
        </div>

        {/* Links */}
        <div className="mt-4 flex flex-wrap gap-3">
          {technology.officialDocs && (
            <Button variant="outline" size="sm" asChild>
              <a
                href={technology.officialDocs}
                target="_blank"
                rel="noreferrer"
              >
                <FileText className="mr-2 h-4 w-4" />
                Documentation
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          )}
          {technology.githubRepo && (
            <Button variant="outline" size="sm" asChild>
              <a href={technology.githubRepo} target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
                <ExternalLink className="ml-2 h-3 w-3" />
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <a
              href={`https://github.com/logsdb1/logsdb/edit/main/src/data/technologies/${technologyId}.ts`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit this page
            </a>
          </Button>
        </div>
      </div>

      {/* Log Types */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Log Types</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {technology.logTypes.map((lt) => {
            const fullLogType = logTypes.find((l) => l.id === lt.id);
            return (
              <Link key={lt.id} href={`/logs/${technology.id}/${lt.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{lt.name}</CardTitle>
                      {lt.optional && (
                        <Badge variant="outline" className="text-xs">
                          Optional
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{lt.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {lt.defaultPath && (
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                          {lt.defaultPath}
                        </code>
                        <CopyButton text={lt.defaultPath} className="h-6 w-6" />
                      </div>
                    )}
                    <div className="mt-4 flex items-center text-primary text-sm">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Default Paths */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Default Paths by Platform</h2>
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {Object.entries(technology.defaultPaths).map(
                ([platform, path]) => (
                  <div
                    key={platform}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm font-medium capitalize">
                      {platform.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {path}
                      </code>
                      <CopyButton text={path} className="h-6 w-6" />
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Config File */}
      {technology.configFile && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Configuration File</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Main configuration file:
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-sm bg-muted px-3 py-1 rounded">
                    {technology.configFile}
                  </code>
                  <CopyButton text={technology.configFile} />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {technology.categories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-sm">
              {cat}
            </Badge>
          ))}
        </div>
      </section>

      {/* Related & Compare */}
      <div className="grid gap-8 md:grid-cols-2">
        {technology.related && technology.related.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Related Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {technology.related.map((rel) => (
                <Badge key={rel} variant="outline">
                  {rel}
                </Badge>
              ))}
            </div>
          </section>
        )}
        {technology.compareWith && technology.compareWith.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">Compare With</h2>
            <div className="flex flex-wrap gap-2">
              {technology.compareWith.map((comp) => (
                <Link key={comp} href={`/logs/${comp}`}>
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-muted"
                  >
                    {comp}
                  </Badge>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Contribution Info */}
      <section className="mt-12 pt-8 border-t">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Last updated: {technology.contribution.updatedAt} by{" "}
              {technology.contribution.updatedBy}
            </div>
            <div>
              Contributors: {technology.contribution.contributors.length}
            </div>
          </div>

          {/* Contribution Actions */}
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-medium">Help improve this documentation</p>
                  <p className="text-sm text-muted-foreground">
                    Found an error or want to add a new log type? Contributions are welcome!
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://github.com/logsdb1/logsdb/edit/main/src/data/technologies/${technologyId}.ts`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://github.com/logsdb1/logsdb/issues/new?title=Issue+with+${technology.name}&labels=documentation`}
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
  );
}
