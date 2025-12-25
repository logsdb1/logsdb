import { Technology, LogType } from "@/types";

export const apache: Technology = {
  id: "apache",
  name: "Apache HTTP Server",
  description: "The world's most used web server software",
  vendor: "Apache Software Foundation",
  openSource: true,
  license: "Apache License 2.0",
  officialDocs: "https://httpd.apache.org/docs/",
  githubRepo: "https://github.com/apache/httpd",
  currentVersion: "2.4.x",
  logo: "/logos/apache.svg",
  categories: ["Web Server", "Reverse Proxy"],
  logTypes: [
    {
      id: "access",
      name: "Access Log",
      description: "Records every HTTP request processed by Apache",
      defaultPath: "/var/log/apache2/access.log",
    },
    {
      id: "error",
      name: "Error Log",
      description: "Errors, warnings, and diagnostic information",
      defaultPath: "/var/log/apache2/error.log",
    },
  ],
  defaultPaths: {
    linux_deb: "/var/log/apache2/",
    linux_rpm: "/var/log/httpd/",
    windows: "C:\\Apache24\\logs\\",
    macos_homebrew: "/opt/homebrew/var/log/httpd/",
    docker: "stdout / stderr",
  },
  configFile: "/etc/apache2/apache2.conf",
  related: ["apache-modsecurity"],
  compareWith: ["nginx", "caddy"],
  contribution: {
    createdAt: "2024-01-20",
    createdBy: "admin",
    updatedAt: "2025-12-15",
    updatedBy: "jean_ops",
    contributors: ["admin", "jean_ops"],
    validated: true,
  },
};

export const apacheAccessLog: LogType = {
  id: "access",
  technologyId: "apache",
  name: "Access Log",
  description: "Records every HTTP request processed by Apache",
  quickFacts: {
    defaultPathLinux: "/var/log/apache2/access.log",
    defaultPathDocker: "stdout",
    defaultFormat: "combined",
    jsonNative: false,
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/apache2/access.log" },
      { distro: "RHEL / CentOS / Fedora", path: "/var/log/httpd/access_log" },
      { distro: "Alpine", path: "/var/log/apache2/access.log" },
    ],
    windows: [{ variant: "Default", path: "C:\\Apache24\\logs\\access.log" }],
    macos: [
      { variant: "Homebrew", path: "/opt/homebrew/var/log/httpd/access_log" },
    ],
    containers: [
      {
        platform: "Docker",
        path: "stdout",
        note: "Configure with CustomLog /dev/stdout combined",
      },
    ],
  },
  formats: [
    {
      id: "combined",
      name: "Combined Log Format",
      isDefault: true,
      structure:
        '%h %l %u %t "%r" %>s %b "%{Referer}i" "%{User-Agent}i""%r" %>s %b "%{Referer}i" "%{User-Agent}i"',
      example: `192.168.1.50 - alice [20/Dec/2025:14:32:18 +0100] "GET /api/users HTTP/1.1" 200 1534 "https://app.example.com" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"`,
    },
    {
      id: "common",
      name: "Common Log Format (CLF)",
      isDefault: false,
      structure: '%h %l %u %t "%r" %>s %b',
      example: `192.168.1.50 - alice [20/Dec/2025:14:32:18 +0100] "GET /api/users HTTP/1.1" 200 1534`,
    },
    {
      id: "vhost_combined",
      name: "Virtual Host Combined",
      isDefault: false,
      structure:
        '%v:%p %h %l %u %t "%r" %>s %b "%{Referer}i" "%{User-Agent}i"',
      example: `www.example.com:80 192.168.1.50 - alice [20/Dec/2025:14:32:18 +0100] "GET /api/users HTTP/1.1" 200 1534 "-" "Mozilla/5.0"`,
    },
  ],
  fields: [
    {
      name: "h",
      variable: "%h",
      type: "ip",
      description: "Remote hostname or IP",
      example: "192.168.1.50",
    },
    {
      name: "l",
      variable: "%l",
      type: "string",
      description: "Remote logname (from identd)",
      example: "-",
      note: "Usually - (not available)",
    },
    {
      name: "u",
      variable: "%u",
      type: "string",
      description: "Remote user (from auth)",
      example: "alice",
    },
    {
      name: "t",
      variable: "%t",
      type: "datetime",
      format: "[dd/MMM/yyyy:HH:mm:ss Z]",
      description: "Time the request was received",
      example: "[20/Dec/2025:14:32:18 +0100]",
    },
    {
      name: "r",
      variable: "%r",
      type: "string",
      description: "First line of request",
      example: "GET /api/users HTTP/1.1",
    },
    {
      name: "s",
      variable: "%>s",
      type: "integer",
      description: "Final status code",
      example: 200,
    },
    {
      name: "b",
      variable: "%b",
      type: "integer",
      description: "Size of response in bytes (- if 0)",
      example: 1534,
    },
    {
      name: "Referer",
      variable: "%{Referer}i",
      type: "string",
      description: "Referer header",
      example: "https://app.example.com",
    },
    {
      name: "User-Agent",
      variable: "%{User-Agent}i",
      type: "string",
      description: "User-Agent header",
      example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  ],
  parsing: {
    grok: {
      combined: "%{COMBINEDAPACHELOG}",
      common: "%{COMMONAPACHELOG}",
    },
    regex: {
      combined: `^(?P<host>\\S+) (?P<ident>\\S+) (?P<user>\\S+) \\[(?P<timestamp>[^\\]]+)\\] "(?P<request>[^"]*)" (?P<status>\\d+) (?P<bytes>\\S+) "(?P<referer>[^"]*)" "(?P<useragent>[^"]*)""(?P<request>[^"]*)" (?P<status>\\d+) (?P<bytes>\\S+) "(?P<referer>[^"]*)" "(?P<useragent>[^"]*)"`,
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "%{COMBINEDAPACHELOG}" }
  }
}`,
      fluentd: `<source>
  @type tail
  path /var/log/apache2/access.log
  pos_file /var/log/td-agent/apache-access.pos
  tag apache.access
  <parse>
    @type apache2
  </parse>
