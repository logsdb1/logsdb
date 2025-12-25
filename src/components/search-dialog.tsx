"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { search, type SearchResult } from "@/data";
import { cn } from "@/lib/utils";

export function SearchDialog() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (query.length >= 2) {
      const searchResults = search(query);
      setResults(searchResults.slice(0, 10));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    if (result.type === "technology") {
      router.push(`/logs/${result.technology.id}`);
    } else if (result.logType) {
      router.push(`/logs/${result.technology.id}/${result.logType.id}`);
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Button
        variant="outline"
        className="relative h-9 w-9 p-0 xl:h-10 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4 xl:mr-2" />
        <span className="hidden xl:inline-flex">Search logs...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
          <span className="text-xs">Ctrl</span>K
        </kbd>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 shadow-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>Search</DialogTitle>
          </DialogHeader>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              placeholder="Search technologies, log types..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex h-11 w-full rounded-md border-0 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {results.length === 0 && query.length >= 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </div>
            )}
            {results.length === 0 && query.length < 2 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search...
              </div>
            )}
            {results.length > 0 && (
              <div className="p-2">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.technology.id}-${result.logType?.id || ""}`}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-accent"
                    )}
                    onClick={() => handleSelect(result)}
                  >
                    {result.type === "technology" ? (
                      <Server className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {result.type === "technology"
                          ? result.technology.name
                          : `${result.technology.name} - ${result.logType?.name}`}
                      </span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {result.type === "technology"
                          ? result.technology.description
                          : result.logType?.description}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
