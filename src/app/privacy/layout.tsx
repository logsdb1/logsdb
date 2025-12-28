import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "LogsDB Privacy Policy. Learn how we collect, use, and protect your information. We collect minimal data and respect your privacy.",
  alternates: {
    canonical: "https://logsdb.com/privacy",
  },
  openGraph: {
    title: "Privacy Policy | LogsDB",
    description: "How LogsDB handles your data and protects your privacy.",
    url: "https://logsdb.com/privacy",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
