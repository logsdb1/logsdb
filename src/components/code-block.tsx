"use client";

import * as React from "react";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export function CodeBlock({
  code,
  language,
  title,
  className,
  showLineNumbers = false,
}: CodeBlockProps) {
  const lines = code.split("\n");

  return (
    <div className={cn("relative group rounded-lg border bg-muted", className)}>
      {title && (
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-sm text-muted-foreground font-medium">
            {title}
          </span>
          {language && (
            <span className="text-xs text-muted-foreground uppercase">
              {language}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <CopyButton
          text={code}
          className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <pre className="overflow-x-auto p-4 text-sm">
          <code>
            {showLineNumbers
              ? lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell pr-4 text-right text-muted-foreground select-none">
                      {i + 1}
                    </span>
                    <span className="table-cell">{line}</span>
                  </div>
                ))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}
