import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add New Log Type",
  description: "Contribute a new log type to LogsDB. Add documentation for new technologies, log formats, parsing patterns, and collector configurations.",
  keywords: ["contribute", "add log type", "open source", "log documentation"],
  openGraph: {
    title: "Add New Log Type | LogsDB",
    description: "Contribute a new log type to the universal log encyclopedia.",
  },
};

export default function NewContributeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
