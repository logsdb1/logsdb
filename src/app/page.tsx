import Link from "next/link";
import Image from "next/image";
import {
  Globe,
  Monitor,
  Box,
  Database,
  ArrowRight,
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
import { popularTechnologies, categories, getAllTechnologies } from "@/data";

const iconMap: Record<string, React.ReactNode> = {
  Globe: <Globe className="h-5 w-5" />,
  Monitor: <Monitor className="h-5 w-5" />,
  Box: <Box className="h-5 w-5" />,
  Database: <Database className="h-5 w-5" />,
};

export default function HomePage() {
  const allTechs = getAllTechnologies();
  const totalLogTypes = allTechs.reduce(
    (acc, tech) => acc + tech.logTypes.length,
    0
  );

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container">
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <Badge variant="secondary" className="mb-4">
              The Universal Log Encyclopedia
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Know your logs.
              <br />
              <span className="text-primary">Parse anything. Anywhere.</span>
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
              The definitive reference for log formats, parsing patterns, and
              configurations. Works with any SIEM or log management tool.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/logs">
                  Browse Logs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contribute">Contribute</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y bg-muted/40 py-12">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{allTechs.length}</div>
              <div className="text-sm text-muted-foreground">Technologies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{totalLogTypes}</div>
              <div className="text-sm text-muted-foreground">Log Types</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100+</div>
              <div className="text-sm text-muted-foreground">
                Parsing Patterns
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">6+</div>
              <div className="text-sm text-muted-foreground">
                Collector Configs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Technologies */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                Popular Technologies
              </h2>
              <p className="text-muted-foreground mt-2">
                Most referenced log sources in the database
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/logs">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {popularTechnologies.map((tech) => (
              <Link key={tech.id} href={`/logs/${tech.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {tech.logo && (
                        <Image
                          src={tech.logo}
                          alt={`${tech.name} logo`}
                          width={40}
                          height={40}
                          className="rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xl">{tech.name}</CardTitle>
                          {tech.openSource && (
                            <Badge variant="outline" className="text-xs">
                              Open Source
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{tech.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tech.logTypes.map((lt) => (
                        <Badge key={lt.id} variant="secondary">
                          {lt.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tech.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="text-xs text-muted-foreground"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t bg-muted/40 py-16 lg:py-24">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Browse by Category
            </h2>
            <p className="text-muted-foreground mt-2">
              Explore logs organized by technology type
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Card
                key={cat.id}
                className="transition-colors hover:bg-background"
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {iconMap[cat.icon]}
                    </div>
                    <CardTitle className="text-lg">{cat.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {cat.technologies?.map((techId) => (
                      <Link key={techId} href={`/logs/${techId}`}>
                        <Badge
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                        >
                          {techId}
                        </Badge>
                      </Link>
                    ))}
                    {cat.subcategories?.map((sub) =>
                      sub.technologies.map((techId) => (
                        <Link key={techId} href={`/logs/${techId}`}>
                          <Badge
                            variant="secondary"
                            className="cursor-pointer hover:bg-secondary/80"
                          >
                            {techId}
                          </Badge>
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Why LogsDB?
            </h2>
            <p className="text-muted-foreground mt-2">
              Everything you need to understand and parse logs
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">1</span>
              </div>
              <h3 className="text-lg font-semibold">One Page = One Answer</h3>
              <p className="text-muted-foreground mt-2">
                Everything about a log type on a single scrollable page. No
                hunting through docs.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">2</span>
              </div>
              <h3 className="text-lg font-semibold">Examples First</h3>
              <p className="text-muted-foreground mt-2">
                See real log examples before reading explanations. Copy-paste
                ready patterns.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-2xl">3</span>
              </div>
              <h3 className="text-lg font-semibold">Tool Agnostic</h3>
              <p className="text-muted-foreground mt-2">
                Works with Splunk, Elastic, Loki, Datadog, or just grep. We
                provide the knowledge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/40 py-16">
        <div className="container text-center">
          <h2 className="text-2xl font-bold">
            Ready to master your logs?
          </h2>
          <p className="text-muted-foreground mt-2 mb-6">
            Start exploring the universal log encyclopedia.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/logs">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
