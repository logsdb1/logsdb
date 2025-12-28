"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  ChevronRight,
  FileCode,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumb } from "@/components/breadcrumb";

interface LogTypeOption {
  id: string;
  technology: string;
  name: string;
  techName: string;
}

interface ExportConfig {
  platform: string;
  name: string;
  icon: string;
  description: string;
  fileExtension: string;
  language: string;
}

const LOG_TYPES: LogTypeOption[] = [
  { id: "nginx-access", technology: "nginx", name: "access", techName: "Nginx Access Log" },
  { id: "nginx-error", technology: "nginx", name: "error", techName: "Nginx Error Log" },
  { id: "apache-access", technology: "apache", name: "access", techName: "Apache Access Log" },
  { id: "apache-error", technology: "apache", name: "error", techName: "Apache Error Log" },
  { id: "linux-syslog", technology: "linux", name: "syslog", techName: "Linux Syslog" },
  { id: "linux-auth", technology: "linux", name: "auth", techName: "Linux Auth Log" },
  { id: "docker-container", technology: "docker", name: "container", techName: "Docker Container Logs" },
  { id: "postgresql-server", technology: "postgresql", name: "server", techName: "PostgreSQL Server Log" },
];

const PLATFORMS: ExportConfig[] = [
  {
    platform: "splunk",
    name: "Splunk",
    icon: "S",
    description: "props.conf and transforms.conf",
    fileExtension: "conf",
    language: "ini",
  },
  {
    platform: "elastic",
    name: "Elasticsearch",
    icon: "E",
    description: "Filebeat and Logstash configs",
    fileExtension: "yml",
    language: "yaml",
  },
  {
    platform: "loki",
    name: "Grafana Loki",
    icon: "L",
    description: "Promtail configuration",
    fileExtension: "yml",
    language: "yaml",
  },
  {
    platform: "datadog",
    name: "Datadog",
    icon: "D",
    description: "Agent log collection config",
    fileExtension: "yaml",
    language: "yaml",
  },
  {
    platform: "vector",
    name: "Vector",
    icon: "V",
    description: "Vector.dev configuration",
    fileExtension: "toml",
    language: "toml",
  },
  {
    platform: "fluentd",
    name: "Fluentd",
    icon: "F",
    description: "Fluentd/Fluent Bit config",
    fileExtension: "conf",
    language: "xml",
  },
];

