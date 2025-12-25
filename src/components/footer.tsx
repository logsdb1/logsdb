import Link from "next/link";
import { Database } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Database className="h-6 w-6 text-muted-foreground" />
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            LogsDB - The universal log encyclopedia.{" "}
            <span className="hidden sm:inline">
              Know your logs. Parse anything. Anywhere.
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <Link href="/contribute" className="hover:underline">
            Contribute
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <a
            href="https://github.com/logsdb1/logsdb"
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
