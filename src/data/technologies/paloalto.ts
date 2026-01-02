import { Technology, LogType } from "@/types";

export const paloalto: Technology = {
  id: "paloalto",
  name: "Palo Alto Networks",
  description: "Next-generation firewall with advanced threat protection, application visibility, and traffic logging",
  vendor: "Palo Alto Networks",
  openSource: false,
  officialDocs: "https://docs.paloaltonetworks.com/pan-os/admin/monitoring/use-syslog-for-monitoring/syslog-field-descriptions",
  logo: "/logos/paloalto.svg",
  categories: ["Security", "Firewall", "Network"],
  logTypes: [
    {
      id: "traffic",
      name: "Traffic Log",
      description: "Network session records with application identification and security policy actions",
      defaultPath: "Syslog / Panorama",
    },
    {
      id: "threat",
      name: "Threat Log",
      description: "Security threats including viruses, spyware, vulnerabilities, and malicious URLs",
      defaultPath: "Syslog / Panorama",
    },
    {
      id: "url",
      name: "URL Filtering Log",
      description: "Web browsing activity with URL categories, user actions, and policy enforcement",
      defaultPath: "Syslog / Panorama",
    },
  ],
  defaultPaths: {
    syslog: "UDP/TCP 514 or SSL 6514",
    panorama: "Panorama > Logs > Traffic",
    api: "https://<firewall>/api/?type=log&log-type=traffic",
  },
  contribution: {
    createdAt: "2026-01-02",
    createdBy: "admin",
    updatedAt: "2026-01-02",
    updatedBy: "admin",
    contributors: ["admin"],
    validated: false,
  },
};

