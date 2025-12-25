import { Technology, LogType } from "@/types";

export const mysql: Technology = {
  id: "mysql",
  name: "MySQL",
  description: "Popular open-source relational database",
  vendor: "Oracle Corporation",
  openSource: true,
  license: "GPL v2",
  officialDocs: "https://dev.mysql.com/doc/refman/8.0/en/server-logs.html",
  githubRepo: "https://github.com/mysql/mysql-server",
  currentVersion: "8.4.x",
  logo: "/logos/mysql.svg",
  categories: ["Database", "RDBMS"],
  logTypes: [
    {
      id: "error",
      name: "Error Log",
      description: "Server errors, warnings, and startup/shutdown messages",
      defaultPath: "/var/log/mysql/error.log",
    },
    {
      id: "slow",
      name: "Slow Query Log",
      description: "Queries exceeding long_query_time threshold",
      defaultPath: "/var/log/mysql/mysql-slow.log",
    },
    {
      id: "general",
      name: "General Query Log",
      description: "All queries executed by the server",
      defaultPath: "/var/log/mysql/mysql.log",
      optional: true,
    },
  ],
  defaultPaths: {
    linux_deb: "/var/log/mysql/",
    linux_rpm: "/var/log/mysqld.log",
    windows: "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Data\\",
    docker: "stderr",
  },
  configFile: "/etc/mysql/mysql.conf.d/mysqld.cnf",
  related: ["mariadb", "percona"],
  compareWith: ["postgresql", "mariadb"],
  contribution: {
    createdAt: "2024-03-20",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "mysql_dba",
    contributors: ["admin", "mysql_dba"],
    validated: true,
  },
};

export const mysqlErrorLog: LogType = {
  id: "error",
  technologyId: "mysql",
  name: "Error Log",
  description: "Server errors, warnings, startup/shutdown messages, and diagnostic information",
  quickFacts: {
    defaultPathLinux: "/var/log/mysql/error.log",
    defaultPathDocker: "stderr",
    defaultFormat: "text",
    jsonNative: true,
    jsonSinceVersion: "8.0.4",
    rotation: "manual or logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/mysql/error.log" },
      { distro: "RHEL / CentOS", path: "/var/log/mysqld.log" },
    ],
    windows: [
      {
        variant: "Default",
        path: "C:\\ProgramData\\MySQL\\MySQL Server 8.0\\Data\\hostname.err",
      },
    ],
    containers: [
      {
        platform: "Docker",
        path: "stderr",
        note: "Default configuration outputs to stderr",
      },
    ],
  },
  formats: [
    {
      id: "text",
      name: "Default Text Format",
      isDefault: true,
      structure: "timestamp thread_id [severity] [error_code] message",
      example: `2025-12-20T14:32:18.123456Z 0 [Warning] [MY-010068] [Server] CA certificate ca.pem is self signed.`,
    },
    {
      id: "json",
      name: "JSON Format",
      isDefault: false,
      nativeSupport: true,
      sinceVersion: "8.0.4",
      configRequired: true,
      structure: "JSON object with structured fields",
      example: `{"timestamp":"2025-12-20T14:32:18.123456Z","thread":0,"severity":"Warning","error_code":"MY-010068","subsystem":"Server","message":"CA certificate ca.pem is self signed."}`,
    },
  ],
  fields: [
    {
      name: "timestamp",
      type: "datetime",
      format: "ISO 8601",
      description: "When the event occurred",
      example: "2025-12-20T14:32:18.123456Z",
    },
    {
      name: "thread",
      type: "integer",
      description: "Thread ID",
      example: 0,
    },
    {
      name: "severity",
      type: "string",
      description: "Error severity level",
      example: "Warning",
      enum: ["System", "Error", "Warning", "Note"],
    },
    {
      name: "error_code",
      type: "string",
      description: "MySQL error code",
      example: "MY-010068",
    },
    {
      name: "subsystem",
      type: "string",
      description: "Server subsystem",
      example: "Server",
    },
    {
      name: "message",
      type: "string",
      description: "Error message",
      example: "CA certificate ca.pem is self signed.",
    },
  ],
  parsing: {
    grok: {
      text: "%{TIMESTAMP_ISO8601:timestamp}Z %{NUMBER:thread} \\[%{WORD:severity}\\] \\[%{DATA:error_code}\\] \\[%{WORD:subsystem}\\] %{GREEDYDATA:message}",
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp}Z %{NUMBER:thread} \\[%{WORD:severity}\\] \\[%{DATA:error_code}\\] \\[%{WORD:subsystem}\\] %{GREEDYDATA:mysql_message}" }
  }
}`,
      fluentd: `<source>
  @type tail
  path /var/log/mysql/error.log
  pos_file /var/log/td-agent/mysql-error.pos
  tag mysql.error
  <parse>
    @type regexp
    expression /^(?<timestamp>\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}.\\d+Z) (?<thread>\\d+) \\[(?<severity>\\w+)\\] \\[(?<error_code>[^\\]]+)\\] \\[(?<subsystem>\\w+)\\] (?<message>.*)$/
  </parse>