</source>`,
      vector: `[sources.apache_access]
type = "file"
include = ["/var/log/apache2/access.log"]

[transforms.parse_apache]
type = "remap"
inputs = ["apache_access"]
source = '''
. = parse_apache_log!(.message, "combined")
'''`,
    },
  },
  configuration: {
    enableLogging: {
      directive: 'CustomLog /var/log/apache2/access.log combined',
      file: "/etc/apache2/sites-available/*.conf",
    },
    disableLogging: {
      directive: "CustomLog /dev/null combined",
    },
    logRotation: {
      tool: "logrotate",
      configPath: "/etc/logrotate.d/apache2",
      example: `/var/log/apache2/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 640 root adm
    sharedscripts
    postrotate
        /usr/sbin/apachectl graceful > /dev/null
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Traffic monitoring",
        description: "Request rate and response codes",
        fieldsUsed: ["s", "t"],
      },
      {
        name: "Bandwidth analysis",
        description: "Data transferred over time",
        fieldsUsed: ["b"],
      },
    ],
    security: [
      {
        name: "Scan detection",
        description: "Multiple 404s in short time",
        fieldsUsed: ["s", "h", "r"],
      },
      {
        name: "SQL injection attempts",
        description: "SQLi patterns in requests",
        fieldsUsed: ["r"],
      },
    ],
    business: [
      {
        name: "Popular pages",
        description: "Top URIs by hit count",
        fieldsUsed: ["r"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Logs are not being written",
      causes: [
        "CustomLog directive missing",
        "Insufficient permissions",
        "Disk full",
      ],
      solutions: [
        "Add CustomLog directive to VirtualHost",
        "Check permissions: chown root:adm /var/log/apache2",
        "Check disk space: df -h /var/log",
      ],
    },
    {
      problem: "Different log format on RHEL vs Debian",
      causes: ["Different default configurations"],
      solutions: [
        "Debian: /var/log/apache2/access.log",
        "RHEL: /var/log/httpd/access_log (no .log extension)",
      ],
    },
  ],
  testedOn: [
    {
      version: "2.4.58",
      os: "Ubuntu 24.04",
      testedBy: "admin",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-01-20",
    createdBy: "admin",
    updatedAt: "2025-12-15",
    updatedBy: "jean_ops",
    contributors: ["admin", "jean_ops"],
    upvotes: 156,
    downvotes: 2,
    validated: true,
    commentsCount: 8,
  },
};

export const apacheErrorLog: LogType = {
  id: "error",
  technologyId: "apache",
  name: "Error Log",
  description: "Logs errors, warnings, and diagnostic information",
  quickFacts: {
    defaultPathLinux: "/var/log/apache2/error.log",
    defaultPathDocker: "stderr",
    defaultFormat: "text",
    jsonNative: false,
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/apache2/error.log" },
      { distro: "RHEL / CentOS / Fedora", path: "/var/log/httpd/error_log" },
    ],
    windows: [{ variant: "Default", path: "C:\\Apache24\\logs\\error.log" }],
  },
  formats: [
    {
      id: "default",
      name: "Default Error Format",
      isDefault: true,
      structure:
        "[timestamp] [module:level] [pid tid] [client ip:port] message",
      example: `[Thu Dec 20 14:32:18.123456 2025] [core:error] [pid 1234:tid 5678] [client 192.168.1.50:54321] File does not exist: /var/www/html/missing.html`,
    },
  ],
  fields: [
    {
      name: "timestamp",
      type: "datetime",
      description: "When the error occurred",
      example: "Thu Dec 20 14:32:18.123456 2025",
    },
    {
      name: "module",
      type: "string",
      description: "Apache module that generated the message",
      example: "core",
    },
    {
      name: "level",
      type: "string",
      description: "Log level",
      example: "error",
      enum: ["emerg", "alert", "crit", "error", "warn", "notice", "info", "debug"],
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
      name: "client",
      type: "string",
      description: "Client IP and port",
      example: "192.168.1.50:54321",
    },
    {
      name: "message",
      type: "string",
      description: "Error message",
      example: "File does not exist: /var/www/html/missing.html",
    },
  ],
  parsing: {
    regex: {
      default: `^\\[(?P<timestamp>[^\\]]+)\\] \\[(?P<module>[^:]+):(?P<level>[^\\]]+)\\] \\[pid (?P<pid>\\d+):tid (?P<tid>\\d+)\\] (?:\\[client (?P<client>[^\\]]+)\\] )?(?P<message>.*)$`,
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "\\[%{DATA:timestamp}\\] \\[%{WORD:module}:%{WORD:level}\\] \\[pid %{NUMBER:pid}:tid %{NUMBER:tid}\\] (?:\\[client %{DATA:client}\\] )?%{GREEDYDATA:error_message}" }
  }
}`,
    },
  },
  configuration: {
    enableLogging: {
      directive: "ErrorLog /var/log/apache2/error.log",
      file: "/etc/apache2/apache2.conf",
    },
  },
  useCases: {
    operational: [
      {
        name: "Error rate monitoring",
        description: "Track error frequency",
        fieldsUsed: ["level", "timestamp"],
      },
    ],
    security: [
      {
        name: "Auth failures",
        description: "Failed authentication attempts",
        fieldsUsed: ["message", "client"],
      },
    ],
    business: [],
  },
  troubleshooting: [
    {
      problem: "Error log too verbose",
      causes: ["LogLevel set too low"],
      solutions: ["Set LogLevel warn or error in apache2.conf"],
    },
  ],
  testedOn: [
    {
      version: "2.4.58",
      os: "Ubuntu 24.04",
      testedBy: "admin",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-01-20",
    createdBy: "admin",
    updatedAt: "2025-12-15",
    updatedBy: "admin",
    contributors: ["admin"],
    upvotes: 45,
    validated: true,
  },
};