// Config generators
const generateConfig = (logType: LogTypeOption, platform: string): string => {
  const configs: Record<string, Record<string, string>> = {
    "nginx-access": {
      splunk: `# ============================================
# SPLUNK CONFIGURATION FOR NGINX ACCESS LOGS
# ============================================
#
# Installation:
# 1. Copy each section to the corresponding file in $SPLUNK_HOME/etc/system/local/
#    or in your app's local/ directory
# 2. Restart Splunk: splunk restart
#
# Files needed:
# - inputs.conf : Define where to collect logs
# - props.conf  : Define how to parse the logs
# - transforms.conf : Define field extractions
# ============================================

# ----------------
# inputs.conf
# ----------------
# Monitors the nginx access log file and assigns the sourcetype

[monitor:///var/log/nginx/access.log]
disabled = false
sourcetype = nginx:access
index = web

# For multiple servers, use a deployment app or adjust the path
# [monitor:///var/log/nginx/*.log]

# ----------------
# props.conf
# ----------------
# Defines timestamp parsing and line breaking rules

[nginx:access]
TIME_FORMAT = %d/%b/%Y:%H:%M:%S %z
TIME_PREFIX = \\[
MAX_TIMESTAMP_LOOKAHEAD = 32
SHOULD_LINEMERGE = false
LINE_BREAKER = ([\\r\\n]+)
TRUNCATE = 100000
CHARSET = UTF-8
TRANSFORMS-nginx = nginx_access_extract

# For JSON format logs, use:
# KV_MODE = json

# ----------------
# transforms.conf
# ----------------
# Extracts fields from the log line using regex

[nginx_access_extract]
REGEX = ^(?<client_ip>\\S+) - (?<remote_user>\\S+) \\[(?<timestamp>[^\\]]+)\\] "(?<request_method>\\S+) (?<request_uri>\\S+) (?<http_version>[^"]+)" (?<status>\\d+) (?<body_bytes_sent>\\d+) "(?<http_referer>[^"]*)" "(?<http_user_agent>[^"]*)"
FORMAT = client_ip::$1 remote_user::$2 timestamp::$3 request_method::$4 request_uri::$5 http_version::$6 status::$7 body_bytes_sent::$8 http_referer::$9 http_user_agent::$10

# ----------------
# Example searches
# ----------------
# sourcetype=nginx:access | stats count by status
# sourcetype=nginx:access status>=500 | table _time client_ip request_uri status
# sourcetype=nginx:access | timechart count by request_method`,

      elastic: `# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/nginx/access.log
    fields:
      type: nginx-access
    fields_under_root: true

processors:
  - dissect:
      tokenizer: '%{client_ip} - %{remote_user} [%{timestamp}] "%{request_method} %{request_uri} %{http_version}" %{status} %{body_bytes_sent} "%{http_referer}" "%{http_user_agent}"'
      field: "message"
      target_prefix: ""

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "nginx-access-%{+yyyy.MM.dd}"`,

      loki: `# promtail.yml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: nginx-access
    static_configs:
      - targets:
          - localhost
        labels:
          job: nginx
          __path__: /var/log/nginx/access.log
    pipeline_stages:
      - regex:
          expression: '^(?P<client_ip>\\S+) - (?P<remote_user>\\S+) \\[(?P<timestamp>[^\\]]+)\\] "(?P<request_method>\\S+) (?P<request_uri>\\S+) (?P<http_version>[^"]+)" (?P<status>\\d+) (?P<body_bytes_sent>\\d+)'
      - labels:
          status:
          request_method:`,

      datadog: `# /etc/datadog-agent/conf.d/nginx.d/conf.yaml
logs:
  - type: file
    path: /var/log/nginx/access.log
    service: nginx
    source: nginx
    sourcecategory: web

    # Optional: Custom log processing
    log_processing_rules:
      - type: multi_line
        name: new_log_start
        pattern: '^\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}'`,

      vector: `# vector.toml
[sources.nginx_access]
type = "file"
include = ["/var/log/nginx/access.log"]
read_from = "beginning"

[transforms.nginx_parse]
type = "remap"
inputs = ["nginx_access"]
source = '''
. = parse_regex!(.message, r'^(?P<client_ip>\\S+) - (?P<remote_user>\\S+) \\[(?P<timestamp>[^\\]]+)\\] "(?P<request_method>\\S+) (?P<request_uri>\\S+) (?P<http_version>[^"]+)" (?P<status>\\d+) (?P<body_bytes_sent>\\d+) "(?P<http_referer>[^"]*)" "(?P<http_user_agent>[^"]*)"')
.status = to_int!(.status)
.body_bytes_sent = to_int!(.body_bytes_sent)
'''

[sinks.console]
type = "console"
inputs = ["nginx_parse"]
encoding.codec = "json"`,

      fluentd: `# fluent.conf
<source>
  @type tail
  path /var/log/nginx/access.log
  pos_file /var/log/td-agent/nginx-access.log.pos
  tag nginx.access
  <parse>
    @type regexp
    expression /^(?<client_ip>[^ ]*) - (?<remote_user>[^ ]*) \\[(?<timestamp>[^\\]]*)\\] "(?<request_method>\\S+) (?<request_uri>\\S+) (?<http_version>[^"]+)" (?<status>[^ ]*) (?<body_bytes_sent>[^ ]*) "(?<http_referer>[^"]*)" "(?<http_user_agent>[^"]*)"/
    time_key timestamp
    time_format %d/%b/%Y:%H:%M:%S %z
  </parse>
</source>

<match nginx.access>
  @type stdout
</match>`,
    },

    "apache-access": {
      splunk: `# ============================================
# SPLUNK CONFIGURATION FOR APACHE ACCESS LOGS
# ============================================
#
# Installation:
# 1. Copy each section to the corresponding file in $SPLUNK_HOME/etc/system/local/
# 2. Restart Splunk: splunk restart
# ============================================

# ----------------
# inputs.conf
# ----------------
[monitor:///var/log/apache2/access.log]
disabled = false
sourcetype = apache:access
index = web

# For RHEL/CentOS:
# [monitor:///var/log/httpd/access_log]

# ----------------
# props.conf
# ----------------
[apache:access]
TIME_FORMAT = %d/%b/%Y:%H:%M:%S %z
TIME_PREFIX = \\[
SHOULD_LINEMERGE = false
CHARSET = UTF-8
TRANSFORMS-apache = apache_access_extract

# ----------------
# transforms.conf
# ----------------
[apache_access_extract]
REGEX = ^(?<client_ip>\\S+) (?<ident>\\S+) (?<remote_user>\\S+) \\[(?<timestamp>[^\\]]+)\\] "(?<request_method>\\S+) (?<request_uri>\\S+) (?<http_version>[^"]+)" (?<status>\\d+) (?<bytes>\\S+) "(?<http_referer>[^"]*)" "(?<http_user_agent>[^"]*)"

# ----------------
# Example searches
# ----------------
# sourcetype=apache:access | stats count by status
# sourcetype=apache:access status=404 | table _time client_ip request_uri`,

      elastic: `# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/apache2/access.log
      - /var/log/httpd/access_log
    fields:
      type: apache-access

filebeat.modules:
  - module: apache
    access:
      enabled: true
      var.paths: ["/var/log/apache2/access.log"]`,

      loki: `# promtail.yml
scrape_configs:
  - job_name: apache-access
    static_configs:
      - targets:
          - localhost
        labels:
          job: apache
          __path__: /var/log/apache2/access.log
    pipeline_stages:
      - regex:
          expression: '^(?P<client_ip>\\S+) (?P<ident>\\S+) (?P<remote_user>\\S+) \\[(?P<timestamp>[^\\]]+)\\] "(?P<request_method>\\S+) (?P<request_uri>\\S+) (?P<http_version>[^"]+)" (?P<status>\\d+) (?P<bytes>\\S+)'`,

      datadog: `# /etc/datadog-agent/conf.d/apache.d/conf.yaml
logs:
  - type: file
    path: /var/log/apache2/access.log
    service: apache
    source: apache
    sourcecategory: web`,

      vector: `# vector.toml
[sources.apache_access]
type = "file"
include = ["/var/log/apache2/access.log", "/var/log/httpd/access_log"]

[transforms.apache_parse]
type = "remap"
inputs = ["apache_access"]
source = '''
. = parse_apache_log!(.message, format: "combined")
'''`,

      fluentd: `# fluent.conf
<source>
  @type tail
  path /var/log/apache2/access.log
  pos_file /var/log/td-agent/apache-access.log.pos
  tag apache.access
  <parse>
    @type apache2
  </parse>
</source>`,
    },

    "linux-syslog": {
      splunk: `# ============================================
# SPLUNK CONFIGURATION FOR LINUX SYSLOG
# ============================================
#
# Installation:
# 1. Copy each section to the corresponding file in $SPLUNK_HOME/etc/system/local/
# 2. Restart Splunk: splunk restart
# ============================================

# ----------------
# inputs.conf
# ----------------
[monitor:///var/log/syslog]
disabled = false
sourcetype = linux:syslog
index = os

# For RHEL/CentOS:
[monitor:///var/log/messages]
disabled = false
sourcetype = linux:syslog
index = os

# ----------------
# props.conf
# ----------------
[linux:syslog]
TIME_FORMAT = %b %d %H:%M:%S
MAX_TIMESTAMP_LOOKAHEAD = 15
SHOULD_LINEMERGE = false
TRANSFORMS-syslog = syslog_extract

# ----------------
# transforms.conf
# ----------------
[syslog_extract]
REGEX = ^(?<timestamp>\\w{3}\\s+\\d{1,2} \\d{2}:\\d{2}:\\d{2}) (?<host>\\S+) (?<process>[^\\[]+)\\[(?<pid>\\d+)\\]: (?<message>.*)$

# ----------------
# Example searches
# ----------------
# sourcetype=linux:syslog | stats count by process
# sourcetype=linux:syslog process=sshd | table _time host message`,

      elastic: `# filebeat.yml
filebeat.inputs:
  - type: log
    enabled: true
    paths:
      - /var/log/syslog
      - /var/log/messages

filebeat.modules:
  - module: system
    syslog:
      enabled: true`,

      loki: `# promtail.yml
scrape_configs:
  - job_name: syslog
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          __path__: /var/log/syslog
    pipeline_stages:
      - regex:
          expression: '^(?P<timestamp>\\w{3}\\s+\\d{1,2} \\d{2}:\\d{2}:\\d{2}) (?P<hostname>\\S+) (?P<process>[^\\[]+)\\[(?P<pid>\\d+)\\]: (?P<message>.*)'`,

      datadog: `# /etc/datadog-agent/conf.d/syslog.d/conf.yaml
logs:
  - type: file
    path: /var/log/syslog
    service: system
    source: syslog`,

      vector: `# vector.toml
[sources.syslog]
type = "file"
include = ["/var/log/syslog", "/var/log/messages"]

[transforms.syslog_parse]
type = "remap"
inputs = ["syslog"]
source = '''
. = parse_syslog!(.message)
'''`,

      fluentd: `# fluent.conf
<source>
  @type tail
  path /var/log/syslog
  pos_file /var/log/td-agent/syslog.pos
  tag system.syslog
  <parse>
    @type syslog
  </parse>
</source>`,
    },
  };

  // Default config for unspecified log types
  const defaultConfig = `# Configuration for ${logType.techName}
#
# This is a template configuration.
# Adjust paths and patterns according to your environment.
#
# Path: Check /logs/${logType.technology}/${logType.name} for exact paths
# Pattern: Use the regex patterns from the log type documentation`;

  return configs[logType.id]?.[platform] || defaultConfig;
};

