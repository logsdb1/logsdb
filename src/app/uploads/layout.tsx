import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Uploaded Logs",
  description: "Browse log files uploaded by the LogsDB community. Filter by technology and download real-world log examples for learning and testing.",
  openGraph: {
    title: "Uploaded Logs | LogsDB",
    description: "Browse log files uploaded by the LogsDB community. Filter by technology and download real-world log examples.",
  },
};

export default function UploadsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
