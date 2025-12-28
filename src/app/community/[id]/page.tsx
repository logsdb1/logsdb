import { Metadata } from "next";
import { getDiscussion } from "@/lib/github-discussions";
import { DiscussionClient } from "./discussion-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const discussionNumber = parseInt(id, 10);

  if (isNaN(discussionNumber)) {
    return { title: "Discussion Not Found" };
  }

  const discussion = await getDiscussion(discussionNumber);

  if (!discussion) {
    return { title: "Discussion Not Found" };
  }

  const description = discussion.body.slice(0, 160).replace(/[#*`\n]/g, " ").trim();

  return {
    title: discussion.title,
    description,
    alternates: {
      canonical: `https://logsdb.com/community/${discussion.number}`,
    },
    openGraph: {
      title: `${discussion.title} - LogsDB Community`,
      description,
      type: "article",
      url: `https://logsdb.com/community/${discussion.number}`,
      authors: discussion.author?.login ? [discussion.author.login] : undefined,
      publishedTime: discussion.createdAt,
      modifiedTime: discussion.updatedAt,
    },
    twitter: {
      card: "summary",
      title: discussion.title,
      description,
    },
  };
}

export default async function DiscussionPage({ params }: Props) {
  const { id } = await params;
  return <DiscussionClient discussionId={id} />;
}
