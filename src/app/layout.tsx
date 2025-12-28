import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://logsdb.com"),
  title: {
    default: "LogsDB - The Universal Log Encyclopedia",
    template: "%s | LogsDB",
  },
  icons: {
    icon: "/favicon.svg",
  },
  description:
    "Know your logs. Parse anything. Anywhere. The universal database of log formats, parsing patterns, and configurations for all technologies.",
  keywords: [
    "logs",
    "log parsing",
    "log analysis",
    "SIEM",
    "observability",
    "monitoring",
    "grok",
    "regex",
    "nginx logs",
    "apache logs",
    "linux logs",
    "windows event logs",
  ],
  authors: [{ name: "LogsDB Community" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://logsdb.com",
    siteName: "LogsDB",
    title: "LogsDB - The Universal Log Encyclopedia",
    description:
      "Know your logs. Parse anything. Anywhere. The universal database of log formats, parsing patterns, and configurations.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LogsDB - The Universal Log Encyclopedia",
    description:
      "Know your logs. Parse anything. Anywhere. The universal database of log formats.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TooltipProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </TooltipProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
