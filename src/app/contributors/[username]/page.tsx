import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Github,
  GitPullRequest,
  GitCommit,
  Calendar,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb";

interface Props {
  params: Promise<{ username: string }>;
}

interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
  twitter_username: string | null;
  public_repos: number;
  followers: number;
  created_at: string;
}

interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      date: string;
    };
  };
  html_url: string;
}

interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  state: string;
  merged_at: string | null;
  created_at: string;
}

async function getUser(username: string): Promise<GitHubUser | null> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getUserCommits(username: string): Promise<Commit[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/logsdb1/logsdb/commits?author=${username}&per_page=10`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getUserPRs(username: string): Promise<PullRequest[]> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/logsdb1/logsdb/pulls?state=all&per_page=100`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return [];
    const prs: any[] = await res.json();
    return prs.filter((pr) => pr.user?.login === username);
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  return {
    title: user?.name || username,
    description: `View ${username}'s contributions to LogsDB`,
  };
}

export default async function ContributorPage({ params }: Props) {
  const { username } = await params;
  const [user, commits, prs] = await Promise.all([
    getUser(username),
    getUserCommits(username),
    getUserPRs(username),
  ]);

  if (!user) {
    notFound();
  }

  const mergedPRs = prs.filter((pr) => pr.merged_at);
  const openPRs = prs.filter((pr) => pr.state === "open");

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[
          { label: "Contributors", href: "/contributors" },
          { label: user.name || username },
        ]}
        className="mb-6"
      />

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <img
          src={user.avatar_url}
          alt={username}
          className="h-32 w-32 rounded-full border-4 border-background shadow-lg"
        />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{user.name || username}</h1>
            <Badge variant="secondary">@{username}</Badge>
          </div>
          {user.bio && (
            <p className="text-muted-foreground mb-4">{user.bio}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            {user.location && (
              <span>{user.location}</span>
            )}
            {user.blog && (
              <a
                href={user.blog.startsWith("http") ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground"
              >
                {user.blog}
              </a>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" asChild>
              <a
                href={user.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4 mr-2" />
                GitHub Profile
                <ExternalLink className="h-3 w-3 ml-2" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <GitCommit className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{commits.length}</p>
                <p className="text-sm text-muted-foreground">Commits</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <GitPullRequest className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mergedPRs.length}</p>
                <p className="text-sm text-muted-foreground">Merged PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <GitPullRequest className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openPRs.length}</p>
                <p className="text-sm text-muted-foreground">Open PRs</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Commits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Recent Commits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commits.length > 0 ? (
              <div className="space-y-3">
                {commits.slice(0, 5).map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <p className="font-medium text-sm line-clamp-1">
                      {commit.commit.message.split("\n")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(commit.commit.author.date).toLocaleDateString()}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No commits found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pull Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitPullRequest className="h-5 w-5" />
              Pull Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {prs.length > 0 ? (
              <div className="space-y-3">
                {prs.slice(0, 5).map((pr) => (
                  <a
                    key={pr.number}
                    href={pr.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={pr.merged_at ? "default" : pr.state === "open" ? "secondary" : "outline"}
                        className="text-xs"
                      >
                        {pr.merged_at ? "Merged" : pr.state}
                      </Badge>
                      <span className="text-xs text-muted-foreground">#{pr.number}</span>
                    </div>
                    <p className="font-medium text-sm mt-1 line-clamp-1">
                      {pr.title}
                    </p>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No pull requests found
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back Link */}
      <div className="mt-10">
        <Button variant="outline" asChild>
          <Link href="/contributors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Contributors
          </Link>
        </Button>
      </div>
    </div>
  );
}