export default function ExportPage() {
  const [selectedLogType, setSelectedLogType] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("splunk");
  const [copied, setCopied] = useState(false);

  const logType = LOG_TYPES.find((lt) => lt.id === selectedLogType);
  const platform = PLATFORMS.find((p) => p.platform === selectedPlatform);
  const config = logType ? generateConfig(logType, selectedPlatform) : "";

  const copyConfig = () => {
    navigator.clipboard.writeText(config);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([config], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logType?.technology}-${logType?.name}.${platform?.fileExtension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[
          { label: "Tools", href: "/tools" },
          { label: "Config Exporter" },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Download className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Config Exporter</h1>
            <p className="text-muted-foreground">
              Generate ready-to-use configurations for your log collector
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Selection Panel */}
        <div className="space-y-6">
          {/* Log Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileCode className="h-4 w-4" />
                1. Select Log Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedLogType} onValueChange={setSelectedLogType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a log type..." />
                </SelectTrigger>
                <SelectContent>
                  {LOG_TYPES.map((lt) => (
                    <SelectItem key={lt.id} value={lt.id}>
                      {lt.techName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Platform Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                2. Select Platform
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p.platform}
                  onClick={() => setSelectedPlatform(p.platform)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    selectedPlatform === p.platform
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-muted font-bold text-sm">
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  {selectedPlatform === p.platform && (
                    <ChevronRight className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Config Output */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {logType ? `${logType.techName} - ${platform?.name}` : "Configuration"}
                  </CardTitle>
                  <CardDescription>
                    {platform?.fileExtension && logType
                      ? `${logType.technology}-${logType.name}.${platform.fileExtension}`
                      : "Select a log type and platform"}
                  </CardDescription>
                </div>
                {logType && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyConfig}>
                      {copied ? (
                        <Check className="h-4 w-4 mr-1" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      Copy
                    </Button>
                    <Button size="sm" onClick={downloadConfig}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {logType ? (
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                  {config}
                </pre>
              ) : (
                <div className="text-center py-16 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a log type and platform to generate configuration</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Link to docs */}
      {logType && (
        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Need more details about this log type?
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/logs/${logType.technology}/${logType.name}`}>
                  View Full Documentation
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
