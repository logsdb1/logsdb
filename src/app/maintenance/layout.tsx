import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Under Development - LogsDB",
  description: "We're working on something awesome. The site will be back shortly!",
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
