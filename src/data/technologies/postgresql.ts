import { Technology, LogType } from "@/types";

export const postgresql: Technology = {
  id: "postgresql",
  name: "PostgreSQL",
  description: "Open-source relational database with robust logging capabilities",
  vendor: "PostgreSQL Global Development Group",
  openSource: true,
  license: "PostgreSQL License",
  officialDocs: "https://www.postgresql.org/docs/current/runtime-config-logging.html",
  githubRepo: "https://github.com/postgres/postgres",
  currentVersion: "17.x",
  logo: "/logos/postgresql.svg",
  categories: ["Database", "RDBMS"],
  logTypes: [
    {
      id: "server",
      name: "Server Log",
      description: "Query logs, errors, connections, and server events",
      defaultPath: "/var/log/postgresql/postgresql-*-main.log",
    },
  ],
  defaultPaths: {
    linux_deb: "/var/log/postgresql/",
    linux_rpm: "/var/lib/pgsql/data/log/",
    docker: "stderr (default)",
    windows: "C:\\Program Files\\PostgreSQL\\data\\log\\",
  },
  configFile: "/etc/postgresql/*/main/postgresql.conf",
  related: ["pgbouncer"],
  compareWith: ["mysql", "mariadb"],
  contribution: {
    createdAt: "2024-03-15",
    createdBy: "admin",
    updatedAt: "2025-12-12",
    updatedBy: "db_expert",
    contributors: ["admin", "db_expert"],
    validated: true,
  },
};

