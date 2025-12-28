"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  FileQuestion,
  Wrench,
  CheckCircle,
  ArrowRight,
  Loader2,
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

interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  createdAt: string;
  author: { login: string; avatarUrl: string } | null;
  category: { name: string; slug: string };
  comments: { totalCount: number };
  answerChosenAt?: string;
}

interface RelatedDiscussionsProps {
  technology: string;
  logType: string;
  technologyName: string;
  logTypeName: string;
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "sample-requests":
      return <FileQuestion className="h-3 w-3" />;
    case "troubleshooting":
      return <Wrench className="h-3 w-3" />;
    default:
      return <MessageSquare className="h-3 w-3" />;
  }
}

function getCategoryColor(slug: string) {
  switch (slug) {
    case "sample-requests":
      return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "troubleshooting":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    default:
      return "bg-purple-500/10 text-purple-500 border-purple-500/20";
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays < 1) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function RelatedDiscussions({
  technology,
  logType,
  technologyName,
  logTypeName,
}: RelatedDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDiscussions() {
      try {
        const params = new URLSearchParams({
          tech: technology,
          log: logType,
        });
        const res = await fetch(`/api/community/discussions/search?${params}`);
        if (res.ok) {
          const data = await res.json();
          setDiscussions(data.discussions?.slice(0, 5) || []);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchDiscussions();
  }, [technology, logType]);

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Community Discussions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (discussions.length === 0) {
    return null; // Don't show the section if there are no discussions
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Community Discussions
            </CardTitle>
            <CardDescription>
              Recent discussions about {technologyName} {logTypeName}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/community?tech=${technology}&log=${logType}`}>
              View all
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {discussions.map((discussion) => (
            <Link
              key={discussion.id}
              href={`/community/${discussion.number}`}
              className="block"
            >
              <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {discussion.title}
                      </span>
                      {discussion.answerChosenAt && (
                        <Badge
                          variant="outline"
                          className="shrink-0 gap-1 bg-green-500/10 text-green-500 border-green-500/20 text-xs"
                        >
                          <CheckCircle className="h-3 w-3" />
                          Answered
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge
                        variant="outline"
                        className={`gap-1 text-xs ${getCategoryColor(discussion.category.slug)}`}
                      >
                        {getCategoryIcon(discussion.category.slug)}
                        {discussion.category.name}
                      </Badge>
                      <span>{discussion.author?.login || "Unknown"}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(discussion.createdAt)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {discussion.comments.totalCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Have a question or sample to share?
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/community/new?category=sample-requests&tech=${technology}&log=${logType}`}>
                <FileQuestion className="h-4 w-4 mr-1" />
                Request Sample
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
