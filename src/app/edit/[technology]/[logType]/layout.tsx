import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Log Documentation",
  description: "Edit and improve log type documentation on LogsDB. Contribute parsing patterns, examples, and configurations.",
  robots: {
    index: false, // Don't index edit pages
  },
};

export default function EditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
