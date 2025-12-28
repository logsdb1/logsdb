"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmilePlus } from "lucide-react";

export interface ReactionGroup {
  content: string;
  totalCount: number;
  viewerHasReacted: boolean;
}

interface ReactionsProps {
  subjectId: string;
  reactionGroups?: ReactionGroup[];
  onReactionChange?: () => void;
  size?: "sm" | "md";
}

const REACTION_EMOJI: Record<string, string> = {
  THUMBS_UP: "👍",
  THUMBS_DOWN: "👎",
  LAUGH: "😄",
  HOORAY: "🎉",
  CONFUSED: "😕",
  HEART: "❤️",
  ROCKET: "🚀",
  EYES: "👀",
};

const REACTION_LABELS: Record<string, string> = {
  THUMBS_UP: "Like",
  THUMBS_DOWN: "Dislike",
  LAUGH: "Laugh",
  HOORAY: "Hooray",
  CONFUSED: "Confused",
  HEART: "Love",
  ROCKET: "Rocket",
  EYES: "Eyes",
};

export function Reactions({ subjectId, reactionGroups = [], onReactionChange, size = "md" }: ReactionsProps) {
  const { data: session } = useSession();
  const [localReactions, setLocalReactions] = useState<ReactionGroup[]>(reactionGroups);
  const [loading, setLoading] = useState<string | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const toggleReaction = async (content: string) => {
    if (!session) return;

    const existingReaction = localReactions.find(r => r.content === content);
    const isRemoving = existingReaction?.viewerHasReacted;

    setLoading(content);

    try {
      const res = await fetch("/api/community/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subjectId,
          content,
          action: isRemoving ? "remove" : "add",
        }),
      });

      if (res.ok) {
        setLocalReactions(prev => {
          const updated = [...prev];
          const idx = updated.findIndex(r => r.content === content);

          if (idx >= 0) {
            if (isRemoving) {
              updated[idx] = {
                ...updated[idx],
                totalCount: Math.max(0, updated[idx].totalCount - 1),
                viewerHasReacted: false,
              };
            } else {
              updated[idx] = {
                ...updated[idx],
                totalCount: updated[idx].totalCount + 1,
                viewerHasReacted: true,
              };
            }
          } else {
            updated.push({
              content,
              totalCount: 1,
              viewerHasReacted: true,
            });
          }

          return updated;
        });

        onReactionChange?.();
      }
    } catch {
      // Handle error silently
    } finally {
      setLoading(null);
      setPopoverOpen(false);
    }
  };

  // Filter reactions with count > 0
  const activeReactions = localReactions.filter(r => r.totalCount > 0);
  const buttonSize = size === "sm" ? "h-6 px-1.5 text-xs" : "h-7 px-2 text-sm";
  const iconSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {/* Display active reactions */}
      {activeReactions.map((reaction) => (
        <button
          key={reaction.content}
          onClick={() => session && toggleReaction(reaction.content)}
          disabled={loading === reaction.content || !session}
          className={`inline-flex items-center gap-1 ${buttonSize} rounded-full border transition-colors ${
            reaction.viewerHasReacted
              ? "bg-primary/10 border-primary/30 text-primary"
              : "bg-muted/50 border-border hover:bg-muted"
          } ${!session ? "cursor-default" : "cursor-pointer"}`}
          title={REACTION_LABELS[reaction.content]}
        >
          <span>{REACTION_EMOJI[reaction.content]}</span>
          <span>{reaction.totalCount}</span>
        </button>
      ))}

      {/* Add reaction button */}
      {session && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${buttonSize} rounded-full hover:bg-muted`}
            >
              <SmilePlus className={iconSize} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex gap-1">
              {Object.entries(REACTION_EMOJI).map(([key, emoji]) => {
                const reaction = localReactions.find(r => r.content === key);
                const hasReacted = reaction?.viewerHasReacted;

                return (
                  <button
                    key={key}
                    onClick={() => toggleReaction(key)}
                    disabled={loading === key}
                    className={`p-2 rounded hover:bg-muted transition-colors text-lg ${
                      hasReacted ? "bg-primary/10" : ""
                    }`}
                    title={REACTION_LABELS[key]}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