</source>`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Error log is enabled by default; configure path and format",
      example: `[mysqld]
log_error = /var/log/mysql/error.log
log_error_verbosity = 2  # 1=errors, 2=+warnings, 3=+notes`,
      file: "/etc/mysql/mysql.conf.d/mysqld.cnf",
    },
    enableJson: {
      description: "Enable JSON error logging (MySQL 8.0.4+)",
      example: `[mysqld]
log_error = /var/log/mysql/error.log
log_error_services = 'log_filter_internal; log_sink_json'`,
      sinceVersion: "8.0.4",
    },
    logRotation: {
      tool: "logrotate",
      configPath: "/etc/logrotate.d/mysql",
      example: `/var/log/mysql/error.log {
    daily
    rotate 7
    missingok
    create 640 mysql adm
    compress
    sharedscripts
    postrotate
        mysqladmin --defaults-file=/etc/mysql/debian.cnf flush-logs error
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Startup issues",
        description: "Track server initialization problems",
        fieldsUsed: ["severity", "message"],
      },
      {
        name: "Replication errors",
        description: "Monitor replication health",
        fieldsUsed: ["error_code", "message"],
      },
    ],
    security: [
      {
        name: "Access denied",
        description: "Failed authentication attempts",
        fieldsUsed: ["message"],
        logic: "message CONTAINS 'Access denied'",
      },
      {
        name: "SSL/TLS issues",
        description: "Certificate and encryption problems",
        fieldsUsed: ["message", "subsystem"],
      },
    ],
    business: [],
  },
  troubleshooting: [
    {
      problem: "Error log too verbose",
      causes: ["log_error_verbosity set to 3"],
      solutions: [
        "Set log_error_verbosity = 2 to exclude notes",
        "Use log_error_suppression_list to filter specific warnings",
      ],
    },
    {
      problem: "Error log not rotating",
      causes: ["FLUSH LOGS not called after rotation"],
      solutions: [
        "Add postrotate script with: mysqladmin flush-logs error",
        "Or use: FLUSH LOCAL LOGS",
      ],
    },
  ],
  testedOn: [
    {
      version: "8.4.0",
      os: "Ubuntu 24.04",
      testedBy: "mysql_dba",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-03-20",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "mysql_dba",
    contributors: ["admin", "mysql_dba"],
    upvotes: 134,
    validated: true,
  },
};

export const mysqlSlowLog: LogType = {
  id: "slow",
  technologyId: "mysql",
  name: "Slow Query Log",
  description: "Queries that exceed the long_query_time threshold for performance analysis",
  quickFacts: {
    defaultPathLinux: "/var/log/mysql/mysql-slow.log",
    defaultFormat: "text",
    jsonNative: false,
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/mysql/mysql-slow.log" },
      { distro: "RHEL / CentOS", path: "/var/log/mysqld-slow.log" },
    ],
  },
  formats: [
    {
      id: "text",
      name: "Default Text Format",
      isDefault: true,
      structure: "Multi-line format with metadata and query",
      example: `# Time: 2025-12-20T14:32:18.123456Z
# User@Host: app_user[app_user] @ 192.168.1.100 []  Id: 12345
# Query_time: 15.123456  Lock_time: 0.000123 Rows_sent: 1000  Rows_examined: 1000000
SET timestamp=1734702738;
SELECT * FROM large_table WHERE status = 'active';`,
    },
  ],
  fields: [
    {
      name: "Time",
      type: "datetime",
      description: "When the query completed",
      example: "2025-12-20T14:32:18.123456Z",
    },
    {
      name: "User",
      type: "string",
      description: "MySQL user who ran the query",
      example: "app_user",
    },
    {
      name: "Host",
      type: "string",
      description: "Client host",
      example: "192.168.1.100",
    },
    {
      name: "Query_time",
      type: "float",
      unit: "seconds",
      description: "Total query execution time",
      example: 15.123456,
    },
    {
      name: "Lock_time",
      type: "float",
      unit: "seconds",
      description: "Time waiting for locks",
      example: 0.000123,
    },
    {
      name: "Rows_sent",
      type: "integer",
      description: "Rows returned to client",
      example: 1000,
    },
    {
      name: "Rows_examined",
      type: "integer",
      description: "Rows examined by the query",
      example: 1000000,
    },
    {
      name: "query",
      type: "string",
      description: "The SQL query",
      example: "SELECT * FROM large_table WHERE status = 'active'",
    },
  ],
  parsing: {
    examples: {
      pt_query_digest: `# Analyze slow query log with Percona Toolkit
pt-query-digest /var/log/mysql/mysql-slow.log

# Top 10 queries by time
pt-query-digest --limit=10 /var/log/mysql/mysql-slow.log

# Output as JSON
pt-query-digest --output json /var/log/mysql/mysql-slow.log`,
      logstash: `filter {
  multiline {
    pattern => "^# Time:"
    negate => true
    what => "previous"
  }
  grok {
    match => { "message" => "# User@Host: %{USER:user}\\[%{USER}\\] @ %{HOST:host}.*Query_time: %{NUMBER:query_time:float}  Lock_time: %{NUMBER:lock_time:float} Rows_sent: %{NUMBER:rows_sent:int}  Rows_examined: %{NUMBER:rows_examined:int}" }
  }
}`,
      mysqlsla: `# MySQL Slow Log Analyzer
mysqlsla -lt slow /var/log/mysql/mysql-slow.log`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable slow query logging",
      example: `[mysqld]
slow_query_log = 1
slow_query_log_file = /var/log/mysql/mysql-slow.log
long_query_time = 1           # Log queries > 1 second
log_queries_not_using_indexes = 1  # Also log queries without indexes`,
      file: "/etc/mysql/mysql.conf.d/mysqld.cnf",
    },
    logRotation: {
      tool: "logrotate",
      configPath: "/etc/logrotate.d/mysql",
      example: `/var/log/mysql/mysql-slow.log {
    daily
    rotate 7
    missingok
    create 640 mysql adm
    compress
    sharedscripts
    postrotate
        mysqladmin --defaults-file=/etc/mysql/debian.cnf flush-logs slow
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Slow query identification",
        description: "Find queries needing optimization",
        fieldsUsed: ["Query_time", "query"],
      },
      {
        name: "Index analysis",
        description: "Queries examining many rows",
        fieldsUsed: ["Rows_examined", "Rows_sent", "query"],
        logic: "Rows_examined / Rows_sent > 1000",
      },
      {
        name: "Lock contention",
        description: "Queries waiting on locks",
        fieldsUsed: ["Lock_time"],
      },
    ],
    security: [
      {
        name: "Resource abuse",
        description: "Excessive queries from single user/host",
        fieldsUsed: ["User", "Host", "Query_time"],
      },
    ],
    business: [
      {
        name: "Performance trends",
        description: "Query performance over time",
        fieldsUsed: ["Time", "Query_time"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Slow query log not recording",
      causes: ["slow_query_log disabled", "long_query_time too high"],
      solutions: [
        "SET GLOBAL slow_query_log = 1",
        "Lower long_query_time: SET GLOBAL long_query_time = 1",
      ],
    },
    {
      problem: "Log file too large",
      causes: ["Many slow queries", "No rotation"],
      solutions: [
        "Configure logrotate",
        "Analyze and optimize slow queries",
        "Increase long_query_time threshold",
      ],
    },
  ],
  testedOn: [
    {
      version: "8.4.0",
      os: "Ubuntu 24.04",
      testedBy: "mysql_dba",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-03-20",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "mysql_dba",
    contributors: ["admin", "mysql_dba", "performance_engineer"],
    upvotes: 156,
    validated: true,
  },
};