export const postgresqlServerLog: LogType = {
  id: "server",
  technologyId: "postgresql",
  name: "Server Log",
  description: "PostgreSQL server logs including queries, errors, connections, and performance data",
  quickFacts: {
    defaultPathLinux: "/var/log/postgresql/postgresql-17-main.log",
    defaultPathDocker: "stderr",
    defaultFormat: "stderr (text)",
    jsonNative: true,
    jsonSinceVersion: "15",
    rotation: "log_rotation_age/size or logrotate",
  },
  paths: {
    linux: [
      {
        distro: "Debian / Ubuntu",
        path: "/var/log/postgresql/postgresql-17-main.log",
        note: "Version number in filename",
      },
      {
        distro: "RHEL / CentOS",
        path: "/var/lib/pgsql/data/log/",
        note: "Inside data directory",
      },
    ],
    windows: [
      {
        variant: "Default",
        path: "C:\\Program Files\\PostgreSQL\\17\\data\\log\\",
      },
    ],
    containers: [
      {
        platform: "Docker",
        path: "stderr",
        note: "Default output to stderr; configure logging_collector for files",
      },
    ],
  },
  formats: [
    {
      id: "stderr",
      name: "Standard Error Format",
      isDefault: true,
      structure: "timestamp [pid] user@database level: message",
      example: `2025-12-20 14:32:18.123 UTC [1234] postgres@mydb LOG:  statement: SELECT * FROM users WHERE id = 1`,
    },
    {
      id: "csvlog",
      name: "CSV Log Format",
      isDefault: false,
      configRequired: true,
      structure: "timestamp,user,database,pid,client,session_id,line_num,command_tag,session_start,vxid,txid,level,code,message,detail,hint,query,pos,context,location,app",
      example: `2025-12-20 14:32:18.123 UTC,"postgres","mydb",1234,"192.168.1.100:54321",12345678.1234,1,"SELECT",2025-12-20 14:30:00 UTC,1/1,0,LOG,00000,"statement: SELECT * FROM users WHERE id = 1",,,,,,"psql"`,
    },
    {
      id: "jsonlog",
      name: "JSON Log Format",
      isDefault: false,
      nativeSupport: true,
      sinceVersion: "15",
      configRequired: true,
      structure: "JSON object with structured fields",
      example: `{"timestamp":"2025-12-20 14:32:18.123 UTC","pid":1234,"user":"postgres","dbname":"mydb","error_severity":"LOG","message":"statement: SELECT * FROM users WHERE id = 1"}`,
    },
  ],
  fields: [
    {
      name: "timestamp",
      type: "datetime",
      description: "When the log entry was created",
      example: "2025-12-20 14:32:18.123 UTC",
    },
    {
      name: "pid",
      type: "integer",
      description: "Process ID of the backend",
      example: 1234,
    },
    {
      name: "user",
      type: "string",
      description: "Database user name",
      example: "postgres",
    },
    {
      name: "dbname",
      type: "string",
      description: "Database name",
      example: "mydb",
    },
    {
      name: "client_addr",
      type: "ip",
      description: "Client IP address",
      example: "192.168.1.100",
    },
    {
      name: "error_severity",
      type: "string",
      description: "Log level",
      example: "LOG",
      enum: ["DEBUG5", "DEBUG4", "DEBUG3", "DEBUG2", "DEBUG1", "INFO", "NOTICE", "WARNING", "ERROR", "LOG", "FATAL", "PANIC"],
    },
    {
      name: "message",
      type: "string",
      description: "Log message content",
      example: "statement: SELECT * FROM users WHERE id = 1",
    },
    {
      name: "duration",
      type: "float",
      unit: "milliseconds",
      description: "Query duration (when log_duration or log_min_duration_statement enabled)",
      example: 12.345,
    },
    {
      name: "sql_state_code",
      type: "string",
      description: "SQL state error code",
      example: "42P01",
    },
    {
      name: "application_name",
      type: "string",
      description: "Application name from connection",
      example: "psql",
    },
  ],
  parsing: {
    grok: {
      stderr: "%{TIMESTAMP_ISO8601:timestamp} %{TZ:timezone} \\[%{NUMBER:pid}\\] %{DATA:user}@%{DATA:database} %{WORD:level}:  %{GREEDYDATA:message}",
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{TZ:timezone} \\[%{NUMBER:pid}\\] %{DATA:user}@%{DATA:database} %{WORD:level}:  %{GREEDYDATA:pg_message}" }
  }
  if "duration:" in [pg_message] {
    grok {
      match => { "pg_message" => "duration: %{NUMBER:duration:float} ms" }
    }
  }
}`,
      fluentd: `<source>
  @type tail
  path /var/log/postgresql/postgresql-17-main.log
  pos_file /var/log/td-agent/postgresql.pos
  tag postgresql
  <parse>
    @type regexp
    expression /^(?<timestamp>\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}.\\d{3} \\w+) \\[(?<pid>\\d+)\\] (?<user>[^@]+)@(?<database>\\S+) (?<level>\\w+):  (?<message>.*)$/
  </parse>
</source>`,
      pgbadger: `# Analyze PostgreSQL logs with pgBadger
pgbadger /var/log/postgresql/postgresql-17-main.log -o report.html

# For CSV format
pgbadger -f csv /var/log/postgresql/postgresql-17-main.csv -o report.html

# For JSON format (PostgreSQL 15+)
pgbadger -f jsonlog /var/log/postgresql/postgresql-17-main.json -o report.html`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable detailed logging in postgresql.conf",
      example: `# Logging destination
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'

# What to log
log_statement = 'all'           # none, ddl, mod, all
log_duration = on
log_min_duration_statement = 1000  # Log queries > 1 second

# Connection logging
log_connections = on
log_disconnections = on

