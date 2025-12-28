import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About LogsDB",
  description:
    "LogsDB is the universal log encyclopedia - a free, open-source reference for log formats, parsing patterns, and configurations. Learn about our mission and community.",
  alternates: {
    canonical: "https://logsdb.com/about",
  },
  openGraph: {
    title: "About LogsDB - The Universal Log Encyclopedia",
    description:
      "Free, open-source reference for log formats. Documentation, tools, and community-driven content.",
    url: "https://logsdb.com/about",
    type: "website",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
