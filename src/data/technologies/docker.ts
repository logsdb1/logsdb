import { Technology, LogType } from "@/types";

export const docker: Technology = {
  id: "docker",
  name: "Docker",
  description: "Container platform logs including container and daemon logs",
  vendor: "Docker Inc.",
  openSource: true,
  license: "Apache License 2.0",
  officialDocs: "https://docs.docker.com/config/containers/logging/",
  githubRepo: "https://github.com/moby/moby",
  currentVersion: "27.x",
  logo: "/logos/docker.svg",
  categories: ["Containers", "DevOps"],
  logTypes: [
    {
      id: "container",
      name: "Container Logs",
      description: "Application stdout/stderr from containers",
      defaultPath: "docker logs <container>",
    },
    {
      id: "daemon",
      name: "Docker Daemon Logs",
      description: "Docker engine logs",
      defaultPath: "/var/log/docker.log or journald",
    },
  ],
  defaultPaths: {
    container_json: "/var/lib/docker/containers/<id>/<id>-json.log",
    daemon_systemd: "journalctl -u docker",
    daemon_file: "/var/log/docker.log",
  },
  configFile: "/etc/docker/daemon.json",
  related: ["kubernetes"],
  contribution: {
    createdAt: "2024-03-01",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "container_expert",
    contributors: ["admin", "container_expert"],
    validated: true,
  },
};

