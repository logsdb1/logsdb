import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GitPullRequest, Github } from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata: Metadata = {
  title: "Contributors",
  description: "Meet the amazing contributors who help build LogsDB",
};

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

async function getContributors(): Promise<Contributor[]> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/logsdb1/logsdb/contributors?per_page=100",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function ContributorsPage() {
  const contributors = await getContributors();

  // Filter out bots
  const realContributors = contributors.filter(
    (c) => !c.login.includes("[bot]") && c.login !== "dependabot"
  );

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[{ label: "Contributors" }]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Contributors</h1>
            <p className="text-muted-foreground">
              {realContributors.length} people have contributed to LogsDB
            </p>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl">
          LogsDB is built by the community. Thank you to everyone who has contributed
          documentation, fixes, and improvements!
        </p>
      </div>

      {/* Contributors Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {realContributors.map((contributor) => (
          <Link key={contributor.login} href={`/contributors/${contributor.login}`}>
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className="h-12 w-12 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{contributor.login}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GitPullRequest className="h-3 w-3" />
                      <span>{contributor.contributions} contributions</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {realContributors.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-4 opacity-50" />
            <p>Unable to load contributors. Please try again later.</p>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="mt-10 bg-muted/40">
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Want to contribute?</h2>
          <p className="text-muted-foreground mb-4">
            Help us improve LogsDB by adding documentation, fixing errors, or suggesting new features.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/contribute"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Start Contributing
            </Link>
            <a
              href="https://github.com/logsdb1/logsdb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              <Github className="h-4 w-4 mr-2" />
              View on GitHub
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
