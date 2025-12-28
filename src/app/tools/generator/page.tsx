"use client";

import { useState, useCallback } from "react";
import {
  Play,
  Copy,
  Check,
  Download,
  RefreshCw,
  Settings2,
  Zap,
  Shield,
  AlertTriangle,
  Clock,
  Globe,
  Server,
  Activity,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Switch } from "@/components/ui/switch";
import { Breadcrumb } from "@/components/breadcrumb";

// ============================================
// DATA POOLS FOR REALISTIC LOG GENERATION
// ============================================

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  "curl/8.4.0",
  "python-requests/2.31.0",
  "PostmanRuntime/7.35.0",
  "Apache-HttpClient/4.5.14 (Java/17.0.9)",
];

const MALICIOUS_USER_AGENTS = [
  "sqlmap/1.7.12#stable (https://sqlmap.org)",
  "Nikto/2.5.0",
  "WPScan v3.8.25",
  "masscan/1.3.2",
  "Mozilla/5.0 (compatible; Nmap Scripting Engine)",
  "python-urllib3/1.26.18",
  "() { :; }; /bin/bash -c 'cat /etc/passwd'",
];

const PATHS = {
  api: [
    "/api/v1/users",
    "/api/v1/users/123",
    "/api/v1/products",
    "/api/v1/orders",
    "/api/v1/auth/login",
    "/api/v1/auth/logout",
    "/api/v1/auth/refresh",
    "/api/v2/search",
    "/api/v2/analytics",
    "/api/health",
    "/api/metrics",
  ],
  web: [
    "/",
    "/index.html",
    "/about",
    "/contact",
    "/products",
    "/products/category/electronics",
    "/cart",
    "/checkout",
    "/login",
    "/register",
    "/dashboard",
    "/profile",
    "/settings",
    "/blog",
    "/blog/post-123",
  ],
  static: [
    "/static/js/main.js",
    "/static/css/style.css",
    "/static/images/logo.png",
    "/assets/fonts/roboto.woff2",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
  ],
  admin: [
    "/admin",
    "/admin/login",
    "/admin/dashboard",
    "/admin/users",
    "/admin/settings",
    "/wp-admin",
    "/wp-login.php",
    "/phpmyadmin",
    "/administrator",
  ],
  attack: [
    "/../../etc/passwd",
    "/?id=1%27%20OR%20%271%27=%271",
    "/search?q=<script>alert(1)</script>",
    "/admin' OR '1'='1",
    "/wp-config.php.bak",
    "/.env",
    "/.git/config",
    "/api/v1/users?id=1;DROP TABLE users--",
    "/shell.php",
    "/c99.php",
  ],
};

const REFERERS = [
  "-",
  "https://www.google.com/",
  "https://www.google.com/search?q=example",
  "https://www.bing.com/",
  "https://duckduckgo.com/",
  "https://twitter.com/",
  "https://www.facebook.com/",
  "https://www.linkedin.com/",
  "https://github.com/",
  "https://example.com/",
  "https://example.com/products",
];

const SYSLOG_PROCESSES = [
  { name: "sshd", messages: [
    "Accepted publickey for user from {ip} port {port} ssh2",
    "Failed password for invalid user admin from {ip} port {port} ssh2",
    "Connection closed by {ip} port {port} [preauth]",
    "Received disconnect from {ip} port {port}:11: disconnected by user",
    "pam_unix(sshd:session): session opened for user {user} by (uid=0)",
  ]},
  { name: "sudo", messages: [
    "{user} : TTY=pts/0 ; PWD=/home/{user} ; USER=root ; COMMAND=/bin/systemctl restart nginx",
    "{user} : TTY=pts/1 ; PWD=/var/log ; USER=root ; COMMAND=/bin/cat /var/log/auth.log",
    "pam_unix(sudo:session): session opened for user root by {user}(uid=1000)",
  ]},
  { name: "systemd", messages: [
    "Started Session {session} of user {user}.",
    "Starting Daily apt download activities...",
    "Finished Daily apt download activities.",
    "Started Docker Application Container Engine.",
    "nginx.service: Main process exited, code=exited, status=0/SUCCESS",
  ]},
  { name: "kernel", messages: [
    "[UFW BLOCK] IN=eth0 OUT= MAC={mac} SRC={ip} DST=10.0.0.1 LEN=40 TOS=0x00",
    "TCP: request_sock_TCP: Possible SYN flooding on port 80. Sending cookies.",
    "Out of memory: Kill process {pid} ({process}) score {score} or sacrifice child",
  ]},
  { name: "cron", messages: [
    "({user}) CMD (/usr/local/bin/backup.sh)",
    "(root) CMD (cd / && run-parts --report /etc/cron.hourly)",
  ]},
  { name: "nginx", messages: [
    "worker process {pid} exited with code 0",
    "signal 15 (SIGTERM) received, exiting",
    "using the \"epoll\" event method",
  ]},
];

