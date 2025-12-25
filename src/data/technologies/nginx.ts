import { Technology, LogType } from "@/types";

export const nginx: Technology = {
  id: "nginx",
  name: "Nginx",
  description: "Web server, reverse proxy, load balancer",
  vendor: "Nginx Inc. (F5)",
  openSource: true,
  license: "BSD-like",
  officialDocs: "https://nginx.org/en/docs/",
  githubRepo: "https://github.com/nginx/nginx",
  currentVersion: "1.26.x",
  logo: "/logos/nginx.svg",
  categories: ["Web Server", "Reverse Proxy", "Load Balancer"],
  logTypes: [
    {
      id: "access",
      name: "Access Log",
      description: "Records every HTTP request processed",
      defaultPath: "/var/log/nginx/access.log",
    },
    {
      id: "error",
      name: "Error Log",
      description: "Errors, warnings, and debug information",
      defaultPath: "/var/log/nginx/error.log",
    },
  ],
  defaultPaths: {
    linux_deb: "/var/log/nginx/",
    linux_rpm: "/var/log/nginx/",
    alpine: "/var/log/nginx/",
    windows: "C:\\nginx\\logs\\",
    macos_homebrew: "/opt/homebrew/var/log/nginx/",
    docker: "stdout / stderr",
    kubernetes: "stdout -> container runtime",
  },
  configFile: "/etc/nginx/nginx.conf",
  related: ["nginx-docker", "nginx-kubernetes", "nginx-modsecurity"],
  compareWith: ["apache", "caddy", "traefik"],
  contribution: {
    createdAt: "2024-01-15",
    createdBy: "admin",
    updatedAt: "2025-12-18",
    updatedBy: "marie_sec",
    contributors: ["admin", "jean_ops", "marie_sec", "alex_devops"],
    validated: true,
  },
};