export const dockerContainerLog: LogType = {
  id: "container",
  technologyId: "docker",
  name: "Container Logs",
  description: "Application stdout/stderr output captured from containers",
  quickFacts: {
    defaultPathLinux: "/var/lib/docker/containers/<id>/<id>-json.log",
    defaultFormat: "json-file",
    jsonNative: true,
    rotation: "Docker log driver settings",
  },
  paths: {
    linux: [
      {
        distro: "All",
        path: "/var/lib/docker/containers/<container-id>/<container-id>-json.log",
        note: "Default json-file driver location",
      },
    ],
    containers: [
      {
        platform: "Docker CLI",
        path: "docker logs <container-name>",
        note: "Real-time log access",
      },
      {
        platform: "Docker Compose",
        path: "docker compose logs <service>",
        note: "Service-level logs",
      },
    ],
  },
  formats: [
    {
      id: "json-file",
      name: "JSON File Driver",
      isDefault: true,
      structure: '{"log":"message","stream":"stdout|stderr","time":"ISO8601"}',
      example: `{"log":"2025-12-20 14:32:18 INFO Starting application...\\n","stream":"stdout","time":"2025-12-20T14:32:18.123456789Z"}`,
    },
    {
      id: "journald",
      name: "journald Driver",
      isDefault: false,
      structure: "systemd journal format",
      example: `Dec 20 14:32:18 dockerhost container[1234]: 2025-12-20 14:32:18 INFO Starting application...`,
    },
    {
      id: "syslog",
      name: "Syslog Driver",
      isDefault: false,
      structure: "RFC 3164 or RFC 5424",
      example: `<14>Dec 20 14:32:18 dockerhost container/myapp[1234]: INFO Starting application...`,
    },
  ],
  fields: [
    {
      name: "log",
      type: "string",
      description: "The actual log message from the container",
      example: "2025-12-20 14:32:18 INFO Starting application...",
    },
    {
      name: "stream",
      type: "string",
      description: "Output stream (stdout or stderr)",
      example: "stdout",
      enum: ["stdout", "stderr"],
    },
    {
      name: "time",
      type: "datetime",
      format: "ISO 8601 with nanoseconds",
      description: "When Docker captured the log line",
      example: "2025-12-20T14:32:18.123456789Z",
    },
  ],
  parsing: {
    examples: {
      fluentd: `<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

# Configure Docker to use fluentd driver:
# docker run --log-driver=fluentd --log-opt fluentd-address=localhost:24224 myapp`,
      fluent_bit: `[INPUT]
    Name tail
    Path /var/lib/docker/containers/*/*.log
    Parser docker
    Tag docker.*
    Docker_Mode On

[PARSER]
    Name docker
    Format json
    Time_Key time
    Time_Format %Y-%m-%dT%H:%M:%S.%L`,
      promtail: `scrape_configs:
  - job_name: docker
    static_configs:
      - targets: [localhost]
        labels:
          job: docker
          __path__: /var/lib/docker/containers/*/*.log
    pipeline_stages:
      - json:
          expressions:
            output: log
            stream: stream
            timestamp: time`,
      loki_docker_driver: `# Install Loki Docker driver
docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions

# Run container with Loki driver
docker run --log-driver=loki \\
  --log-opt loki-url="http://loki:3100/loki/api/v1/push" \\
  --log-opt loki-retries=5 \\
  myapp`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Configure default logging driver in daemon.json",
      example: `{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3",
    "labels": "production_status",
    "env": "os,customer"
  }
}`,
      file: "/etc/docker/daemon.json",
    },
    logRotation: {
      tool: "Docker log driver settings",
      configPath: "/etc/docker/daemon.json",
      example: `{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5",
    "compress": "true"
  }
}`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Application debugging",
        description: "View application output in real-time",
        fieldsUsed: ["log", "stream"],
      },
      {
        name: "Error tracking",
        description: "Monitor stderr for errors",
        fieldsUsed: ["stream", "log"],
        logic: "stream = 'stderr'",
      },
      {
        name: "Container lifecycle",
        description: "Track container start/stop events",
        fieldsUsed: ["log"],
      },
    ],
    security: [
      {
        name: "Suspicious activity",
        description: "Unusual patterns in container output",
        fieldsUsed: ["log"],
      },
    ],
    business: [
      {
        name: "Request logging",
        description: "HTTP requests logged by application",
        fieldsUsed: ["log"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Logs consuming too much disk space",
      causes: ["No log rotation configured", "Verbose application logging"],
      solutions: [
        "Configure max-size and max-file in daemon.json",
        "Use docker system prune to clean up",
        "Switch to remote logging driver (fluentd, syslog, etc.)",
      ],
    },
    {
      problem: "docker logs shows nothing",
      causes: ["Application not writing to stdout/stderr", "Wrong logging driver"],
      solutions: [
        "Ensure application writes to stdout/stderr, not files",
        "Check logging driver: docker inspect --format='{{.HostConfig.LogConfig.Type}}' container",
        "Some drivers (splunk, gcplogs) don't support docker logs command",
      ],
    },
    {
      problem: "Logs not in JSON format",
      causes: ["Using different logging driver"],
      solutions: [
        "Check current driver: docker info --format '{{.LoggingDriver}}'",
        "Set json-file driver: docker run --log-driver=json-file ...",
      ],
    },
  ],
  testedOn: [
    {
      version: "27.4.0",
      os: "Ubuntu 24.04",
      testedBy: "container_expert",
      testedAt: "2025-12-10",
    },
    {
      version: "27.3.1",
      os: "Debian 12",
      testedBy: "admin",
      testedAt: "2025-11-20",
    },
  ],
  contribution: {
    createdAt: "2024-03-01",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "container_expert",
    contributors: ["admin", "container_expert", "devops_engineer"],
    upvotes: 198,
    downvotes: 2,
    validated: true,
    commentsCount: 14,
  },
};

export const dockerDaemonLog: LogType = {
  id: "daemon",
  technologyId: "docker",
  name: "Docker Daemon Logs",
  description: "Docker engine logs for daemon operations, API calls, and container lifecycle",
  quickFacts: {
    defaultPathLinux: "journalctl -u docker",
    defaultFormat: "systemd journal or text",
    jsonNative: false,
    rotation: "journald or logrotate",
  },
  paths: {
    linux: [
      {
        distro: "Ubuntu / Debian (systemd)",
        path: "journalctl -u docker.service",
      },
      {
        distro: "RHEL / CentOS (systemd)",
        path: "journalctl -u docker.service",
      },
      {
        distro: "Without systemd",
        path: "/var/log/docker.log",
      },
    ],
  },
  formats: [
    {
      id: "journald",
      name: "journald format",
      isDefault: true,
      structure: "timestamp hostname docker[pid]: message",
      example: `Dec 20 14:32:18 dockerhost dockerd[1234]: time="2025-12-20T14:32:18.123456789Z" level=info msg="Container started" container=abc123`,
    },
  ],
  fields: [
    {
      name: "time",
      type: "datetime",
      description: "Event timestamp",
      example: "2025-12-20T14:32:18.123456789Z",
    },
    {
      name: "level",
      type: "string",
      description: "Log level",
      example: "info",
      enum: ["debug", "info", "warn", "error", "fatal"],
    },
    {
      name: "msg",
      type: "string",
      description: "Log message",
      example: "Container started",
    },
    {
      name: "container",
      type: "string",
      description: "Container ID (when applicable)",
      example: "abc123def456",
    },
  ],
  parsing: {
    examples: {
      journalctl: `# View docker daemon logs
journalctl -u docker.service -f

# View last 100 lines
journalctl -u docker.service -n 100

# View logs since specific time
journalctl -u docker.service --since "2025-12-20 14:00:00"

# Export to JSON
journalctl -u docker.service -o json`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Configure daemon log level in daemon.json",
      example: `{
  "debug": false,
  "log-level": "info"
}`,
      file: "/etc/docker/daemon.json",
    },
  },
  useCases: {
    operational: [
      {
        name: "Container lifecycle",
        description: "Track container create/start/stop/remove",
        fieldsUsed: ["msg", "container"],
      },
      {
        name: "Docker API errors",
        description: "API request failures",
        fieldsUsed: ["level", "msg"],
      },
    ],
    security: [
      {
        name: "Unauthorized API access",
        description: "Failed authentication to Docker API",
        fieldsUsed: ["level", "msg"],
      },
    ],
    business: [],
  },
  troubleshooting: [
    {
      problem: "Docker daemon won't start",
      causes: ["Configuration error", "Port conflict", "Storage issue"],
      solutions: [
        "Check logs: journalctl -u docker.service -e",
        "Validate daemon.json: dockerd --validate",
        "Check disk space: df -h /var/lib/docker",
      ],
    },
  ],
  testedOn: [
    {
      version: "27.4.0",
      os: "Ubuntu 24.04",
      testedBy: "container_expert",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-03-01",
    createdBy: "admin",
    updatedAt: "2025-12-10",
    updatedBy: "admin",
    contributors: ["admin"],
    upvotes: 67,
    validated: true,
  },
};