const HOSTNAMES = ["web-01", "web-02", "api-server", "db-master", "cache-01", "proxy-lb", "app-server"];
const USERS = ["root", "admin", "deploy", "ubuntu", "ec2-user", "www-data", "nginx"];

// ============================================
// GENERATOR FUNCTIONS
// ============================================

const randomChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateIP = (type: "random" | "private" | "attacker" = "random"): string => {
  if (type === "private") {
    const subnets = ["10.0", "172.16", "192.168"];
    const subnet = randomChoice(subnets);
    return `${subnet}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
  }
  if (type === "attacker") {
    // Simulate a few attacking IPs
    const attackerIPs = ["45.33.32.156", "185.220.101.1", "91.240.118.172", "162.247.74.7"];
    return randomChoice(attackerIPs);
  }
  return `${randomInt(1, 223)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`;
};

const generateTimestamp = (format: string, offsetMinutes: number = 0): string => {
  const now = new Date(Date.now() - offsetMinutes * 60 * 1000);

  if (format === "clf") {
    // Common Log Format: 25/Dec/2025:10:15:30 +0000
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(now.getDate()).padStart(2, "0");
    const month = months[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toTimeString().split(" ")[0];
    return `${day}/${month}/${year}:${time} +0000`;
  }
  if (format === "syslog") {
    // Syslog: Dec 25 10:15:30
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(now.getDate()).padStart(2, " ");
    const month = months[now.getMonth()];
    const time = now.toTimeString().split(" ")[0];
    return `${month} ${day} ${time}`;
  }
  if (format === "iso") {
    return now.toISOString();
  }
  return now.toISOString();
};

const generateResponseTime = (scenario: string): number => {
  if (scenario === "slow") return randomInt(2000, 30000) / 1000;
  if (scenario === "error") return randomInt(100, 500) / 1000;
  // Normal: mostly fast with occasional slow
  const r = Math.random();
  if (r < 0.7) return randomInt(10, 100) / 1000;
  if (r < 0.95) return randomInt(100, 500) / 1000;
  return randomInt(500, 2000) / 1000;
};

const generateStatus = (scenario: string): number => {
  if (scenario === "normal") {
    const r = Math.random();
    if (r < 0.85) return 200;
    if (r < 0.90) return 201;
    if (r < 0.93) return 301;
    if (r < 0.96) return 304;
    if (r < 0.98) return 404;
    return randomChoice([400, 401, 403, 500, 502, 503]);
  }
  if (scenario === "error_spike") {
    const r = Math.random();
    if (r < 0.3) return 200;
    if (r < 0.5) return 500;
    if (r < 0.7) return 502;
    if (r < 0.85) return 503;
    return 504;
  }
  if (scenario === "attack") {
    const r = Math.random();
    if (r < 0.4) return 403;
    if (r < 0.7) return 404;
    if (r < 0.85) return 400;
    return randomChoice([401, 500]);
  }
  if (scenario === "brute_force") {
    const r = Math.random();
    if (r < 0.85) return 401;
    if (r < 0.95) return 403;
    return 200; // Occasional success
  }
  return 200;
};

const generateBytes = (): number => {
  const r = Math.random();
  if (r < 0.1) return 0;
  if (r < 0.3) return randomInt(100, 500);
  if (r < 0.7) return randomInt(500, 5000);
  if (r < 0.9) return randomInt(5000, 50000);
  return randomInt(50000, 500000);
};

// ============================================
// LOG GENERATORS BY FORMAT
// ============================================

interface GeneratorConfig {
  count: number;
  scenario: string;
  includeAttackPatterns: boolean;
  timeSpanMinutes: number;
  customIP?: string;
  customPath?: string;
}

const generateNginxAccess = (config: GeneratorConfig): string[] => {
  const logs: string[] = [];
  const attackerIP = generateIP("attacker");

  for (let i = 0; i < config.count; i++) {
    const offsetMinutes = (config.timeSpanMinutes / config.count) * (config.count - i);
    const timestamp = generateTimestamp("clf", offsetMinutes);

    let ip: string;
    let path: string;
    let userAgent: string;
    let status: number;

    if (config.scenario === "ddos" && Math.random() < 0.8) {
      ip = attackerIP;
      path = randomChoice(PATHS.web);
      userAgent = randomChoice(MALICIOUS_USER_AGENTS);
      status = generateStatus("attack");
    } else if (config.scenario === "brute_force" && Math.random() < 0.9) {
      ip = attackerIP;
      path = "/api/v1/auth/login";
      userAgent = randomChoice(USER_AGENTS.slice(8)); // Scripts
      status = generateStatus("brute_force");
    } else if (config.scenario === "sql_injection" && Math.random() < 0.7) {
      ip = generateIP("random");
      path = randomChoice(PATHS.attack);
      userAgent = randomChoice(MALICIOUS_USER_AGENTS);
      status = randomChoice([400, 403, 500]);
    } else if (config.scenario === "error_spike") {
      ip = config.customIP || generateIP("random");
      path = config.customPath || randomChoice([...PATHS.api, ...PATHS.web]);
      userAgent = randomChoice(USER_AGENTS);
      status = generateStatus("error_spike");
    } else {
      ip = config.customIP || generateIP("random");
      const pathPool = [...PATHS.api, ...PATHS.web, ...PATHS.static];
      if (config.includeAttackPatterns && Math.random() < 0.05) {
        path = randomChoice(PATHS.attack);
      } else {
        path = config.customPath || randomChoice(pathPool);
      }
      userAgent = randomChoice(USER_AGENTS);
      status = generateStatus("normal");
    }

    const method = path.includes("login") || path.includes("auth") ?
      randomChoice(["GET", "POST", "POST", "POST"]) :
      randomChoice(["GET", "GET", "GET", "POST", "PUT", "DELETE"]);

    const bytes = status === 304 ? 0 : generateBytes();
    const referer = randomChoice(REFERERS);
    const responseTime = generateResponseTime(config.scenario === "slow" ? "slow" : "normal");

    logs.push(
      `${ip} - - [${timestamp}] "${method} ${path} HTTP/1.1" ${status} ${bytes} "${referer}" "${userAgent}" ${responseTime.toFixed(3)}`
    );
  }

  return logs;
};

const generateApacheAccess = (config: GeneratorConfig): string[] => {
  const logs: string[] = [];

  for (let i = 0; i < config.count; i++) {
    const offsetMinutes = (config.timeSpanMinutes / config.count) * (config.count - i);
    const timestamp = generateTimestamp("clf", offsetMinutes);
    const ip = config.customIP || generateIP("random");
    const path = config.customPath || randomChoice([...PATHS.api, ...PATHS.web]);
    const method = randomChoice(["GET", "GET", "GET", "POST"]);
    const status = generateStatus(config.scenario === "error_spike" ? "error_spike" : "normal");
    const bytes = status === 304 ? "-" : String(generateBytes());
    const referer = randomChoice(REFERERS);
    const userAgent = randomChoice(USER_AGENTS);

    logs.push(
      `${ip} - - [${timestamp}] "${method} ${path} HTTP/1.1" ${status} ${bytes} "${referer}" "${userAgent}"`
    );
  }

  return logs;
};

const generateSyslog = (config: GeneratorConfig): string[] => {
  const logs: string[] = [];
  const hostname = randomChoice(HOSTNAMES);

  for (let i = 0; i < config.count; i++) {
    const offsetMinutes = (config.timeSpanMinutes / config.count) * (config.count - i);
    const timestamp = generateTimestamp("syslog", offsetMinutes);
    const processInfo = randomChoice(SYSLOG_PROCESSES);
    const pid = randomInt(1000, 65000);
    let message = randomChoice(processInfo.messages);

    // Replace placeholders
    message = message
      .replace("{ip}", generateIP("random"))
      .replace("{port}", String(randomInt(1024, 65535)))
      .replace("{user}", randomChoice(USERS))
      .replace("{session}", String(randomInt(1, 999)))
      .replace("{pid}", String(randomInt(1000, 65000)))
      .replace("{process}", randomChoice(["nginx", "apache2", "node"]))
      .replace("{score}", String(randomInt(100, 1000)))
      .replace("{mac}", "00:11:22:33:44:55");

    logs.push(`${timestamp} ${hostname} ${processInfo.name}[${pid}]: ${message}`);
  }

  return logs;
};

const generateJSON = (config: GeneratorConfig): string[] => {
  const logs: string[] = [];

  for (let i = 0; i < config.count; i++) {
    const offsetMinutes = (config.timeSpanMinutes / config.count) * (config.count - i);
    const timestamp = generateTimestamp("iso", offsetMinutes);
    const ip = config.customIP || generateIP("random");
    const path = config.customPath || randomChoice([...PATHS.api, ...PATHS.web]);
    const method = randomChoice(["GET", "GET", "GET", "POST", "PUT", "DELETE"]);
    const status = generateStatus(config.scenario === "error_spike" ? "error_spike" : "normal");
    const responseTime = generateResponseTime(config.scenario === "slow" ? "slow" : "normal");

    const log = {
      timestamp,
      level: status >= 500 ? "ERROR" : status >= 400 ? "WARN" : "INFO",
      method,
      path,
      status,
      response_time_ms: Math.round(responseTime * 1000),
      client_ip: ip,
      user_agent: randomChoice(USER_AGENTS),
      request_id: `req_${Math.random().toString(36).substring(2, 15)}`,
      bytes_sent: generateBytes(),
    };

    logs.push(JSON.stringify(log));
  }

  return logs;
};

const generateAuthLog = (config: GeneratorConfig): string[] => {
  const logs: string[] = [];
  const hostname = randomChoice(HOSTNAMES);
  const attackerIP = generateIP("attacker");

  for (let i = 0; i < config.count; i++) {
    const offsetMinutes = (config.timeSpanMinutes / config.count) * (config.count - i);
    const timestamp = generateTimestamp("syslog", offsetMinutes);
    const pid = randomInt(1000, 65000);

    let message: string;
    let ip: string;

    if (config.scenario === "brute_force" && Math.random() < 0.85) {
      ip = attackerIP;
      const user = randomChoice(["admin", "root", "test", "user", "guest"]);
      message = `Failed password for invalid user ${user} from ${ip} port ${randomInt(40000, 65000)} ssh2`;
    } else if (Math.random() < 0.7) {
      ip = generateIP("private");
      const user = randomChoice(USERS);
      message = `Accepted publickey for ${user} from ${ip} port ${randomInt(40000, 65000)} ssh2`;
    } else {
      ip = generateIP("random");
      message = randomChoice([
        `Connection closed by ${ip} port ${randomInt(40000, 65000)} [preauth]`,
        `pam_unix(sshd:session): session opened for user ${randomChoice(USERS)} by (uid=0)`,
        `Received disconnect from ${ip} port ${randomInt(40000, 65000)}:11: disconnected by user`,
      ]);
    }

    logs.push(`${timestamp} ${hostname} sshd[${pid}]: ${message}`);
  }

  return logs;
};

// ============================================
// COMPONENT
// ============================================

interface Scenario {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const SCENARIOS: Scenario[] = [
  { id: "normal", name: "Normal Traffic", description: "Regular web traffic with typical distribution", icon: <Activity className="h-4 w-4" />, color: "bg-green-500" },
  { id: "error_spike", name: "Error Spike", description: "High rate of 5xx errors", icon: <AlertTriangle className="h-4 w-4" />, color: "bg-red-500" },
  { id: "ddos", name: "DDoS Attack", description: "Distributed denial of service pattern", icon: <Zap className="h-4 w-4" />, color: "bg-orange-500" },
  { id: "brute_force", name: "Brute Force", description: "Password guessing attack", icon: <Shield className="h-4 w-4" />, color: "bg-purple-500" },
  { id: "sql_injection", name: "SQL Injection", description: "SQLi and path traversal attempts", icon: <AlertTriangle className="h-4 w-4" />, color: "bg-yellow-500" },
  { id: "slow", name: "Slow Responses", description: "High latency, slow backend", icon: <Clock className="h-4 w-4" />, color: "bg-blue-500" },
];

const LOG_FORMATS = [
  { id: "nginx", name: "Nginx Access Log", description: "Combined format" },
  { id: "apache", name: "Apache Access Log", description: "Combined format" },
  { id: "syslog", name: "Linux Syslog", description: "RFC3164" },
  { id: "json", name: "JSON Lines", description: "Structured logs" },
  { id: "auth", name: "Auth Log", description: "SSH authentication" },
];

export default function GeneratorPage() {
  const [format, setFormat] = useState("nginx");
  const [scenario, setScenario] = useState("normal");
  const [count, setCount] = useState(20);
  const [timeSpan, setTimeSpan] = useState(60);
  const [includeAttacks, setIncludeAttacks] = useState(false);
  const [customIP, setCustomIP] = useState("");
  const [customPath, setCustomPath] = useState("");
  const [generatedLogs, setGeneratedLogs] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateLogs = useCallback(() => {
    const config: GeneratorConfig = {
      count,
      scenario,
      includeAttackPatterns: includeAttacks,
      timeSpanMinutes: timeSpan,
      customIP: customIP || undefined,
      customPath: customPath || undefined,
    };

    let logs: string[] = [];

    switch (format) {
      case "nginx":
        logs = generateNginxAccess(config);
        break;
      case "apache":
        logs = generateApacheAccess(config);
        break;
      case "syslog":
        logs = generateSyslog(config);
        break;
      case "json":
        logs = generateJSON(config);
        break;
      case "auth":
        logs = generateAuthLog(config);
        break;
    }

    setGeneratedLogs(logs);
  }, [format, scenario, count, timeSpan, includeAttacks, customIP, customPath]);

  const copyLogs = () => {
    navigator.clipboard.writeText(generatedLogs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadLogs = () => {
    const blob = new Blob([generatedLogs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${format}-${scenario}-${count}-logs.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shuffleLogs = () => {
    setGeneratedLogs([...generatedLogs].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="container py-10">
      <Breadcrumb
        items={[
          { label: "Tools", href: "/tools" },
          { label: "Log Generator" },
        ]}
        className="mb-6"
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Log Generator</h1>
            <p className="text-muted-foreground">
              Generate realistic sample logs for testing parsers and SIEM rules
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Log Format */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Log Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {LOG_FORMATS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    format === f.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Scenario Selection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Scenario
              </CardTitle>
              <CardDescription>
                Choose a traffic pattern to simulate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                    scenario === s.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded ${s.color} text-white`}>
                    {s.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Count */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Number of logs</Label>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
                <Slider
                  value={[count]}
                  onValueChange={(v) => setCount(v[0])}
                  min={5}
                  max={500}
                  step={5}
                />
              </div>

              {/* Time Span */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Time span (minutes)</Label>
                  <span className="text-sm text-muted-foreground">{timeSpan}m</span>
                </div>
                <Slider
                  value={[timeSpan]}
                  onValueChange={(v) => setTimeSpan(v[0])}
                  min={1}
                  max={1440}
                  step={5}
                />
              </div>

              {/* Include Attack Patterns */}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Include attack patterns</Label>
                  <p className="text-xs text-muted-foreground">SQLi, XSS, path traversal</p>
                </div>
                <Switch
                  checked={includeAttacks}
                  onCheckedChange={setIncludeAttacks}
                />
              </div>

              {/* Custom IP */}
              <div className="space-y-2">
                <Label>Custom source IP (optional)</Label>
                <Input
                  placeholder="e.g., 192.168.1.100"
                  value={customIP}
                  onChange={(e) => setCustomIP(e.target.value)}
                />
              </div>

              {/* Custom Path */}
              <div className="space-y-2">
                <Label>Custom path (optional)</Label>
                <Input
                  placeholder="e.g., /api/v1/users"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button onClick={generateLogs} className="w-full" size="lg">
            <Play className="h-4 w-4 mr-2" />
            Generate Logs
          </Button>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated Logs</CardTitle>
                  <CardDescription>
                    {generatedLogs.length > 0
                      ? `${generatedLogs.length} log entries generated`
                      : "Configure settings and click Generate"}
                  </CardDescription>
                </div>
                {generatedLogs.length > 0 && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={shuffleLogs}>
                      <Shuffle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={generateLogs}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyLogs}>
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" onClick={downloadLogs}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
              {generatedLogs.length > 0 ? (
                <div className="h-[600px] overflow-auto rounded-lg bg-muted p-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                    {generatedLogs.join("\n")}
                  </pre>
                </div>
              ) : (
                <div className="h-[600px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Server className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">No logs generated yet</p>
                    <p className="text-sm mt-1">Select a format and scenario, then click Generate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Bar */}
      {generatedLogs.length > 0 && (
        <Card className="mt-6">
          <CardContent className="py-4">
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold">{generatedLogs.length}</p>
                <p className="text-muted-foreground">Total Logs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{(generatedLogs.join("\n").length / 1024).toFixed(1)} KB</p>
                <p className="text-muted-foreground">Total Size</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{timeSpan}m</p>
                <p className="text-muted-foreground">Time Span</p>
              </div>
              <div className="text-center">
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {SCENARIOS.find(s => s.id === scenario)?.name}
                </Badge>
                <p className="text-muted-foreground mt-1">Scenario</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
