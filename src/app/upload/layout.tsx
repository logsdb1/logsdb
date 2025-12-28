import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Log File",
  description: "Share your log files with the LogsDB community. Upload .log or .txt files and tag them with the appropriate technology for others to learn from.",
  openGraph: {
    title: "Upload Log File | LogsDB",
    description: "Share your log files with the LogsDB community. Upload .log or .txt files and tag them with the appropriate technology.",
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
