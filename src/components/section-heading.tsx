"use client";

import { Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  as?: "h2" | "h3";
}

export function SectionHeading({
  id,
  children,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const baseStyles = Tag === "h2"
    ? "text-2xl font-bold mb-6"
    : "text-lg font-semibold mb-3";

  return (
    <Tag
      id={id}
      className={cn(baseStyles, "group flex items-center gap-2 scroll-mt-20", className)}
    >
      {children}
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        aria-label={`Link to ${children}`}
      >
        <Link2 className="h-4 w-4" />
      </a>
    </Tag>
  );
}