export const nginxAccessLog: LogType = {
  id: "access",
  technologyId: "nginx",
  name: "Access Log",
  description: "Records every HTTP request processed by Nginx",
  quickFacts: {
    defaultPathLinux: "/var/log/nginx/access.log",
    defaultPathDocker: "stdout",
    defaultFormat: "combined",
    jsonNative: true,
    jsonSinceVersion: "1.11.8",
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/nginx/access.log" },
      { distro: "RHEL / CentOS / Fedora", path: "/var/log/nginx/access.log" },
      { distro: "Alpine", path: "/var/log/nginx/access.log" },
      { distro: "Arch", path: "/var/log/nginx/access.log" },
    ],
    windows: [{ variant: "Default", path: "C:\\nginx\\logs\\access.log" }],
    macos: [
      {
        variant: "Homebrew",
        path: "/opt/homebrew/var/log/nginx/access.log",
      },
    ],
    containers: [
      {
        platform: "Docker (official image)",
        path: "stdout",
        note: "By default, Nginx in Docker writes to stdout",
      },
      {
        platform: "Docker (custom)",
        path: "/var/log/nginx/access.log",
        note: "If volume mounted",
      },
      {
        platform: "Kubernetes",
        path: "stdout -> captured by container runtime",
        note: "Logs accessible via kubectl logs",
      },
    ],
    cloud: [
      { provider: "AWS Elastic Beanstalk", path: "/var/log/nginx/access.log" },
      { provider: "Azure App Service", path: "D:\\home\\LogFiles\\http\\RawLogs" },
      { provider: "GCP App Engine", path: "Cloud Logging (automatic)" },
    ],
  },
  formats: [
    {
      id: "combined",
      name: "Combined Log Format",
      isDefault: true,
      structure:
        '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"',
      example: `192.168.1.50 - alice [20/Dec/2025:14:32:18 +0100] "GET /api/users HTTP/1.1" 200 1534 "https://app.example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" abdou`,
    },
    {
      id: "common",
      name: "Common Log Format (CLF)",
      isDefault: false,
      structure:
        '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent',
      example: `192.168.1.50 - alice [20/Dec/2025:14:32:18 +0100] "GET /api/users HTTP/1.1" 200 1534`,
    },
    {
      id: "json",
      name: "JSON Format",
      isDefault: false,
      nativeSupport: true,
      sinceVersion: "1.11.8",
      configRequired: true,
      structure: `log_format json_combined escape=json
'{'
  '"time": "$time_iso8601",'
  '"remote_addr": "$remote_addr",'
  '"remote_user": "$remote_user",'
  '"request_method": "$request_method",'
  '"request_uri": "$request_uri",'
  '"status": $status,'
  '"body_bytes_sent": $body_bytes_sent,'
  '"http_referer": "$http_referer",'
  '"http_user_agent": "$http_user_agent",'
  '"request_time": $request_time,'
  '"upstream_response_time": "$upstream_response_time",'
  '"request_id": "$request_id"'
'}';`,
      example: `{"time":"2025-12-20T14:32:18+01:00","remote_addr":"192.168.1.50","remote_user":"alice","request_method":"GET","request_uri":"/api/users","status":200,"body_bytes_sent":1534,"http_referer":"https://app.example.com","http_user_agent":"Mozilla/5.0...","request_time":0.052,"upstream_response_time":"0.050","request_id":"a1b2c3d4e5f6"}`,
    },
  ],
  fields: [
    {
      name: "remote_addr",
      variable: "$remote_addr",
      type: "ip",
      description: "Client IP address",
      example: "192.168.1.50",
    },
    {
      name: "remote_user",
      variable: "$remote_user",
      type: "string",
      description: "Authenticated user (HTTP Basic Auth)",
      example: "alice",
      note: 'Empty (-) if no authentication',
    },
    {
      name: "time_local",
      variable: "$time_local",
      type: "datetime",
      format: "[dd/MMM/yyyy:HH:mm:ss Z]",
      description: "Timestamp in Apache format",
      example: "[20/Dec/2025:14:32:18 +0100]",
    },
    {
      name: "time_iso8601",
      variable: "$time_iso8601",
      type: "datetime",
      format: "ISO 8601",
      description: "Timestamp in ISO format (recommended)",
      example: "2025-12-20T14:32:18+01:00",
    },
    {
      name: "request",
      variable: "$request",
      type: "string",
      description: "Full request line",
      example: "GET /api/users HTTP/1.1",
    },
    {
      name: "request_method",
      variable: "$request_method",
      type: "string",
      description: "HTTP method",
      example: "GET",
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
    },
    {
      name: "request_uri",
      variable: "$request_uri",
      type: "string",
      description: "URI with query string",
      example: "/api/users?page=1&limit=10",
    },
    {
      name: "uri",
      variable: "$uri",
      type: "string",
      description: "URI without query string",
      example: "/api/users",
    },
    {
      name: "args",
      variable: "$args",
      type: "string",
      description: "Query string only",
      example: "page=1&limit=10",
    },
    {
      name: "status",
      variable: "$status",
      type: "integer",
      description: "HTTP response status code",
      example: 200,
      range: [100, 599],
    },
    {
      name: "body_bytes_sent",
      variable: "$body_bytes_sent",
      type: "integer",
      description: "Response body size in bytes (without headers)",
      example: 1534,
    },
    {
      name: "bytes_sent",
      variable: "$bytes_sent",
      type: "integer",
      description: "Total bytes sent (with headers)",
      example: 1842,
    },
    {
      name: "http_referer",
      variable: "$http_referer",
      type: "string",
      description: "Referer header",
      example: "https://app.example.com/dashboard",
    },
    {
      name: "http_user_agent",
      variable: "$http_user_agent",
      type: "string",
      description: "User-Agent header",
      example:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      name: "request_time",
      variable: "$request_time",
      type: "float",
      unit: "seconds",
      description: "Total request processing time",
      example: 0.052,
    },
    {
      name: "upstream_response_time",
      variable: "$upstream_response_time",
      type: "float",
      unit: "seconds",
      description: "Backend response time",
      example: 0.05,
    },
    {
      name: "upstream_addr",
      variable: "$upstream_addr",
      type: "string",
      description: "Upstream server address",
      example: "10.0.0.5:8080",
    },
    {
      name: "request_id",
      variable: "$request_id",
      type: "string",
      description: "Unique request ID (traceability)",
      example: "a1b2c3d4e5f6",
      sinceVersion: "1.11.0",
    },
    {
      name: "http_x_forwarded_for",
      variable: "$http_x_forwarded_for",
      type: "string",
      description: "Original IP if behind proxy/load balancer",
      example: "203.0.113.50, 70.41.3.18",
    },
    {
      name: "ssl_protocol",
      variable: "$ssl_protocol",
      type: "string",
      description: "TLS protocol version",
      example: "TLSv1.3",
    },
    {
      name: "ssl_cipher",
      variable: "$ssl_cipher",
      type: "string",
      description: "Cipher suite used",
      example: "TLS_AES_256_GCM_SHA384",
    },
  ],
  parsing: {
    grok: {
      combined: "%{COMBINEDAPACHELOG}",
      common: "%{COMMONAPACHELOG}",
    },
    regex: {
      combined: `^(?P<remote_addr>\\S+) - (?P<remote_user>\\S+) \\[(?P<time_local>[^\\]]+)\\] "(?P<request_method>\\S+) (?P<request_uri>\\S+) (?P<protocol>[^"]+)" (?P<status>\\d+) (?P<body_bytes_sent>\\d+) "(?P<http_referer>[^"]*)" "(?P<http_user_agent>[^"]*)"`,
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
  date {
    match => [ "timestamp", "dd/MMM/yyyy:HH:mm:ss Z" ]
  }
}`,
      fluentd: `<source>
  @type tail
  path /var/log/nginx/access.log
  pos_file /var/log/td-agent/nginx-access.pos
  tag nginx.access
  <parse>
    @type nginx
  </parse>
</source>`,
      fluent_bit: `[INPUT]
    Name tail
    Path /var/log/nginx/access.log
    Parser nginx
    Tag nginx.access

[PARSER]
    Name nginx
    Format regex
    Regex ^(?<remote_addr>[^ ]*) - (?<remote_user>[^ ]*) \\[(?<time_local>[^\\]]*)\\] "(?<request>[^"]*)" (?<status>[^ ]*) (?<body_bytes_sent>[^ ]*) "(?<http_referer>[^"]*)" "(?<http_user_agent>[^"]*)"`,
      vector: `[sources.nginx_access]
type = "file"
include = ["/var/log/nginx/access.log"]

[transforms.parse_nginx]
type = "remap"
inputs = ["nginx_access"]
source = '''
. = parse_nginx_log!(.message, "combined")
'''`,
      promtail: `scrape_configs:
  - job_name: nginx
    static_configs:
      - targets: [localhost]
        labels:
          job: nginx
          __path__: /var/log/nginx/access.log
    pipeline_stages:
      - regex:
          expression: '^(?P<remote_addr>\\S+) - (?P<remote_user>\\S+) \\[(?P<time_local>[^\\]]+)\\] ...'`,
      filebeat: `filebeat.inputs:
  - type: log
    paths:
      - /var/log/nginx/access.log
    processors:
      - dissect:
          tokenizer: '%{remote_addr} - %{remote_user} [%{time_local}] "%{request}" %{status} %{body_bytes_sent} "%{http_referer}" "%{http_user_agent}"'`,
    },
  },
  configuration: {
    enableLogging: {
      directive: "access_log /var/log/nginx/access.log combined;",
      file: "/etc/nginx/nginx.conf or /etc/nginx/sites-available/*",
      note: "Enabled by default",
    },
    disableLogging: {
      directive: "access_log off;",
    },
    changeFormat: {
      steps: [
        "Define a custom log_format",
        "Apply it with access_log directive",
      ],
      example: `# In http {} block
log_format custom '$remote_addr - $remote_user [$time_local] '
                  '"$request" $status $body_bytes_sent '
                  '"$http_referer" "$http_user_agent" '
                  '$request_time $upstream_response_time';

# In server {} or location {} block
access_log /var/log/nginx/access.log custom;`,
    },
    enableJson: {
      recommended: true,
      example: `log_format json_combined escape=json
'{'
  '"time": "$time_iso8601",'
  '"remote_addr": "$remote_addr",'
  '"remote_user": "$remote_user",'
  '"request_method": "$request_method",'
  '"request_uri": "$request_uri",'
  '"status": $status,'
  '"body_bytes_sent": $body_bytes_sent,'
  '"http_referer": "$http_referer",'
  '"http_user_agent": "$http_user_agent",'
  '"request_time": $request_time,'
  '"upstream_response_time": "$upstream_response_time",'
  '"request_id": "$request_id"'
'}';

access_log /var/log/nginx/access.json json_combined;`,
      note: "escape=json escapes special characters to avoid breaking JSON",
    },
    addRequestId: {
      description:
        "Add unique ID to trace requests across services",
      example: `# In server {} block
add_header X-Request-ID $request_id;

# Pass to backend
proxy_set_header X-Request-ID $request_id;`,
      sinceVersion: "1.11.0",
    },
    conditionalLogging: {
      description: "Log only certain requests",
      example: `# Don't log health checks
map $request_uri $loggable {
  /health 0;
  /ready 0;
  default 1;
}

access_log /var/log/nginx/access.log combined if=$loggable;`,
    },
    logToSyslog: {
      example: `access_log syslog:server=unix:/dev/log,facility=local7,tag=nginx,severity=info combined;`,
    },
    logRotation: {
      tool: "logrotate",
      configPath: "/etc/logrotate.d/nginx",
      example: `/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \`cat /var/run/nginx.pid\`
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Traffic monitoring",
        description: "Requests per second, response codes",
        fieldsUsed: ["status", "request_time"],
      },
      {
        name: "Backend performance",
        description: "Upstream response times",
        fieldsUsed: ["upstream_response_time", "upstream_addr"],
      },
      {
        name: "Error detection",
        description: "5xx and 4xx spikes",
        fieldsUsed: ["status"],
      },
      {
        name: "Latency analysis",
        description: "Slow requests, percentiles",
        fieldsUsed: ["request_time"],
      },
    ],
    security: [
      {
        name: "Scan detection",
        description: "Multiple 404s in short time",
        fieldsUsed: ["status", "remote_addr", "request_uri"],
        logic: "COUNT status=404 BY remote_addr WHERE count > 50 IN 1min",
      },
      {
        name: "SQL injection attempts",
        description: "SQLi patterns in URIs",
        fieldsUsed: ["request_uri"],
        logic: "request_uri CONTAINS ('UNION', 'SELECT', '1=1', '--', 'OR 1')",
      },
      {
        name: "Brute force",
        description: "Multiple 401/403 from same IP",
        fieldsUsed: ["status", "remote_addr"],
        logic:
          "COUNT status IN (401, 403) BY remote_addr WHERE count > 20 IN 5min",
      },
      {
        name: "Suspicious user agents",
        description: "Bots, scanners, automated tools",
        fieldsUsed: ["http_user_agent"],
        logic:
          "http_user_agent CONTAINS ('sqlmap', 'nikto', 'nmap', 'masscan')",
      },
      {
        name: "Path traversal",
        description: "Attempts to access system files",
        fieldsUsed: ["request_uri"],
        logic: "request_uri CONTAINS ('../', '..\\\\', '/etc/', '/proc/')",
      },
    ],
    business: [
      {
        name: "Popular pages",
        description: "Top URIs by hit count",
        fieldsUsed: ["request_uri"],
      },
      {
        name: "Traffic sources",
        description: "Referer analysis",
        fieldsUsed: ["http_referer"],
      },
      {
        name: "Client types",
        description: "User-Agent breakdown (mobile, desktop, bot)",
        fieldsUsed: ["http_user_agent"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Logs are not being written",
      causes: [
        "access_log is set to 'off'",
        "Insufficient permissions on directory",
        "Disk full",
      ],
      solutions: [
        "Check nginx.conf: access_log should not be 'off'",
        "Check permissions: chown www-data:adm /var/log/nginx && chmod 755 /var/log/nginx",
        "Check disk space: df -h /var/log",
      ],
    },
    {
      problem: "Special characters break my JSON",
      causes: ["escape=json missing from log_format"],
      solutions: ["Add escape=json: log_format json escape=json '{...}'"],
    },
    {
      problem: "Timestamp not parsing correctly",
      causes: ["Non-standard format", "Missing timezone"],
      solutions: [
        "Use $time_iso8601 instead of $time_local for standard format",
        "Check the parsing pattern",
      ],
    },
    {
      problem: "I don't see requests to backend",
      causes: ["upstream_* variables not configured"],
      solutions: [
        "Add $upstream_response_time and $upstream_addr to log_format",
      ],
    },
    {
      problem: "Logs are too large",
      causes: ["No rotation configured", "Too much verbosity"],
      solutions: [
        "Configure logrotate",
        "Exclude health checks with conditional logging",
        "Compress old logs",
      ],
    },
    {
      problem: "Client IP always 127.0.0.1 or proxy IP",
      causes: ["Nginx is behind a reverse proxy or load balancer"],
      solutions: [
        "Use $http_x_forwarded_for instead of $remote_addr",
        "Configure real_ip_header and set_real_ip_from",
      ],
    },
  ],
  allVariables: {
    request: [
      { var: "$request", desc: "Full request line" },
      { var: "$request_method", desc: "HTTP method (GET, POST...)" },
      { var: "$request_uri", desc: "URI with query string" },
      { var: "$uri", desc: "URI without query string" },
      { var: "$args", desc: "Query string only" },
      { var: "$query_string", desc: "Alias for $args" },
      { var: "$request_body", desc: "Request body" },
      { var: "$request_length", desc: "Request size" },
      { var: "$request_time", desc: "Processing time (sec)" },
      { var: "$request_id", desc: "Unique ID (since 1.11.0)" },
    ],
    client: [
      { var: "$remote_addr", desc: "Client IP" },
      { var: "$remote_port", desc: "Client port" },
      { var: "$remote_user", desc: "HTTP Basic Auth user" },
      { var: "$http_x_forwarded_for", desc: "Original IP if proxied" },
    ],
    response: [
      { var: "$status", desc: "HTTP status code" },
      { var: "$body_bytes_sent", desc: "Response size (without headers)" },
      { var: "$bytes_sent", desc: "Total bytes sent" },
    ],
    time: [
      { var: "$time_local", desc: "Apache format timestamp" },
      { var: "$time_iso8601", desc: "ISO 8601 timestamp" },
      { var: "$msec", desc: "Unix timestamp with milliseconds" },
    ],
    upstream: [
      { var: "$upstream_addr", desc: "Backend address" },
      { var: "$upstream_response_time", desc: "Backend response time" },
      { var: "$upstream_status", desc: "Backend HTTP status" },
      { var: "$upstream_connect_time", desc: "Connection time" },
      { var: "$upstream_header_time", desc: "Time to headers" },
    ],
    ssl: [
      { var: "$ssl_protocol", desc: "TLSv1.2, TLSv1.3..." },
      { var: "$ssl_cipher", desc: "Cipher used" },
      { var: "$ssl_client_cert", desc: "Client certificate" },
      { var: "$ssl_session_id", desc: "SSL session ID" },
    ],
    headers: [
      { var: "$http_host", desc: "Host header" },
      { var: "$http_referer", desc: "Referer header" },
      { var: "$http_user_agent", desc: "User-Agent header" },
      { var: "$http_cookie", desc: "Cookie header" },
      { var: "$http_HEADER", desc: "Any header (replace HEADER)" },
    ],
    server: [
      { var: "$server_name", desc: "Server name" },
      { var: "$server_addr", desc: "Server IP" },
      { var: "$server_port", desc: "Server port" },
      { var: "$server_protocol", desc: "HTTP/1.0, HTTP/1.1, HTTP/2" },
      { var: "$hostname", desc: "Machine hostname" },
      { var: "$pid", desc: "Worker process PID" },
      { var: "$connection", desc: "Connection number" },
      { var: "$connection_requests", desc: "Requests on this connection" },
    ],
  },
  testedOn: [
    {
      version: "1.26.2",
      os: "Ubuntu 24.04",
      testedBy: "jean_ops",
      testedAt: "2025-12-15",
    },
    {
      version: "1.26.2",
      os: "Debian 12",
      testedBy: "marie_sec",
      testedAt: "2025-12-18",
    },
    {
      version: "1.25.4",
      os: "Alpine 3.19",
      testedBy: "alex_devops",
      testedAt: "2025-11-20",
    },
    {
      version: "1.24.0",
      os: "RHEL 9",
      testedBy: "pierre_admin",
      testedAt: "2025-10-10",
    },
    {
      version: "1.26.1",
      os: "Docker (official image)",
      testedBy: "sarah_sre",
      testedAt: "2025-12-01",
    },
  ],
  contribution: {
    createdAt: "2024-01-15",
    createdBy: "admin",
    updatedAt: "2025-12-18",
    updatedBy: "marie_sec",
    contributors: [
      "admin",
      "jean_ops",
      "marie_sec",
      "alex_devops",
      "pierre_admin",
      "sarah_sre",
    ],
    upvotes: 234,
    downvotes: 3,
    validated: true,
    commentsCount: 12,
  },
};

export const nginxErrorLog: LogType = {
  id: "error",
  technologyId: "nginx",
  name: "Error Log",
  description: "Logs errors, warnings, and debug information from Nginx",
  quickFacts: {
    defaultPathLinux: "/var/log/nginx/error.log",
    defaultPathDocker: "stderr",
    defaultFormat: "text",
    jsonNative: false,
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/nginx/error.log" },
      { distro: "RHEL / CentOS / Fedora", path: "/var/log/nginx/error.log" },
      { distro: "Alpine", path: "/var/log/nginx/error.log" },
    ],
    windows: [{ variant: "Default", path: "C:\\nginx\\logs\\error.log" }],
    macos: [
      { variant: "Homebrew", path: "/opt/homebrew/var/log/nginx/error.log" },
    ],
    containers: [
      {
        platform: "Docker (official image)",
        path: "stderr",
        note: "Nginx in Docker writes errors to stderr by default",
      },
      {
        platform: "Kubernetes",
        path: "stderr -> captured by container runtime",
      },
    ],
  },
  formats: [
    {
      id: "default",
      name: "Default Error Format",
      isDefault: true,
      structure:
        "YYYY/MM/DD HH:MM:SS [level] pid#tid: *cid message",
      example: `2025/12/20 14:32:18 [error] 1234#5678: *9012 open() "/var/www/html/missing.html" failed (2: No such file or directory), client: 192.168.1.50, server: example.com, request: "GET /missing.html HTTP/1.1", host: "example.com"`,
    },
  ],
  fields: [
    {
      name: "timestamp",
      type: "datetime",
      format: "YYYY/MM/DD HH:MM:SS",
      description: "When the error occurred",
      example: "2025/12/20 14:32:18",
    },
    {
      name: "level",
      type: "string",
      description: "Error severity level",
      example: "error",
      enum: ["debug", "info", "notice", "warn", "error", "crit", "alert", "emerg"],
    },
    {
      name: "pid",
      type: "integer",
      description: "Process ID",
      example: 1234,
    },
    {
      name: "tid",
      type: "integer",
      description: "Thread ID",
      example: 5678,
    },
    {
      name: "cid",
      type: "integer",
      description: "Connection ID",
      example: 9012,
    },
    {
      name: "message",
      type: "string",
      description: "Error message with context",
      example: 'open() "/var/www/html/missing.html" failed (2: No such file or directory)',
    },
    {
      name: "client",
      type: "ip",
      description: "Client IP address",
      example: "192.168.1.50",
    },
    {
      name: "server",
      type: "string",
      description: "Server name from request",
      example: "example.com",
    },
    {
      name: "request",
      type: "string",
      description: "HTTP request line",
      example: "GET /missing.html HTTP/1.1",
    },
  ],
  parsing: {
    grok: {
      default: "%{DATA:timestamp} \\[%{WORD:level}\\] %{NUMBER:pid}#%{NUMBER:tid}: \\*%{NUMBER:cid} %{GREEDYDATA:message}",
    },
    regex: {
      default: `^(?P<timestamp>\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(?P<level>\\w+)\\] (?P<pid>\\d+)#(?P<tid>\\d+): \\*(?P<cid>\\d+) (?P<message>.*)$`,
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "%{DATA:timestamp} \\[%{WORD:level}\\] %{NUMBER:pid}#%{NUMBER:tid}: \\*%{NUMBER:cid} %{GREEDYDATA:error_message}" }
  }
  date {
    match => [ "timestamp", "yyyy/MM/dd HH:mm:ss" ]
  }
}`,
      vector: `[sources.nginx_error]
