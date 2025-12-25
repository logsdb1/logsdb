import { Technology, LogType } from "@/types";

export const linux: Technology = {
  id: "linux",
  name: "Linux",
  description: "System logs for Linux operating systems",
  vendor: "Various",
  openSource: true,
  license: "GPL",
  officialDocs: "https://www.man7.org/linux/man-pages/",
  logo: "/logos/linux.svg",
  categories: ["Operating System"],
  logTypes: [
    {
      id: "syslog",
      name: "Syslog",
      description: "General system messages",
      defaultPath: "/var/log/syslog",
    },
    {
      id: "auth",
      name: "Auth Log",
      description: "Authentication and authorization events",
      defaultPath: "/var/log/auth.log",
    },
    {
      id: "kern",
      name: "Kernel Log",
      description: "Kernel messages",
      defaultPath: "/var/log/kern.log",
    },
  ],
  defaultPaths: {
    debian: "/var/log/",
    rhel: "/var/log/",
  },
  configFile: "/etc/rsyslog.conf",
  contribution: {
    createdAt: "2024-02-01",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "linux_expert",
    contributors: ["admin", "linux_expert"],
    validated: true,
  },
};

export const linuxSyslog: LogType = {
  id: "syslog",
  technologyId: "linux",
  name: "Syslog",
  description: "General system messages and application logs",
  quickFacts: {
    defaultPathLinux: "/var/log/syslog",
    defaultFormat: "RFC 3164 / RFC 5424",
    jsonNative: false,
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/syslog" },
      { distro: "RHEL / CentOS", path: "/var/log/messages" },
      { distro: "Arch", path: "/var/log/syslog" },
    ],
  },
  formats: [
    {
      id: "rfc3164",
      name: "RFC 3164 (BSD Syslog)",
      isDefault: true,
      structure: "<priority>timestamp hostname program[pid]: message",
      example: `Dec 20 14:32:18 webserver01 sshd[1234]: Accepted publickey for admin from 192.168.1.100 port 54321 ssh2`,
    },
    {
      id: "rfc5424",
      name: "RFC 5424 (IETF Syslog)",
      isDefault: false,
      structure:
        "<priority>version timestamp hostname app-name procid msgid structured-data msg",
      example: `<165>1 2025-12-20T14:32:18.123456+01:00 webserver01 sshd 1234 - - Accepted publickey for admin`,
    },
  ],
  fields: [
    {
      name: "priority",
      type: "integer",
      description: "Facility * 8 + Severity",
      example: 165,
    },
    {
      name: "timestamp",
      type: "datetime",
      description: "When the message was generated",
      example: "Dec 20 14:32:18",
    },
    {
      name: "hostname",
      type: "string",
      description: "Originating host",
      example: "webserver01",
    },
    {
      name: "program",
      type: "string",
      description: "Program or service name",
      example: "sshd",
    },
    {
      name: "pid",
      type: "integer",
      description: "Process ID",
      example: 1234,
    },
    {
      name: "message",
      type: "string",
      description: "Log message content",
      example: "Accepted publickey for admin from 192.168.1.100 port 54321 ssh2",
    },
  ],
  parsing: {
    grok: {
      rfc3164: "%{SYSLOGTIMESTAMP:timestamp} %{SYSLOGHOST:hostname} %{DATA:program}(?:\\[%{POSINT:pid}\\])?: %{GREEDYDATA:message}",
    },
    regex: {
      rfc3164: `^(?P<timestamp>\\w{3}\\s+\\d{1,2}\\s+\\d{2}:\\d{2}:\\d{2})\\s+(?P<hostname>\\S+)\\s+(?P<program>[^\\[\\s]+)(?:\\[(?P<pid>\\d+)\\])?:\\s+(?P<message>.*)$`,
    },
    examples: {
      logstash: `filter {
  grok {
    match => { "message" => "%{SYSLOGTIMESTAMP:timestamp} %{SYSLOGHOST:hostname} %{DATA:program}(?:\\[%{POSINT:pid}\\])?: %{GREEDYDATA:syslog_message}" }
  }
}`,
      rsyslog: `# Forward to remote syslog server
*.* @@logserver.example.com:514`,
      fluentd: `<source>
  @type syslog
  port 5140
  tag syslog
</source>`,
    },
  },
  configuration: {
    enableLogging: {
      directive: "*.info /var/log/syslog",
      file: "/etc/rsyslog.conf",
    },
    logRotation: {
      tool: "logrotate",
      configPath: "/etc/logrotate.d/rsyslog",
      example: `/var/log/syslog {
    rotate 7
    daily
    missingok
    notifempty
    delaycompress
    compress
    postrotate
        /usr/lib/rsyslog/rsyslog-rotate
    endscript
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Service status",
        description: "Monitor service start/stop events",
        fieldsUsed: ["program", "message"],
      },
      {
        name: "System health",
        description: "Track system warnings and errors",
        fieldsUsed: ["message"],
      },
    ],
    security: [
      {
        name: "Sudo usage",
        description: "Track privilege escalation",
        fieldsUsed: ["program", "message"],
        logic: "program = 'sudo'",
      },
    ],
    business: [],
  },
  troubleshooting: [
    {
      problem: "Logs not appearing in syslog",
      causes: ["rsyslog not running", "Incorrect facility/severity"],
      solutions: [
        "Check rsyslog status: systemctl status rsyslog",
        "Check rsyslog config: /etc/rsyslog.conf",
      ],
    },
    {
      problem: "Different file on RHEL vs Debian",
      causes: ["Different default configurations"],
      solutions: [
        "Debian/Ubuntu: /var/log/syslog",
        "RHEL/CentOS: /var/log/messages",
      ],
    },
  ],
  testedOn: [
    {
      version: "rsyslog 8.2312",
      os: "Ubuntu 24.04",
      testedBy: "linux_expert",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-02-01",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "linux_expert",
    contributors: ["admin", "linux_expert"],
    upvotes: 178,
    validated: true,
  },
};

export const linuxAuthLog: LogType = {
  id: "auth",
  technologyId: "linux",
  name: "Auth Log",
  description: "Authentication and authorization events including SSH, sudo, PAM",
  quickFacts: {
    defaultPathLinux: "/var/log/auth.log",
    defaultFormat: "syslog",
    jsonNative: false,
    rotation: "logrotate",
  },
  paths: {
    linux: [
      { distro: "Debian / Ubuntu", path: "/var/log/auth.log" },
      { distro: "RHEL / CentOS", path: "/var/log/secure" },
    ],
  },
  formats: [
    {
      id: "syslog",
      name: "Syslog Format",
      isDefault: true,
      structure: "timestamp hostname program[pid]: message",
      example: `Dec 20 14:32:18 webserver01 sshd[1234]: Accepted publickey for admin from 192.168.1.100 port 54321 ssh2: RSA SHA256:abc123...`,
    },
  ],
  fields: [
    {
      name: "timestamp",
      type: "datetime",
      description: "When the event occurred",
      example: "Dec 20 14:32:18",
    },
    {
      name: "hostname",
      type: "string",
      description: "System hostname",
      example: "webserver01",
    },
    {
      name: "program",
      type: "string",
      description: "Service name (sshd, sudo, su, etc.)",
      example: "sshd",
    },
    {
      name: "pid",
      type: "integer",
      description: "Process ID",
      example: 1234,
    },
    {
      name: "message",
      type: "string",
      description: "Event details",
      example: "Accepted publickey for admin from 192.168.1.100 port 54321 ssh2",
    },
  ],
  parsing: {
    grok: {
      ssh_accepted: "%{SYSLOGTIMESTAMP:timestamp} %{SYSLOGHOST:hostname} sshd\\[%{POSINT:pid}\\]: Accepted %{WORD:auth_method} for %{USER:user} from %{IP:src_ip} port %{POSINT:src_port}",
      ssh_failed: "%{SYSLOGTIMESTAMP:timestamp} %{SYSLOGHOST:hostname} sshd\\[%{POSINT:pid}\\]: Failed %{WORD:auth_method} for %{USER:user} from %{IP:src_ip} port %{POSINT:src_port}",
    },
    examples: {
      logstash: `filter {
  if [program] == "sshd" {
    grok {
      match => { "message" => "(?:Accepted|Failed) %{WORD:auth_method} for %{USER:user} from %{IP:src_ip} port %{POSINT:src_port}" }
    }
  }
}`,
    },
  },
  configuration: {
    enableLogging: {
      directive: "auth,authpriv.* /var/log/auth.log",
      file: "/etc/rsyslog.d/50-default.conf",
    },
  },
  useCases: {
    operational: [
      {
        name: "Login monitoring",
        description: "Track successful and failed logins",
        fieldsUsed: ["program", "message"],
      },
    ],
    security: [
      {
        name: "Brute force detection",
        description: "Multiple failed SSH attempts",
        fieldsUsed: ["message"],
        logic: "COUNT 'Failed password' BY src_ip WHERE count > 5 IN 1min",
      },
      {
        name: "Successful login after failures",
        description: "Potential successful brute force",
        fieldsUsed: ["message"],
        logic: "Sequence: Failed -> Accepted FROM same src_ip",
      },
      {
        name: "Sudo abuse",
        description: "Unusual sudo usage patterns",
        fieldsUsed: ["program", "message"],
        logic: "program = 'sudo' AND message CONTAINS 'COMMAND'",
      },
      {
        name: "Root login attempts",
        description: "Direct root SSH attempts",
        fieldsUsed: ["message"],
        logic: "message CONTAINS 'Failed password for root'",
      },
    ],
    business: [],
  },
  troubleshooting: [
    {
      problem: "SSH events not appearing",
      causes: ["sshd logging to different facility", "LogLevel too low in sshd_config"],
      solutions: [
        "Check sshd_config: LogLevel INFO or higher",
        "Verify rsyslog config includes auth facility",
      ],
    },
  ],
  testedOn: [
    {
      version: "OpenSSH 9.6",
      os: "Ubuntu 24.04",
      testedBy: "security_expert",
      testedAt: "2025-12-12",
    },
  ],
  contribution: {
    createdAt: "2024-02-01",
    createdBy: "admin",
    updatedAt: "2025-12-12",
    updatedBy: "security_expert",
    contributors: ["admin", "security_expert"],
    upvotes: 245,
    validated: true,
  },
};
