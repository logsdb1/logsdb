import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Parser - Test Regex Patterns",
  description: "Interactive log parser tool. Test regex and grok patterns against real logs in real-time. Extract fields from Nginx, Apache, Syslog, and JSON logs.",
  keywords: ["log parser", "regex tester", "grok pattern", "log analysis", "field extraction"],
  openGraph: {
    title: "Log Parser - Test Regex Patterns | LogsDB",
    description: "Interactive log parser tool. Test regex patterns against real logs in real-time.",
  },
};

export default function ParserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