export const paloaltoTrafficLog: LogType = {
  id: "traffic",
  technologyId: "paloalto",
  name: "Traffic Log",
  description: "Records all network traffic sessions passing through the firewall with application identification, user mapping, and security policy actions",
  quickFacts: {
    defaultPathLinux: "Syslog receiver (e.g., /var/log/paloalto/traffic.log)",
    defaultPathDocker: "/var/log/pan/traffic.log",
    defaultFormat: "CSV (Comma-Separated Values)",
    jsonNative: false,
    rotation: "Configurable via syslog server or Panorama retention policies",
  },
  paths: {
    linux: [
      {
        distro: "Syslog Server",
        path: "/var/log/paloalto/traffic.log",
        note: "Path depends on syslog-ng/rsyslog configuration",
      },
    ],
    cloud: [
      {
        provider: "Panorama",
        path: "Monitor > Logs > Traffic",
      },
      {
        provider: "Cortex Data Lake",
        path: "Cortex Data Lake > Explore > Firewall > Traffic",
      },
      {
        provider: "Azure Sentinel",
        path: "CommonSecurityLog table with DeviceVendor='Palo Alto Networks'",
      },
    ],
  },
  formats: [
    {
      id: "csv",
      name: "CSV Format (Syslog)",
      isDefault: true,
      structure: "Comma-separated values with 70+ fields depending on PAN-OS version",
      example: `1,2026/01/02 10:15:32,007654321012,TRAFFIC,end,2560,2026/01/02 10:15:32,192.168.1.100,203.0.113.50,0.0.0.0,0.0.0.0,Allow-Outbound,domain\\jsmith,,web-browsing,vsys1,trust,untrust,ethernet1/2,ethernet1/1,Forward-to-Panorama,2026/01/02 10:15:32,12345,1,54321,443,0,0,0x400000,tcp,allow,1523,800,723,15,2026/01/02 10:15:00,0,any,0,123456789,0x8000000000000000,192.168.0.0-192.168.255.255,United States,0,8,7,aged-out,0,0,0,0,,PA-3260,from-policy,,,0,,0,,N/A,0,0,0,0,1a2b3c4d-5e6f-7890-abcd-ef1234567890,0,0,,,,,,,`,
    },
    {
      id: "cef",
      name: "CEF Format",
      isDefault: false,
      structure: "Common Event Format for SIEM integration",
      example: `CEF:0|Palo Alto Networks|PAN-OS|11.0.0|TRAFFIC|end|3|src=192.168.1.100 dst=203.0.113.50 spt=54321 dpt=443 proto=tcp act=allow app=web-browsing cs1=Allow-Outbound cs1Label=Rule`,
    },
    {
      id: "leef",
      name: "LEEF Format (IBM QRadar)",
      isDefault: false,
      structure: "Log Event Extended Format for IBM QRadar",
      example: `LEEF:1.0|Palo Alto Networks|PAN-OS|11.0.0|TRAFFIC|src=192.168.1.100\tdst=203.0.113.50\tsrcPort=54321\tdstPort=443\tproto=tcp\taction=allow\tapp=web-browsing`,
    },
  ],
  fields: [
    {
      name: "receive_time",
      type: "datetime",
      description: "Time the log was received at the management plane",
      example: "2026/01/02 10:15:32",
    },
    {
      name: "serial",
      type: "string",
      description: "Serial number of the firewall",
      example: "007654321012",
    },
    {
      name: "type",
      type: "string",
      description: "Log type (always TRAFFIC for traffic logs)",
      example: "TRAFFIC",
      enum: ["TRAFFIC"],
    },
    {
      name: "subtype",
      type: "string",
      description: "Traffic log subtype",
      example: "end",
      enum: ["start", "end", "drop", "deny"],
    },
    {
      name: "time_generated",
      type: "datetime",
      description: "Time the log was generated on the dataplane",
      example: "2026/01/02 10:15:32",
    },
    {
      name: "src",
      type: "ip",
      description: "Source IP address",
      example: "192.168.1.100",
    },
    {
      name: "dst",
      type: "ip",
      description: "Destination IP address",
      example: "203.0.113.50",
    },
    {
      name: "natsrc",
      type: "ip",
      description: "Post-NAT source IP address",
      example: "198.51.100.10",
    },
    {
      name: "natdst",
      type: "ip",
      description: "Post-NAT destination IP address",
      example: "203.0.113.50",
    },
    {
      name: "rule",
      type: "string",
      description: "Security policy rule name that matched",
      example: "Allow-Outbound",
    },
    {
      name: "srcuser",
      type: "string",
      description: "Source user (from User-ID)",
      example: "domain\\jsmith",
    },
    {
      name: "dstuser",
      type: "string",
      description: "Destination user",
      example: "",
    },
    {
      name: "app",
      type: "string",
      description: "Application identified by App-ID",
      example: "web-browsing",
    },
    {
      name: "vsys",
      type: "string",
      description: "Virtual system name",
      example: "vsys1",
    },
    {
      name: "from",
      type: "string",
      description: "Source security zone",
      example: "trust",
    },
    {
      name: "to",
      type: "string",
      description: "Destination security zone",
      example: "untrust",
    },
    {
      name: "inbound_if",
      type: "string",
      description: "Inbound interface",
      example: "ethernet1/2",
    },
    {
      name: "outbound_if",
      type: "string",
      description: "Outbound interface",
      example: "ethernet1/1",
    },
    {
      name: "sessionid",
      type: "integer",
      description: "Unique session identifier",
      example: 12345,
    },
    {
      name: "sport",
      type: "integer",
      description: "Source port",
      example: 54321,
    },
    {
      name: "dport",
      type: "integer",
      description: "Destination port",
      example: 443,
    },
    {
      name: "natsport",
      type: "integer",
      description: "Post-NAT source port",
      example: 54321,
    },
    {
      name: "natdport",
      type: "integer",
      description: "Post-NAT destination port",
      example: 443,
    },
    {
      name: "proto",
      type: "string",
      description: "IP protocol",
      example: "tcp",
      enum: ["tcp", "udp", "icmp", "gre", "esp", "ah"],
    },
    {
      name: "action",
      type: "string",
      description: "Action taken on the session",
      example: "allow",
      enum: ["allow", "deny", "drop", "reset-client", "reset-server", "reset-both"],
    },
    {
      name: "bytes",
      type: "integer",
      description: "Total bytes transferred (sent + received)",
      example: 1523,
    },
    {
      name: "bytes_sent",
      type: "integer",
      description: "Bytes sent from client to server",
      example: 800,
    },
    {
      name: "bytes_received",
      type: "integer",
      description: "Bytes received from server to client",
      example: 723,
    },
    {
      name: "packets",
      type: "integer",
      description: "Total packets in the session",
      example: 15,
    },
    {
      name: "start",
      type: "datetime",
      description: "Session start time",
      example: "2026/01/02 10:15:00",
    },
    {
      name: "elapsed",
      type: "integer",
      description: "Session duration in seconds",
      example: 32,
      unit: "seconds",
    },
    {
      name: "category",
      type: "string",
      description: "URL category (if URL filtering enabled)",
      example: "business-and-economy",
    },
    {
      name: "session_end_reason",
      type: "string",
      description: "Reason for session termination",
      example: "aged-out",
      enum: ["aged-out", "tcp-fin", "tcp-rst-from-client", "tcp-rst-from-server", "policy-deny", "decrypt-error", "threat", "n/a"],
    },
    {
      name: "device_name",
      type: "string",
      description: "Firewall hostname",
      example: "PA-3260",
    },
    {
      name: "action_source",
      type: "string",
      description: "Source of the action (from-policy, from-application)",
      example: "from-policy",
    },
  ],
  parsing: {
    grok: {
      csv: `%{INT:future_use1},%{TIMESTAMP_ISO8601:receive_time},%{DATA:serial},%{WORD:type},%{WORD:subtype},%{INT:future_use2},%{TIMESTAMP_ISO8601:time_generated},%{IP:src},%{IP:dst},%{IP:natsrc},%{IP:natdst},%{DATA:rule},%{DATA:srcuser},%{DATA:dstuser},%{DATA:app},%{DATA:vsys},%{DATA:from},%{DATA:to},%{DATA:inbound_if},%{DATA:outbound_if},%{DATA:log_action},%{TIMESTAMP_ISO8601:time_logged},%{INT:sessionid},%{INT:repeat},%{INT:sport},%{INT:dport},%{INT:natsport},%{INT:natdport},%{DATA:flags},%{WORD:proto},%{WORD:action},%{INT:bytes},%{INT:bytes_sent},%{INT:bytes_received},%{INT:packets},%{TIMESTAMP_ISO8601:start},%{INT:elapsed},%{DATA:category}`,
    },
    regex: {
      csv: `^(?P<future_use1>\\d+),(?P<receive_time>[^,]+),(?P<serial>[^,]+),(?P<type>TRAFFIC),(?P<subtype>[^,]+),(?P<future_use2>\\d+),(?P<time_generated>[^,]+),(?P<src>[^,]+),(?P<dst>[^,]+),(?P<natsrc>[^,]+),(?P<natdst>[^,]+),(?P<rule>[^,]*),(?P<srcuser>[^,]*),(?P<dstuser>[^,]*),(?P<app>[^,]+),(?P<vsys>[^,]+),(?P<from>[^,]+),(?P<to>[^,]+),(?P<inbound_if>[^,]+),(?P<outbound_if>[^,]+),(?P<log_action>[^,]*),(?P<time_logged>[^,]+),(?P<sessionid>\\d+),(?P<repeat>\\d+),(?P<sport>\\d+),(?P<dport>\\d+),(?P<natsport>\\d+),(?P<natdport>\\d+),(?P<flags>[^,]*),(?P<proto>[^,]+),(?P<action>[^,]+),(?P<bytes>\\d+),(?P<bytes_sent>\\d+),(?P<bytes_received>\\d+),(?P<packets>\\d+),(?P<start>[^,]+),(?P<elapsed>\\d+),(?P<category>[^,]*)`,
    },
    examples: {
      splunk: `# Splunk TA for Palo Alto Networks
[pan:traffic]
TIME_FORMAT = %Y/%m/%d %H:%M:%S
TIME_PREFIX = ^[^,]*,
MAX_TIMESTAMP_LOOKAHEAD = 44
SHOULD_LINEMERGE = false
TRUNCATE = 8192
pulldown_type = true

# props.conf for syslog input
[source::udp:514]
TRANSFORMS-pan = pan_traffic
sourcetype = pan:traffic`,
      logstash: `input {
  syslog {
    port => 514
    type => "paloalto"
  }
}

filter {
  if [type] == "paloalto" and [message] =~ /,TRAFFIC,/ {
    csv {
      source => "message"
      columns => ["future_use1","receive_time","serial","type","subtype","future_use2","time_generated","src","dst","natsrc","natdst","rule","srcuser","dstuser","app","vsys","from","to","inbound_if","outbound_if","log_action","time_logged","sessionid","repeat","sport","dport","natsport","natdport","flags","proto","action","bytes","bytes_sent","bytes_received","packets","start","elapsed","category"]
    }
    date {
      match => ["receive_time", "yyyy/MM/dd HH:mm:ss"]
      target => "@timestamp"
    }
    mutate {
      convert => {
        "bytes" => "integer"
        "bytes_sent" => "integer"
        "bytes_received" => "integer"
        "packets" => "integer"
        "sport" => "integer"
        "dport" => "integer"
        "sessionid" => "integer"
        "elapsed" => "integer"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "paloalto-traffic-%{+YYYY.MM.dd}"
  }
}`,
      cribl: `# Cribl Stream Pipeline
filter: sourcetype=='pan:traffic'
functions:
  - id: serde
    filter: "true"
    disabled: false
    conf:
      mode: extract
      type: csv
      srcField: _raw
      fields:
        - future_use1
        - receive_time
        - serial
        - type
        - subtype
        - future_use2
        - time_generated
        - src
        - dst
        - natsrc
        - natdst
        - rule
        - srcuser
        - dstuser
        - app`,
      qradar: `# QRadar Log Source Configuration
Log Source Type: Palo Alto Networks Firewall
Protocol Type: Syslog
Log Source Identifier: <firewall-ip>
Event Format: LEEF

# DSM parsing
Palo Alto Traffic logs use Device Type ID 112`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable traffic logging in security policy rules",
      example: `# CLI commands to enable traffic logging
configure
set rulebase security rules <rule-name> log-start yes
set rulebase security rules <rule-name> log-end yes
set rulebase security rules <rule-name> log-setting <log-forwarding-profile>
commit`,
      note: "Log-end is recommended for most use cases to reduce log volume",
    },
    logToSyslog: {
      description: "Configure syslog forwarding",
      example: `# Configure syslog server profile
set shared log-settings syslog <profile-name> server <server-name> server <ip-address>
set shared log-settings syslog <profile-name> server <server-name> transport UDP
set shared log-settings syslog <profile-name> server <server-name> port 514
set shared log-settings syslog <profile-name> server <server-name> format BSD

# Create log forwarding profile
set shared log-settings profiles <profile-name> match-list <match-name> log-type traffic
set shared log-settings profiles <profile-name> match-list <match-name> send-syslog <syslog-profile>

# Apply to security rules
set rulebase security rules <rule-name> log-setting <profile-name>`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Application visibility",
        description: "Identify applications traversing the network",
        fieldsUsed: ["app", "bytes", "packets"],
        logic: "GROUP BY app | STATS sum(bytes), count()",
      },
      {
        name: "Bandwidth consumption",
        description: "Track top bandwidth consumers by source IP or application",
        fieldsUsed: ["src", "app", "bytes"],
        logic: "GROUP BY src, app | STATS sum(bytes) | SORT bytes DESC",
      },
      {
        name: "Session monitoring",
        description: "Monitor active and completed sessions",
        fieldsUsed: ["sessionid", "subtype", "elapsed", "session_end_reason"],
      },
      {
        name: "Policy rule usage",
        description: "Analyze which security rules are being triggered",
        fieldsUsed: ["rule", "action"],
        logic: "GROUP BY rule | STATS count() | SORT count DESC",
      },
    ],
    security: [
      {
        name: "Denied traffic analysis",
        description: "Investigate blocked connections for threats or misconfigurations",
        fieldsUsed: ["src", "dst", "dport", "app", "action", "rule"],
        logic: "action IN ('deny', 'drop', 'reset-both') | GROUP BY src, dst, dport",
      },
      {
        name: "Lateral movement detection",
        description: "Detect unusual internal traffic patterns",
        fieldsUsed: ["src", "dst", "from", "to", "app"],
        logic: "from='trust' AND to='trust' AND app NOT IN (known_apps)",
      },
      {
        name: "Data exfiltration detection",
        description: "Monitor for large outbound data transfers",
        fieldsUsed: ["src", "dst", "bytes_sent", "app", "to"],
        logic: "to='untrust' AND bytes_sent > threshold | GROUP BY src",
      },
      {
        name: "Port scanning detection",
        description: "Identify hosts scanning multiple ports",
        fieldsUsed: ["src", "dst", "dport", "action"],
        logic: "action='deny' | GROUP BY src, dst | STATS dc(dport) as ports | WHERE ports > 20",
      },
      {
        name: "Unauthorized application usage",
        description: "Detect use of prohibited applications",
        fieldsUsed: ["srcuser", "app", "category"],
        logic: "app IN (blocked_apps) OR category IN (blocked_categories)",
      },
    ],
    business: [
      {
        name: "User activity reporting",
        description: "Track user application usage for compliance",
        fieldsUsed: ["srcuser", "app", "bytes", "category"],
      },
      {
        name: "Network capacity planning",
        description: "Analyze traffic patterns for infrastructure planning",
        fieldsUsed: ["bytes", "packets", "app", "time_generated"],
        logic: "GROUP BY time_bucket(1h), app | STATS sum(bytes)",
      },
      {
        name: "Application adoption tracking",
        description: "Monitor adoption of sanctioned applications",
        fieldsUsed: ["app", "srcuser", "bytes"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Traffic logs not being generated",
      causes: [
        "Logging not enabled on security policy rules",
        "Log forwarding profile not applied to rules",
        "Firewall dataplane overloaded",
      ],
      solutions: [
        "Enable log-end on security rules: set rulebase security rules <rule> log-end yes",
        "Verify log forwarding profile is assigned to rules",
        "Check dataplane utilization: show running resource-monitor",
        "Review logging rate limits: show system setting logging",
      ],
    },
    {
      problem: "Logs not appearing in SIEM",
      causes: [
        "Syslog server misconfigured",
        "Network connectivity issues",
        "SIEM parsing errors",
      ],
      solutions: [
        "Test syslog connectivity: test log-collector syslog <profile>",
        "Verify firewall can reach syslog server: ping source <mgmt-ip> host <syslog-ip>",
        "Check syslog server is listening on correct port",
        "Verify SIEM log source configuration matches format (BSD/IETF)",
      ],
    },
    {
      problem: "Missing user information (srcuser empty)",
      causes: [
        "User-ID not enabled",
        "User-ID agent not connected",
        "Traffic from unauthenticated users",
      ],
      solutions: [
        "Enable User-ID on source zone",
        "Verify User-ID agent status: show user user-id-agent state all",
        "Check IP-to-user mappings: show user ip-user-mapping all",
      ],
    },
    {
      problem: "Application showing as 'incomplete' or 'insufficient-data'",
      causes: [
        "Session terminated before App-ID could identify",
        "Encrypted traffic without decryption",
        "Unknown or custom application",
      ],
      solutions: [
        "Enable SSL decryption for better visibility",
        "Create custom App-ID signature for proprietary applications",
        "Review session timeout settings",
      ],
    },
  ],
  testedOn: [
    {
      version: "11.1.0",
      os: "PAN-OS",
      testedBy: "admin",
      testedAt: "2026-01-02",
    },
    {
      version: "10.2.4",
      os: "PAN-OS",
      testedBy: "admin",
      testedAt: "2026-01-02",
    },
  ],
  contribution: {
    createdAt: "2026-01-02",
    createdBy: "admin",
    updatedAt: "2026-01-02",
    updatedBy: "admin",
    contributors: ["admin"],
    validated: false,
  },
};

export const paloaltoThreatLog: LogType = {
  id: "threat",
  technologyId: "paloalto",
  name: "Threat Log",
  description: "Records security threats detected by the firewall including viruses, spyware, vulnerability exploits, command-and-control traffic, and malicious URLs",
  quickFacts: {
    defaultPathLinux: "Syslog receiver (e.g., /var/log/paloalto/threat.log)",
    defaultPathDocker: "/var/log/pan/threat.log",
    defaultFormat: "CSV (Comma-Separated Values)",
    jsonNative: false,
    rotation: "Configurable via syslog server or Panorama retention policies",
  },
  paths: {
    linux: [
      {
        distro: "Syslog Server",
        path: "/var/log/paloalto/threat.log",
        note: "Path depends on syslog-ng/rsyslog configuration",
      },
    ],
    cloud: [
      {
        provider: "Panorama",
        path: "Monitor > Logs > Threat",
      },
      {
        provider: "Cortex Data Lake",
        path: "Cortex Data Lake > Explore > Firewall > Threat",
      },
      {
        provider: "Cortex XDR",
        path: "Incidents & Alerts from firewall threat feeds",
      },
    ],
  },
  formats: [
    {
      id: "csv",
      name: "CSV Format (Syslog)",
      isDefault: true,
      structure: "Comma-separated values with threat-specific fields",
      example: `1,2026/01/02 14:23:45,007654321012,THREAT,vulnerability,2560,2026/01/02 14:23:45,192.168.1.50,203.0.113.100,0.0.0.0,0.0.0.0,Block-Threats,domain\\jdoe,,web-browsing,vsys1,trust,untrust,ethernet1/2,ethernet1/1,Forward-to-Panorama,2026/01/02 14:23:45,54321,1,52000,80,0,0,0x400000,tcp,alert,"Apache Struts Remote Code Execution Vulnerability",Palo Alto Networks - Known Vulnerabilities,informational,client-to-server,123456789,0x8000000000000000,192.168.0.0-192.168.255.255,United States,0,critical,high,41756,0,,0,,PA-3260,from-policy,,,0,,0,,N/A,0,0,0,0`,
    },
    {
      id: "cef",
      name: "CEF Format",
      isDefault: false,
      structure: "Common Event Format for SIEM integration",
      example: `CEF:0|Palo Alto Networks|PAN-OS|11.0.0|THREAT|vulnerability|8|src=192.168.1.50 dst=203.0.113.100 spt=52000 dpt=80 proto=tcp act=alert cs1=Block-Threats cs1Label=Rule cs2=Apache Struts Remote Code Execution Vulnerability cs2Label=ThreatName cn1=41756 cn1Label=ThreatID`,
    },
  ],
  fields: [
    {
      name: "receive_time",
      type: "datetime",
      description: "Time the log was received at the management plane",
      example: "2026/01/02 14:23:45",
    },
    {
      name: "serial",
      type: "string",
      description: "Serial number of the firewall",
      example: "007654321012",
    },
    {
      name: "type",
      type: "string",
      description: "Log type (always THREAT for threat logs)",
      example: "THREAT",
      enum: ["THREAT"],
    },
    {
      name: "subtype",
      type: "string",
      description: "Threat log subtype indicating the threat category",
      example: "vulnerability",
      enum: ["virus", "spyware", "vulnerability", "url", "wildfire", "wildfire-virus", "phishing", "data", "file"],
    },
    {
      name: "time_generated",
      type: "datetime",
      description: "Time the log was generated on the dataplane",
      example: "2026/01/02 14:23:45",
    },
    {
      name: "src",
      type: "ip",
      description: "Source IP address of the threat",
      example: "192.168.1.50",
    },
    {
      name: "dst",
      type: "ip",
      description: "Destination IP address",
      example: "203.0.113.100",
    },
    {
      name: "natsrc",
      type: "ip",
      description: "Post-NAT source IP address",
      example: "198.51.100.10",
    },
    {
      name: "natdst",
      type: "ip",
      description: "Post-NAT destination IP address",
      example: "203.0.113.100",
    },
    {
      name: "rule",
      type: "string",
      description: "Security policy rule name that matched",
      example: "Block-Threats",
    },
    {
      name: "srcuser",
      type: "string",
      description: "Source user (from User-ID)",
      example: "domain\\jdoe",
    },
    {
      name: "dstuser",
      type: "string",
      description: "Destination user",
      example: "",
    },
    {
      name: "app",
      type: "string",
      description: "Application identified by App-ID",
      example: "web-browsing",
    },
    {
      name: "vsys",
      type: "string",
      description: "Virtual system name",
      example: "vsys1",
    },
    {
      name: "from",
      type: "string",
      description: "Source security zone",
      example: "trust",
    },
    {
      name: "to",
      type: "string",
      description: "Destination security zone",
      example: "untrust",
    },
    {
      name: "inbound_if",
      type: "string",
      description: "Inbound interface",
      example: "ethernet1/2",
    },
    {
      name: "outbound_if",
      type: "string",
      description: "Outbound interface",
      example: "ethernet1/1",
    },
    {
      name: "sessionid",
      type: "integer",
      description: "Unique session identifier",
      example: 54321,
    },
    {
      name: "sport",
      type: "integer",
      description: "Source port",
      example: 52000,
    },
    {
      name: "dport",
      type: "integer",
      description: "Destination port",
      example: 80,
    },
    {
      name: "proto",
      type: "string",
      description: "IP protocol",
      example: "tcp",
      enum: ["tcp", "udp", "icmp"],
    },
    {
      name: "action",
      type: "string",
      description: "Action taken on the threat",
      example: "alert",
      enum: ["alert", "allow", "deny", "drop", "reset-client", "reset-server", "reset-both", "block-url", "block-ip", "sinkhole"],
    },
    {
      name: "threatname",
      type: "string",
      description: "Name of the detected threat or signature",
      example: "Apache Struts Remote Code Execution Vulnerability",
    },
    {
      name: "threat_category",
      type: "string",
      description: "Threat category for URL filtering or threat prevention",
      example: "Palo Alto Networks - Known Vulnerabilities",
    },
    {
      name: "severity",
      type: "string",
      description: "Severity level of the threat",
      example: "critical",
      enum: ["informational", "low", "medium", "high", "critical"],
    },
    {
      name: "direction",
      type: "string",
      description: "Direction of the attack",
      example: "client-to-server",
      enum: ["client-to-server", "server-to-client"],
    },
    {
      name: "threatid",
      type: "integer",
      description: "Unique threat ID from threat database",
      example: 41756,
    },
    {
      name: "pcap_id",
      type: "integer",
      description: "Packet capture ID if capture was triggered",
      example: 0,
    },
    {
      name: "filedigest",
      type: "string",
      description: "SHA256 hash of the file (for file-based threats)",
      example: "a1b2c3d4e5f6...",
    },
    {
      name: "cloud",
      type: "string",
      description: "WildFire cloud where file was analyzed",
      example: "wildfire.paloaltonetworks.com",
    },
    {
      name: "url_idx",
      type: "string",
      description: "URL or filename that triggered the threat",
      example: "/admin/struts/execute.action",
    },
    {
      name: "contenttype",
      type: "string",
      description: "Content type of the file or data",
      example: "application/x-java-archive",
    },
    {
      name: "device_name",
      type: "string",
      description: "Firewall hostname",
      example: "PA-3260",
    },
    {
      name: "file_url",
      type: "string",
      description: "URL from which file was downloaded",
      example: "http://malicious.com/payload.exe",
    },
    {
      name: "sender",
      type: "string",
      description: "Email sender (for email-based threats)",
      example: "attacker@malicious.com",
    },
    {
      name: "recipient",
      type: "string",
      description: "Email recipient (for email-based threats)",
      example: "victim@company.com",
    },
    {
      name: "subject",
      type: "string",
      description: "Email subject (for email-based threats)",
      example: "Invoice Attached",
    },
    {
      name: "reportid",
      type: "integer",
      description: "WildFire report ID",
      example: 123456789,
    },
  ],
  parsing: {
    grok: {
      csv: `%{INT:future_use1},%{TIMESTAMP_ISO8601:receive_time},%{DATA:serial},%{WORD:type},%{WORD:subtype},%{INT:future_use2},%{TIMESTAMP_ISO8601:time_generated},%{IP:src},%{IP:dst},%{IP:natsrc},%{IP:natdst},%{DATA:rule},%{DATA:srcuser},%{DATA:dstuser},%{DATA:app},%{DATA:vsys},%{DATA:from},%{DATA:to},%{DATA:inbound_if},%{DATA:outbound_if},%{DATA:log_action},%{TIMESTAMP_ISO8601:time_logged},%{INT:sessionid},%{INT:repeat},%{INT:sport},%{INT:dport},%{INT:natsport},%{INT:natdport},%{DATA:flags},%{WORD:proto},%{WORD:action},%{DATA:threatname},%{DATA:threat_category},%{WORD:severity},%{DATA:direction},%{INT:seqno},%{DATA:action_flags},%{DATA:srcloc},%{DATA:dstloc}`,
    },
    regex: {
      csv: `^(?P<future_use1>\\d+),(?P<receive_time>[^,]+),(?P<serial>[^,]+),(?P<type>THREAT),(?P<subtype>[^,]+),(?P<future_use2>\\d+),(?P<time_generated>[^,]+),(?P<src>[^,]+),(?P<dst>[^,]+),(?P<natsrc>[^,]+),(?P<natdst>[^,]+),(?P<rule>[^,]*),(?P<srcuser>[^,]*),(?P<dstuser>[^,]*),(?P<app>[^,]+),(?P<vsys>[^,]+),(?P<from>[^,]+),(?P<to>[^,]+),(?P<inbound_if>[^,]+),(?P<outbound_if>[^,]+),(?P<log_action>[^,]*),(?P<time_logged>[^,]+),(?P<sessionid>\\d+),(?P<repeat>\\d+),(?P<sport>\\d+),(?P<dport>\\d+),(?P<natsport>\\d+),(?P<natdport>\\d+),(?P<flags>[^,]*),(?P<proto>[^,]+),(?P<action>[^,]+),(?P<threatname>[^,]*),(?P<threat_category>[^,]*),(?P<severity>[^,]*)`,
    },
    examples: {
      splunk: `# Splunk TA for Palo Alto Networks
[pan:threat]
TIME_FORMAT = %Y/%m/%d %H:%M:%S
TIME_PREFIX = ^[^,]*,
MAX_TIMESTAMP_LOOKAHEAD = 44
SHOULD_LINEMERGE = false
TRUNCATE = 8192
pulldown_type = true

# props.conf for syslog input
[source::udp:514]
TRANSFORMS-pan_threat = pan_threat
sourcetype = pan:threat

# High severity threat alerts
[pan:threat]
EVAL-severity_score = case(severity=="critical",5,severity=="high",4,severity=="medium",3,severity=="low",2,severity=="informational",1,true(),0)`,
      logstash: `input {
  syslog {
    port => 514
    type => "paloalto"
  }
}

filter {
  if [type] == "paloalto" and [message] =~ /,THREAT,/ {
    csv {
      source => "message"
      columns => ["future_use1","receive_time","serial","type","subtype","future_use2","time_generated","src","dst","natsrc","natdst","rule","srcuser","dstuser","app","vsys","from","to","inbound_if","outbound_if","log_action","time_logged","sessionid","repeat","sport","dport","natsport","natdport","flags","proto","action","threatname","threat_category","severity","direction","seqno"]
    }
    date {
      match => ["receive_time", "yyyy/MM/dd HH:mm:ss"]
      target => "@timestamp"
    }
    # Add severity score for alerting
    if [severity] == "critical" {
      mutate { add_field => { "severity_score" => 5 } }
    } else if [severity] == "high" {
      mutate { add_field => { "severity_score" => 4 } }
    }
    mutate {
      convert => {
        "sport" => "integer"
        "dport" => "integer"
        "sessionid" => "integer"
        "severity_score" => "integer"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "paloalto-threat-%{+YYYY.MM.dd}"
  }
}`,
      qradar: `# QRadar Log Source Configuration
Log Source Type: Palo Alto Networks Firewall
Protocol Type: Syslog
Log Source Identifier: <firewall-ip>
Event Format: LEEF

# DSM parsing - Threat logs
Palo Alto Threat logs use Device Type ID 112
Threat events map to QRadar offense categories based on subtype`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable threat logging in security profiles",
      example: `# Configure Antivirus Profile
set profiles virus <profile-name> decoder <type> action alert
set profiles virus <profile-name> mlav-engine-filebased-enabled yes

# Configure Anti-Spyware Profile
set profiles spyware <profile-name> rules <rule-name> severity critical action alert
set profiles spyware <profile-name> botnet-domains lists default-paloalto-dns action sinkhole

# Configure Vulnerability Protection Profile
set profiles vulnerability <profile-name> rules <rule-name> severity critical action reset-both

# Apply profiles to security rules
set rulebase security rules <rule-name> profile-setting profiles virus <av-profile>
set rulebase security rules <rule-name> profile-setting profiles spyware <as-profile>
set rulebase security rules <rule-name> profile-setting profiles vulnerability <vp-profile>`,
      note: "Ensure threat prevention license is active",
    },
    logToSyslog: {
      description: "Configure syslog forwarding for threat logs",
      example: `# Create log forwarding profile for threats
set shared log-settings profiles <profile-name> match-list <match-name> log-type threat
set shared log-settings profiles <profile-name> match-list <match-name> filter "All Logs"
set shared log-settings profiles <profile-name> match-list <match-name> send-syslog <syslog-profile>

# Forward only critical/high severity
set shared log-settings profiles <profile-name> match-list critical-threats log-type threat
set shared log-settings profiles <profile-name> match-list critical-threats filter "(severity eq critical) or (severity eq high)"
set shared log-settings profiles <profile-name> match-list critical-threats send-syslog <syslog-profile>`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Threat volume monitoring",
        description: "Track daily threat detection rates and trends",
        fieldsUsed: ["subtype", "severity", "time_generated"],
        logic: "GROUP BY time_bucket(1h), severity | STATS count()",
      },
      {
        name: "Top attacked hosts",
        description: "Identify internal hosts receiving the most threats",
        fieldsUsed: ["dst", "threatname", "severity"],
        logic: "GROUP BY dst | STATS count() | SORT count DESC | LIMIT 10",
      },
      {
        name: "Threat prevention effectiveness",
        description: "Measure block vs alert ratio",
        fieldsUsed: ["action", "subtype"],
        logic: "GROUP BY action | STATS count() as total | EVAL block_rate = blocked/total",
      },
    ],
    security: [
      {
        name: "Critical threat alerting",
        description: "Immediate alerts for critical severity threats",
        fieldsUsed: ["severity", "threatname", "src", "dst", "action"],
        logic: "severity IN ('critical', 'high') | ALERT",
      },
      {
        name: "Command and control detection",
        description: "Detect C2 beaconing activity",
        fieldsUsed: ["subtype", "threatname", "dst", "src"],
        logic: "subtype='spyware' AND threatname CONTAINS 'Command and Control'",
      },
      {
        name: "Malware outbreak detection",
        description: "Identify spreading malware across hosts",
        fieldsUsed: ["subtype", "threatname", "src", "filedigest"],
        logic: "subtype IN ('virus', 'wildfire-virus') | GROUP BY filedigest | STATS dc(src) | WHERE dc_src > 3",
      },
      {
        name: "Exploit attempt tracking",
        description: "Track vulnerability exploitation attempts",
        fieldsUsed: ["subtype", "threatid", "src", "dst", "app"],
        logic: "subtype='vulnerability' | GROUP BY threatid, src",
      },
      {
        name: "Phishing detection",
        description: "Identify phishing URLs and credential harvesting",
        fieldsUsed: ["subtype", "url_idx", "srcuser", "action"],
        logic: "subtype='phishing' OR threat_category CONTAINS 'phishing'",
      },
      {
        name: "Zero-day threat hunting",
        description: "Monitor WildFire verdicts for new malware",
        fieldsUsed: ["subtype", "filedigest", "cloud", "reportid"],
        logic: "subtype='wildfire' AND action='alert'",
      },
    ],
    business: [
      {
        name: "Security posture reporting",
        description: "Executive dashboard of threat landscape",
        fieldsUsed: ["severity", "subtype", "action"],
        logic: "GROUP BY severity, subtype | STATS count()",
      },
      {
        name: "Compliance evidence",
        description: "Document threat prevention for audits",
        fieldsUsed: ["threatname", "action", "time_generated"],
      },
      {
        name: "User risk scoring",
        description: "Identify high-risk users based on threat exposure",
        fieldsUsed: ["srcuser", "severity", "subtype"],
        logic: "GROUP BY srcuser | STATS sum(severity_score) as risk_score | SORT risk_score DESC",
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Threat logs not being generated",
      causes: [
        "Security profiles not applied to rules",
        "Threat Prevention license expired",
        "Content updates not installed",
      ],
      solutions: [
        "Verify security profiles are attached: show running security-policy",
        "Check license status: request license info",
        "Update threat content: request content upgrade install",
        "Verify profile actions are set to 'alert' or 'block'",
      ],
    },
    {
      problem: "Too many false positives",
      causes: [
        "Overly sensitive signatures",
        "Legitimate business applications triggering signatures",
        "Outdated threat content",
      ],
      solutions: [
        "Create threat exceptions for known false positives",
        "Tune signature actions from block to alert for investigation",
        "Update to latest content version",
        "Report false positives to Palo Alto Networks",
      ],
    },
    {
      problem: "WildFire verdicts delayed",
      causes: [
        "Network connectivity to WildFire cloud",
        "File size exceeds WildFire limits",
        "High analysis queue",
      ],
      solutions: [
        "Test WildFire connectivity: request wildfire registration",
        "Check WildFire status: show wildfire status",
        "Verify firewall can reach wildfire.paloaltonetworks.com:443",
      ],
    },
    {
      problem: "Missing file hash in threat logs",
      causes: [
        "File type not supported for hashing",
        "Session ended before file transfer completed",
        "Encrypted file content",
      ],
      solutions: [
        "Enable SSL decryption for encrypted traffic",
        "Configure file blocking profile to log all file types",
        "Check supported file types in documentation",
      ],
    },
  ],
  testedOn: [
    {
      version: "11.1.0",
      os: "PAN-OS",
      testedBy: "admin",
      testedAt: "2026-01-02",
    },
    {
      version: "10.2.4",
      os: "PAN-OS",
      testedBy: "admin",
      testedAt: "2026-01-02",
    },
  ],
  contribution: {
    createdAt: "2026-01-02",
    createdBy: "admin",
    updatedAt: "2026-01-02",
    updatedBy: "admin",
    contributors: ["admin"],
    validated: false,
  },
};

export const paloaltoUrlLog: LogType = {
  id: "url",
  technologyId: "paloalto",
  name: "URL Filtering Log",
  description: "Records web browsing activity including URLs visited, URL categories, content types, and policy actions for web access control and compliance monitoring",
  quickFacts: {
    defaultPathLinux: "Syslog receiver (e.g., /var/log/paloalto/url.log)",
    defaultPathDocker: "/var/log/pan/url.log",
    defaultFormat: "CSV (Comma-Separated Values)",
    jsonNative: false,
    rotation: "Configurable via syslog server or Panorama retention policies",
  },
  paths: {
    linux: [
      {
        distro: "Syslog Server",
        path: "/var/log/paloalto/url.log",
        note: "Path depends on syslog-ng/rsyslog configuration",
      },
    ],
    cloud: [
      {
        provider: "Panorama",
        path: "Monitor > Logs > URL Filtering",
      },
      {
        provider: "Cortex Data Lake",
        path: "Cortex Data Lake > Explore > Firewall > URL",
      },
    ],
  },
  formats: [
    {
      id: "csv",
      name: "CSV Format (Syslog)",
      isDefault: true,
      structure: "Comma-separated values with URL filtering specific fields",
      example: `1,2026/01/02 10:30:15,007654321012,URL,end,2560,2026/01/02 10:30:15,192.168.1.100,151.101.1.140,198.51.100.1,151.101.1.140,Allow-Web,corp\\jsmith,,ssl,vsys1,trust,untrust,ethernet1/2,ethernet1/1,Forward-Logs,2026/01/02 10:30:15,67890,1,55000,443,55000,443,0x400000,tcp,alert,www.reddit.com/,social-networking,informational,client-to-server,9876543210,0x8000000000000000,192.168.0.0-192.168.255.255,United States,text/html,allow,content-type,low,PA-3260,from-policy,reddit.com,/r/technology,Mozilla/5.0 (Windows NT 10.0; Win64; x64),http-hdr-referer,container-page`,
    },
    {
      id: "cef",
      name: "CEF Format",
      isDefault: false,
      structure: "Common Event Format for SIEM integration",
      example: `CEF:0|Palo Alto Networks|PAN-OS|11.0.0|URL|end|3|src=192.168.1.100 dst=151.101.1.140 spt=55000 dpt=443 proto=tcp act=alert request=www.reddit.com/ cs1=Allow-Web cs1Label=Rule cs2=social-networking cs2Label=URLCategory`,
    },
  ],
  fields: [
    {
      name: "receive_time",
      type: "datetime",
      description: "Time the log was received at the management plane",
      example: "2026/01/02 10:30:15",
    },
    {
      name: "serial",
      type: "string",
      description: "Serial number of the firewall",
      example: "007654321012",
    },
    {
      name: "type",
      type: "string",
      description: "Log type (URL for URL filtering logs)",
      example: "URL",
      enum: ["URL"],
    },
    {
      name: "subtype",
      type: "string",
      description: "URL log subtype",
      example: "end",
      enum: ["start", "end", "drop", "deny", "block-continue", "block-override", "continue"],
    },
    {
      name: "time_generated",
      type: "datetime",
      description: "Time the log was generated on the dataplane",
      example: "2026/01/02 10:30:15",
    },
    {
      name: "src",
      type: "ip",
      description: "Source IP address (user/client)",
      example: "192.168.1.100",
    },
    {
      name: "dst",
      type: "ip",
      description: "Destination IP address (web server)",
      example: "151.101.1.140",
    },
    {
      name: "natsrc",
      type: "ip",
      description: "Post-NAT source IP address",
      example: "198.51.100.1",
    },
    {
      name: "natdst",
      type: "ip",
      description: "Post-NAT destination IP address",
      example: "151.101.1.140",
    },
    {
      name: "rule",
      type: "string",
      description: "Security policy rule name that matched",
      example: "Allow-Web",
    },
    {
      name: "srcuser",
      type: "string",
      description: "Source user (from User-ID)",
      example: "corp\\jsmith",
    },
    {
      name: "app",
      type: "string",
      description: "Application identified by App-ID",
      example: "ssl",
    },
    {
      name: "vsys",
      type: "string",
      description: "Virtual system name",
      example: "vsys1",
    },
    {
      name: "from",
      type: "string",
      description: "Source security zone",
      example: "trust",
    },
    {
      name: "to",
      type: "string",
      description: "Destination security zone",
      example: "untrust",
    },
    {
      name: "inbound_if",
      type: "string",
      description: "Inbound interface",
      example: "ethernet1/2",
    },
    {
      name: "outbound_if",
      type: "string",
      description: "Outbound interface",
      example: "ethernet1/1",
    },
    {
      name: "sessionid",
      type: "integer",
      description: "Unique session identifier",
      example: 67890,
    },
    {
      name: "sport",
      type: "integer",
      description: "Source port",
      example: 55000,
    },
    {
      name: "dport",
      type: "integer",
      description: "Destination port",
      example: 443,
    },
    {
      name: "proto",
      type: "string",
      description: "IP protocol",
      example: "tcp",
      enum: ["tcp", "udp"],
    },
    {
      name: "action",
      type: "string",
      description: "Action taken on the URL request",
      example: "alert",
      enum: ["alert", "allow", "block-continue", "block-override", "block-url", "continue", "override-lockout", "override"],
    },
    {
      name: "url",
      type: "string",
      description: "Full URL or hostname accessed",
      example: "www.reddit.com/r/technology",
    },
    {
      name: "url_category",
      type: "string",
      description: "URL category from PAN-DB",
      example: "social-networking",
    },
    {
      name: "severity",
      type: "string",
      description: "Severity level based on URL category risk",
      example: "informational",
      enum: ["informational", "low", "medium", "high", "critical"],
    },
    {
      name: "direction",
      type: "string",
      description: "Direction of the request",
      example: "client-to-server",
      enum: ["client-to-server", "server-to-client"],
    },
    {
      name: "content_type",
      type: "string",
      description: "HTTP content type of the response",
      example: "text/html",
    },
    {
      name: "http_method",
      type: "string",
      description: "HTTP request method",
      example: "GET",
      enum: ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "PATCH", "CONNECT"],
    },
    {
      name: "user_agent",
      type: "string",
      description: "Browser user agent string",
      example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    {
      name: "referer",
      type: "string",
      description: "HTTP referer header",
      example: "https://www.google.com/",
    },
    {
      name: "device_name",
      type: "string",
      description: "Firewall hostname",
      example: "PA-3260",
    },
    {
      name: "url_category_list",
      type: "string",
      description: "List of all URL categories matched (comma-separated)",
      example: "social-networking,news",
    },
    {
      name: "http_headers",
      type: "string",
      description: "Captured HTTP headers (if configured)",
      example: "X-Forwarded-For: 10.0.0.1",
    },
  ],
  parsing: {
    grok: {
      csv: `%{INT:future_use1},%{TIMESTAMP_ISO8601:receive_time},%{DATA:serial},%{WORD:type},%{WORD:subtype},%{INT:future_use2},%{TIMESTAMP_ISO8601:time_generated},%{IP:src},%{IP:dst},%{IP:natsrc},%{IP:natdst},%{DATA:rule},%{DATA:srcuser},%{DATA:dstuser},%{DATA:app},%{DATA:vsys},%{DATA:from},%{DATA:to},%{DATA:inbound_if},%{DATA:outbound_if},%{DATA:log_action},%{TIMESTAMP_ISO8601:time_logged},%{INT:sessionid},%{INT:repeat},%{INT:sport},%{INT:dport},%{INT:natsport},%{INT:natdport},%{DATA:flags},%{WORD:proto},%{WORD:action},%{DATA:url},%{DATA:url_category},%{WORD:severity},%{DATA:direction}`,
    },
    regex: {
      csv: `^(?P<future_use1>\\d+),(?P<receive_time>[^,]+),(?P<serial>[^,]+),(?P<type>URL),(?P<subtype>[^,]+),(?P<future_use2>\\d+),(?P<time_generated>[^,]+),(?P<src>[^,]+),(?P<dst>[^,]+),(?P<natsrc>[^,]+),(?P<natdst>[^,]+),(?P<rule>[^,]*),(?P<srcuser>[^,]*),(?P<dstuser>[^,]*),(?P<app>[^,]+),(?P<vsys>[^,]+),(?P<from>[^,]+),(?P<to>[^,]+),(?P<inbound_if>[^,]+),(?P<outbound_if>[^,]+),(?P<log_action>[^,]*),(?P<time_logged>[^,]+),(?P<sessionid>\\d+),(?P<repeat>\\d+),(?P<sport>\\d+),(?P<dport>\\d+),(?P<natsport>\\d+),(?P<natdport>\\d+),(?P<flags>[^,]*),(?P<proto>[^,]+),(?P<action>[^,]+),(?P<url>[^,]*),(?P<url_category>[^,]*),(?P<severity>[^,]*)`,
    },
    examples: {
      splunk: `# Splunk TA for Palo Alto Networks
[pan:url]
TIME_FORMAT = %Y/%m/%d %H:%M:%S
TIME_PREFIX = ^[^,]*,
MAX_TIMESTAMP_LOOKAHEAD = 44
SHOULD_LINEMERGE = false
TRUNCATE = 16384
pulldown_type = true

# URL category field extractions
FIELDALIAS-url_category = url_category as category
EVAL-url_domain = mvindex(split(url,"/"),0)

# Alert on blocked categories
[pan:url]
alert.severity = case(action=="block-url",4,action=="block-continue",3,action=="alert",2,true(),1)`,
      logstash: `input {
  syslog {
    port => 514
    type => "paloalto"
  }
}

filter {
  if [type] == "paloalto" and [message] =~ /,URL,/ {
    csv {
      source => "message"
      columns => ["future_use1","receive_time","serial","type","subtype","future_use2","time_generated","src","dst","natsrc","natdst","rule","srcuser","dstuser","app","vsys","from","to","inbound_if","outbound_if","log_action","time_logged","sessionid","repeat","sport","dport","natsport","natdport","flags","proto","action","url","url_category","severity","direction"]
    }
    date {
      match => ["receive_time", "yyyy/MM/dd HH:mm:ss"]
      target => "@timestamp"
    }
    # Extract domain from URL
    grok {
      match => { "url" => "^(?<url_domain>[^/]+)" }
    }
    mutate {
      convert => {
        "sport" => "integer"
        "dport" => "integer"
        "sessionid" => "integer"
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "paloalto-url-%{+YYYY.MM.dd}"
  }
}`,
      qradar: `# QRadar Log Source Configuration
Log Source Type: Palo Alto Networks Firewall
Protocol Type: Syslog
Log Source Identifier: <firewall-ip>
Event Format: LEEF

# URL Filtering events map to web access categories
# High risk categories generate offenses automatically`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable URL filtering logging in URL Filtering profile",
      example: `# Configure URL Filtering Profile
set profiles url-filtering <profile-name> credential-enforcement mode disabled
set profiles url-filtering <profile-name> log-http-hdr-xff yes
set profiles url-filtering <profile-name> log-http-hdr-user-agent yes
set profiles url-filtering <profile-name> log-http-hdr-referer yes
set profiles url-filtering <profile-name> log-container-page-only no

# Set actions per category
set profiles url-filtering <profile-name> block adult
set profiles url-filtering <profile-name> block malware
set profiles url-filtering <profile-name> block phishing
set profiles url-filtering <profile-name> alert social-networking
set profiles url-filtering <profile-name> allow business-and-economy

# Apply to security rules
set rulebase security rules <rule-name> profile-setting profiles url-filtering <profile-name>`,
      note: "Ensure URL Filtering license is active and PAN-DB is updated",
    },
    logToSyslog: {
      description: "Configure syslog forwarding for URL logs",
      example: `# Create log forwarding profile for URL logs
set shared log-settings profiles <profile-name> match-list url-logs log-type url
set shared log-settings profiles <profile-name> match-list url-logs filter "All Logs"
set shared log-settings profiles <profile-name> match-list url-logs send-syslog <syslog-profile>

# Forward only blocked URLs
set shared log-settings profiles <profile-name> match-list blocked-urls log-type url
set shared log-settings profiles <profile-name> match-list blocked-urls filter "(action eq block-url) or (action eq block-continue)"
set shared log-settings profiles <profile-name> match-list blocked-urls send-syslog <syslog-profile>`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Web usage monitoring",
        description: "Track websites visited by users",
        fieldsUsed: ["srcuser", "url", "url_category", "time_generated"],
        logic: "GROUP BY srcuser, url_category | STATS count()",
      },
      {
        name: "Bandwidth by category",
        description: "Identify which URL categories consume the most bandwidth",
        fieldsUsed: ["url_category", "bytes"],
        logic: "GROUP BY url_category | STATS sum(bytes) | SORT bytes DESC",
      },
      {
        name: "Top visited domains",
        description: "Most frequently accessed websites",
        fieldsUsed: ["url", "srcuser"],
        logic: "GROUP BY url_domain | STATS count() | SORT count DESC | LIMIT 20",
      },
    ],
    security: [
      {
        name: "Blocked URL monitoring",
        description: "Monitor attempts to access blocked categories",
        fieldsUsed: ["srcuser", "url", "url_category", "action"],
        logic: "action IN ('block-url', 'block-continue') | GROUP BY srcuser, url_category",
      },
      {
        name: "Malware site detection",
        description: "Track access attempts to known malware sites",
        fieldsUsed: ["url", "url_category", "srcuser", "action"],
        logic: "url_category IN ('malware', 'phishing', 'command-and-control')",
      },
      {
        name: "Shadow IT discovery",
        description: "Identify unauthorized cloud services and applications",
        fieldsUsed: ["url", "url_category", "srcuser"],
        logic: "url_category IN ('online-storage-and-backup', 'personal-sites-and-blogs', 'web-based-email')",
      },
      {
        name: "Data exfiltration via web",
        description: "Detect potential data uploads to suspicious sites",
        fieldsUsed: ["url", "http_method", "content_type", "srcuser"],
        logic: "http_method='POST' AND url_category IN ('unknown', 'personal-sites-and-blogs')",
      },
      {
        name: "Policy bypass attempts",
        description: "Users trying to bypass URL filtering",
        fieldsUsed: ["srcuser", "url_category", "action"],
        logic: "url_category IN ('proxy-avoidance-and-anonymizers', 'web-advertisements') OR action='block-override'",
      },
    ],
    business: [
      {
        name: "Productivity analysis",
        description: "Time spent on non-work websites",
        fieldsUsed: ["srcuser", "url_category", "time_generated"],
        logic: "url_category IN ('social-networking', 'streaming-media', 'games') | GROUP BY srcuser",
      },
      {
        name: "Compliance reporting",
        description: "Document web access for regulatory compliance",
        fieldsUsed: ["srcuser", "url", "url_category", "action", "time_generated"],
      },
      {
        name: "Acceptable use policy violations",
        description: "Track violations of corporate AUP",
        fieldsUsed: ["srcuser", "url_category", "action"],
        logic: "url_category IN (blocked_categories) AND action='alert'",
      },
    ],
  },
  troubleshooting: [
    {
      problem: "URL filtering logs not being generated",
      causes: [
        "URL Filtering profile not applied to security rules",
        "URL Filtering license expired",
        "PAN-DB cloud connectivity issues",
      ],
      solutions: [
        "Verify URL Filtering profile is attached to security rules",
        "Check license status: request license info",
        "Test PAN-DB connectivity: test url-info-cloud",
        "Verify cloud connectivity: show system setting ssl-decrypt",
      ],
    },
    {
      problem: "URLs categorized as 'unknown'",
      causes: [
        "New or obscure website not in PAN-DB",
        "Custom internal URLs",
        "Encrypted SNI hiding hostname",
      ],
      solutions: [
        "Request URL categorization via Palo Alto Test-A-Site",
        "Create custom URL categories for internal sites",
        "Enable SSL decryption for better URL visibility",
        "Use EDL (External Dynamic List) for custom categorization",
      ],
    },
    {
      problem: "Too many logs generated",
      causes: [
        "Logging all URL categories including benign traffic",
        "Container page logging enabled",
        "High volume users",
      ],
      solutions: [
        "Configure log forwarding to only forward blocked or alert actions",
        "Enable log-container-page-only to reduce noise",
        "Use log suppression for repeated entries",
      ],
    },
    {
      problem: "User information missing in logs",
      causes: [
        "User-ID not enabled on source zone",
        "User not authenticated",
        "Group mapping not configured",
      ],
      solutions: [
        "Enable User-ID on source zone",
        "Verify User-ID agent connectivity: show user user-id-agent state all",
        "Check group mapping: show user group list",
      ],
    },
  ],
  testedOn: [
    {
      version: "11.1.0",
      os: "PAN-OS",
      testedBy: "admin",
      testedAt: "2026-01-02",
    },
    {
      version: "10.2.4",
      os: "PAN-OS",
      testedBy: "admin",
      testedAt: "2026-01-02",
    },
  ],
  contribution: {
    createdAt: "2026-01-02",
    createdBy: "admin",
    updatedAt: "2026-01-02",
    updatedBy: "admin",
    contributors: ["admin"],
    validated: false,
  },
};

export const logTypes: LogType[] = [paloaltoTrafficLog, paloaltoThreatLog, paloaltoUrlLog];
