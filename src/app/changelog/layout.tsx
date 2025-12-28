import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog - What's New",
  description:
    "Stay updated with the latest features, improvements, and new log formats added to LogsDB. See what's new in the universal log encyclopedia.",
  keywords: [
    "changelog",
    "updates",
    "new features",
    "logsdb updates",
    "release notes",
  ],
  alternates: {
    canonical: "https://logsdb.com/changelog",
  },
  openGraph: {
    title: "Changelog - What's New | LogsDB",
    description:
      "Latest features, improvements, and new log formats added to LogsDB.",
    url: "https://logsdb.com/changelog",
    type: "website",
  },
};

export default function ChangelogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
