import { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  FileQuestion,
  Wrench,
  ArrowRight,
  Plus,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Breadcrumb } from "@/components/breadcrumb";
import { listDiscussions, getDiscussionCategories } from "@/lib/github-discussions";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join the LogsDB community. Request log samples, ask troubleshooting questions, and discuss log parsing with other professionals.",
  openGraph: {
    title: "LogsDB Community",
    description:
      "Request log samples, ask troubleshooting questions, and discuss log parsing.",
  },
};

// Revalidate every 5 minutes
export const revalidate = 300;

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "sample-requests":
      return <FileQuestion className="h-4 w-4" />;
    case "troubleshooting":
      return <Wrench className="h-4 w-4" />;
    case "use-cases":
      return <Lightbulb className="h-4 w-4" />;
    default:
      return <MessageSquare className="h-4 w-4" />;
  }
}

function getCategoryColor(slug: string) {
  switch (slug) {
    case "sample-requests":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "troubleshooting":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    case "use-cases":
      return "bg-green-500/10 text-green-500 border-green-500/20";
    default:
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  }
}

export default async function CommunityPage() {
  let discussions: Awaited<ReturnType<typeof listDiscussions>>["discussions"] = [];
  let categories: Awaited<ReturnType<typeof getDiscussionCategories>> = [];
  let error: string | null = null;

  try {
    const [discussionsResult, categoriesResult] = await Promise.all([
      listDiscussions({ first: 20 }),
      getDiscussionCategories(),
    ]);
    discussions = discussionsResult.discussions;
    categories = categoriesResult;
  } catch (e) {
    error = "Unable to load discussions. GitHub Discussions may not be enabled on this repository.";
    console.error("Failed to load discussions:", e);
  }

  return (
    <div className="container py-10">
      <Breadcrumb items={[{ label: "Community" }]} className="mb-6" />

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Community</h1>
              <p className="text-muted-foreground">
                Discuss logs, request samples, and get help
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/community/new">
              <Plus className="h-4 w-4 mr-2" />
              New Discussion
            </Link>
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Link href="/community?category=sample-requests">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <FileQuestion className="h-4 w-4 text-blue-500" />
                </div>
                <CardTitle className="text-lg">Sample Requests</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Request log samples from the community for technologies you need
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community?category=troubleshooting">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                  <Wrench className="h-4 w-4 text-orange-500" />
                </div>
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get help with log parsing issues and error analysis
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community?category=use-cases">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Lightbulb className="h-4 w-4 text-green-500" />
                </div>
                <CardTitle className="text-lg">Use Cases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share and discover real-world log analysis scenarios and solutions
              </CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/community?category=general">
          <Card className="h-full transition-colors hover:bg-muted/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <MessageSquare className="h-4 w-4 text-purple-500" />
                </div>
                <CardTitle className="text-lg">General Discussion</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discuss log formats, best practices, and share knowledge
              </CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-10">
          <CardContent className="py-10 text-center">
            <MessageSquare className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" asChild>
              <a
                href="https://github.com/logsdb1/logsdb/discussions"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
                <ArrowRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Discussions List */}
      {!error && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Discussions</h2>
            <Button variant="ghost" size="sm" asChild>
              <a
                href="https://github.com/logsdb1/logsdb/discussions"
                target="_blank"
                rel="noopener noreferrer"
              >
                View all on GitHub
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </div>

          {discussions.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <MessageSquare className="h-10 w-10 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">
                  No discussions yet. Be the first to start one!
                </p>
                <Button asChild>
                  <Link href="/community/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Start a Discussion
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {discussions.map((discussion) => (
                <Link
                  key={discussion.id}
                  href={`/community/${discussion.number}`}
                >
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        {discussion.author && (
                          <img
                            src={discussion.author.avatarUrl}
                            alt={discussion.author.login}
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">
                              {discussion.title}
                            </h3>
                            <Badge
                              variant="outline"
                              className={`shrink-0 gap-1 ${getCategoryColor(discussion.category.slug)}`}
                            >
                              {getCategoryIcon(discussion.category.slug)}
                              {discussion.category.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{discussion.author?.login || "Unknown"}</span>
                            <span>
                              {formatTimeAgo(discussion.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {discussion.comments.totalCount}
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <Card className="mt-10 bg-primary/5 border-primary/20">
        <CardContent className="py-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Need help with logs?</h2>
          <p className="text-muted-foreground mb-4">
            Ask the community for log samples, troubleshooting help, or parsing advice.
          </p>
          <div className="flex justify-center gap-3">
            <Button asChild>
              <Link href="/community/new">
                <Plus className="h-4 w-4 mr-2" />
                Start a Discussion
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contribute">Contribute Logs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
