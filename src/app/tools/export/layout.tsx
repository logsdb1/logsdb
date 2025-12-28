import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Config Exporter - Splunk, Elastic, Loki, Datadog",
  description: "Generate ready-to-use log collector configurations for Splunk, Elasticsearch, Grafana Loki, Datadog, Vector, and Fluentd. Copy-paste configs for Nginx, Apache, Syslog, and more.",
  keywords: ["splunk config", "filebeat config", "promtail config", "datadog logs", "log collector", "SIEM configuration"],
  openGraph: {
    title: "Config Exporter - Splunk, Elastic, Loki | LogsDB",
    description: "Generate ready-to-use log collector configurations for your SIEM or observability stack.",
  },
};

export default function ExportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
