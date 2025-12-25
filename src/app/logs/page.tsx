import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/breadcrumb";
import { getAllTechnologies, categories } from "@/data";

export const metadata: Metadata = {
  title: "Browse Logs",
  description: "Explore all technologies and log types in the LogsDB encyclopedia",
};

export default function LogsPage() {
  const technologies = getAllTechnologies();

  return (
    <div className="container py-10">
      <Breadcrumb items={[{ label: "Logs" }]} className="mb-6" />

      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">Browse Logs</h1>
        <p className="text-muted-foreground mt-2">
          Explore {technologies.length} technologies and their log types
        </p>
      </div>

      {/* All Technologies */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {technologies.map((tech) => (
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
                <div className="mb-3">
                  <span className="text-sm text-muted-foreground">
                    {tech.logTypes.length} log type
                    {tech.logTypes.length > 1 ? "s" : ""}:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tech.logTypes.map((lt) => (
                    <Badge key={lt.id} variant="secondary">
                      {lt.name}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tech.categories.map((cat) => (
                    <span key={cat} className="text-xs text-muted-foreground">
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
  );
}