# Error logging
log_error_verbosity = default   # terse, default, verbose`,
      file: "postgresql.conf",
    },
    enableJson: {
      description: "Enable JSON logging format (PostgreSQL 15+)",
      example: `# In postgresql.conf
log_destination = 'jsonlog'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql.json'`,
      sinceVersion: "15",
      recommended: true,
    },
    logRotation: {
      tool: "PostgreSQL native or logrotate",
      configPath: "postgresql.conf",
      example: `# Native rotation
log_rotation_age = 1d           # Rotate daily
log_rotation_size = 100MB       # Or when reaching 100MB
log_truncate_on_rotation = on

# With logrotate (if logging_collector = off)
/var/log/postgresql/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    postrotate
        /usr/bin/pg_ctlcluster 17 main reload
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Slow query analysis",
        description: "Find queries exceeding duration threshold",
        fieldsUsed: ["duration", "message"],
        logic: "duration > 1000",
      },
      {
        name: "Connection monitoring",
        description: "Track connection patterns",
        fieldsUsed: ["user", "client_addr", "message"],
      },
      {
        name: "Error rate",
        description: "Monitor ERROR and FATAL events",
        fieldsUsed: ["error_severity"],
      },
    ],
    security: [
      {
        name: "Failed authentication",
        description: "Track failed login attempts",
        fieldsUsed: ["error_severity", "message"],
        logic: "message CONTAINS 'authentication failed'",
      },
      {
        name: "SQL injection attempts",
        description: "Suspicious query patterns",
        fieldsUsed: ["message"],
        logic: "message CONTAINS ('UNION SELECT', 'OR 1=1', '--')",
      },
      {
        name: "Privilege escalation",
        description: "Role and permission changes",
        fieldsUsed: ["message"],
        logic: "message CONTAINS ('GRANT', 'ALTER ROLE')",
      },
    ],
    business: [
      {
        name: "Query patterns",
        description: "Most common query types",
        fieldsUsed: ["message"],
      },
      {
        name: "Peak usage times",
        description: "Connection activity over time",
        fieldsUsed: ["timestamp"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Logs not appearing",
      causes: ["logging_collector disabled", "log_statement = none", "Wrong log_directory"],
      solutions: [
        "Enable logging_collector = on in postgresql.conf",
        "Set log_statement = 'all' or 'mod' for query logging",
        "Check log_directory is writable by postgres user",
      ],
    },
    {
      problem: "Logs growing too fast",
      causes: ["log_statement = 'all' in production", "No rotation configured"],
      solutions: [
        "Use log_min_duration_statement instead of log_statement for slow query logging",
        "Configure log_rotation_age and log_rotation_size",
        "Set up logrotate",
      ],
    },
    {
      problem: "Can't parse log format",
      causes: ["Custom log_line_prefix", "Mixed formats"],
      solutions: [
        "Use standardized log_line_prefix: '%t [%p] %u@%d '",
        "Switch to csvlog or jsonlog for easier parsing",
        "Document your custom format for parsers",
      ],
    },
  ],
  allVariables: {
    log_line_prefix: [
      { var: "%a", desc: "Application name" },
      { var: "%u", desc: "User name" },
      { var: "%d", desc: "Database name" },
      { var: "%r", desc: "Remote host and port" },
      { var: "%h", desc: "Remote host" },
      { var: "%p", desc: "Process ID" },
      { var: "%t", desc: "Timestamp without milliseconds" },
      { var: "%m", desc: "Timestamp with milliseconds" },
      { var: "%i", desc: "Command tag" },
      { var: "%e", desc: "SQL state error code" },
      { var: "%c", desc: "Session ID" },
      { var: "%l", desc: "Session line number" },
      { var: "%s", desc: "Session start timestamp" },
      { var: "%v", desc: "Virtual transaction ID" },
      { var: "%x", desc: "Transaction ID" },
      { var: "%q", desc: "Stop here in non-session processes" },
    ],
  },
  testedOn: [
    {
      version: "17.0",
      os: "Ubuntu 24.04",
      testedBy: "db_expert",
      testedAt: "2025-12-12",
    },
    {
      version: "16.4",
      os: "Debian 12",
      testedBy: "admin",
      testedAt: "2025-11-01",
    },
  ],
  contribution: {
    createdAt: "2024-03-15",
    createdBy: "admin",
    updatedAt: "2025-12-12",
    updatedBy: "db_expert",
    contributors: ["admin", "db_expert", "dba_senior"],
    upvotes: 187,
    downvotes: 3,
    validated: true,
    commentsCount: 11,
  },
};
