"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Github, Sparkles, Users, Upload, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchDialog } from "@/components/search-dialog";

const navLinks = [
  { href: "/logs", label: "Browse Logs" },
  { href: "/tools", label: "Tools" },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/community", label: "Community", icon: Users },
  { href: "/changelog", label: "What's New", icon: Sparkles, iconClass: "text-primary" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          <span className="sr-only">Menu</span>
        </Button>

        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/icon.svg" alt="LogsDB" width={28} height={28} className="rounded" />
            <span className="font-bold text-xl">LogsDB</span>
          </Link>
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground/80 text-foreground/60 flex items-center gap-1"
              >
                {link.icon && <link.icon className={`h-3 w-3 ${link.iconClass || ""}`} />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <SearchDialog />
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" asChild>
              <a
                href="https://github.com/logsdb1/logsdb"
                target="_blank"
                rel="noreferrer"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </Button>
            <ThemeToggle />
          </nav>
        </div>
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.icon && <link.icon className={`h-4 w-4 ${link.iconClass || ""}`} />}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