type = "file"
include = ["/var/log/nginx/error.log"]

[transforms.parse_nginx_error]
type = "remap"
inputs = ["nginx_error"]
source = '''
. = parse_regex!(.message, r'^(?P<timestamp>\\d{4}/\\d{2}/\\d{2} \\d{2}:\\d{2}:\\d{2}) \\[(?P<level>\\w+)\\] (?P<pid>\\d+)#(?P<tid>\\d+): \\*(?P<cid>\\d+) (?P<error_message>.*)')
'''`,
    },
  },
  configuration: {
    enableLogging: {
      directive: "error_log /var/log/nginx/error.log warn;",
      file: "/etc/nginx/nginx.conf",
      note: "Second parameter is the minimum log level",
    },
    disableLogging: {
      directive: "error_log /dev/null;",
      note: "Not recommended - you'll miss important errors",
    },
    logRotation: {
      tool: "logrotate",
      configPath: "/etc/logrotate.d/nginx",
      example: `/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 \`cat /var/run/nginx.pid\`
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Error rate monitoring",
        description: "Track error frequency over time",
        fieldsUsed: ["level", "timestamp"],
      },
      {
        name: "Missing files detection",
        description: "Find 404 errors for static files",
        fieldsUsed: ["message"],
      },
      {
        name: "Upstream failures",
        description: "Backend connection issues",
        fieldsUsed: ["message"],
      },
    ],
    security: [
      {
        name: "SSL/TLS errors",
        description: "Certificate problems, handshake failures",
        fieldsUsed: ["message", "level"],
        logic: "message CONTAINS ('SSL', 'certificate', 'handshake')",
      },
      {
        name: "Access denied",
        description: "Permission and auth failures",
        fieldsUsed: ["message"],
        logic: "message CONTAINS ('forbidden', 'denied', 'auth')",
      },
    ],
    business: [
      {
        name: "Configuration errors",
        description: "Nginx config problems on reload",
        fieldsUsed: ["message", "level"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Too much noise in error log",
      causes: ["Log level set too low (e.g., debug)"],
      solutions: [
        "Change error_log level to 'warn' or 'error'",
        "Use error_log /var/log/nginx/error.log error;",
      ],
    },
    {
      problem: "Errors not appearing",
      causes: ["Log level set too high", "error_log pointing to /dev/null"],
      solutions: ["Set appropriate log level: error_log /var/log/nginx/error.log warn;"],
    },
  ],
  testedOn: [
    {
      version: "1.26.2",
      os: "Ubuntu 24.04",
      testedBy: "jean_ops",
      testedAt: "2025-12-15",
    },
  ],
  contribution: {
    createdAt: "2024-01-15",
    createdBy: "admin",
    updatedAt: "2025-12-18",
    updatedBy: "jean_ops",
    contributors: ["admin", "jean_ops"],
    upvotes: 89,
    downvotes: 1,
    validated: true,
    commentsCount: 4,
  },
};
