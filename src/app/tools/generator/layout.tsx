import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log Generator",
  description: "Generate realistic sample logs for testing. Create Nginx, Apache, Syslog, JSON, and Auth logs with various scenarios including DDoS, brute force, and SQL injection patterns.",
  keywords: ["log generator", "sample logs", "test logs", "nginx logs", "apache logs", "security testing", "log simulation"],
  openGraph: {
    title: "Log Generator | LogsDB",
    description: "Generate realistic sample logs for testing your parsing configurations and SIEM rules.",
  },
};

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
