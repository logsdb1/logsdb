import { Technology, LogType } from "@/types";

export const windows: Technology = {
  id: "windows",
  name: "Windows",
  description: "Windows Event Logs for security, system, and application events",
  vendor: "Microsoft",
  openSource: false,
  officialDocs: "https://docs.microsoft.com/en-us/windows/security/threat-protection/auditing/",
  logo: "/logos/windows.svg",
  categories: ["Operating System"],
  logTypes: [
    {
      id: "security",
      name: "Security Event Log",
      description: "Authentication, authorization, and security audit events",
      defaultPath: "Windows Event Log",
    },
    {
      id: "4624",
      name: "Event ID 4624 - Successful Logon",
      description: "Successful authentication events with logon type, authentication method, and session details",
      defaultPath: "Windows Event Log > Security",
    },
    {
      id: "4625",
      name: "Event ID 4625 - Failed Logon",
      description: "Failed authentication attempts with detailed failure reasons and status codes",
      defaultPath: "Windows Event Log > Security",
    },
    {
      id: "system",
      name: "System Event Log",
      description: "System component events, drivers, and services",
      defaultPath: "Windows Event Log",
    },
    {
      id: "application",
      name: "Application Event Log",
      description: "Application-specific events",
      defaultPath: "Windows Event Log",
    },
  ],
  defaultPaths: {
    eventlog: "Event Viewer > Windows Logs",
    evtx: "C:\\Windows\\System32\\winevt\\Logs\\",
  },
  contribution: {
    createdAt: "2024-02-15",
    createdBy: "admin",
    updatedAt: "2025-12-15",
    updatedBy: "windows_expert",
    contributors: ["admin", "windows_expert"],
    validated: true,
  },
};

export const windowsSecurityLog: LogType = {
  id: "security",
  technologyId: "windows",
  name: "Security Event Log",
  description: "Authentication, authorization, and security audit events including logons, privilege use, and policy changes",
  quickFacts: {
    defaultPathLinux: "N/A",
    defaultFormat: "Windows Event Log (EVTX)",
    jsonNative: false,
    rotation: "Windows Event Log settings",
  },
  paths: {
    windows: [
      {
        variant: "Event Viewer",
        path: "Event Viewer > Windows Logs > Security",
      },
      {
        variant: "File Path",
        path: "C:\\Windows\\System32\\winevt\\Logs\\Security.evtx",
      },
    ],
  },
  formats: [
    {
      id: "evtx",
      name: "Windows Event Log Format",
      isDefault: true,
      structure: "XML-based binary format with structured fields",
      example: `Event ID: 4624
Log Name: Security
Source: Microsoft-Windows-Security-Auditing
Date: 12/20/2025 2:32:18 PM
Task Category: Logon
Level: Information
User: DOMAIN\\admin
Computer: WORKSTATION01
Description: An account was successfully logged on.`,
    },
    {
      id: "json",
      name: "JSON (via log forwarder)",
      isDefault: false,
      structure: "Structured JSON from Winlogbeat, NXLog, or similar",
      example: `{"event_id":4624,"log_name":"Security","source":"Microsoft-Windows-Security-Auditing","timestamp":"2025-12-20T14:32:18.000Z","user":"DOMAIN\\\\admin","computer":"WORKSTATION01","logon_type":10}`,
    },
  ],
  fields: [
    {
      name: "EventID",
      type: "integer",
      description: "Unique identifier for the event type",
      example: 4624,
    },
    {
      name: "TimeCreated",
      type: "datetime",
      description: "When the event was generated",
      example: "2025-12-20T14:32:18.123Z",
    },
    {
      name: "Computer",
      type: "string",
      description: "Computer name where event occurred",
      example: "WORKSTATION01",
    },
    {
      name: "SubjectUserName",
      type: "string",
      description: "Account name that performed the action",
      example: "admin",
    },
    {
      name: "SubjectDomainName",
      type: "string",
      description: "Domain of the subject account",
      example: "DOMAIN",
    },
    {
      name: "TargetUserName",
      type: "string",
      description: "Account name that is the target of the action",
      example: "user1",
    },
    {
      name: "LogonType",
      type: "integer",
      description: "Type of logon (2=Interactive, 3=Network, 10=RemoteInteractive)",
      example: 10,
      enum: ["2", "3", "4", "5", "7", "8", "9", "10", "11"],
    },
    {
      name: "IpAddress",
      type: "ip",
      description: "Source IP address for network logons",
      example: "192.168.1.100",
    },
    {
      name: "IpPort",
      type: "integer",
      description: "Source port for network logons",
      example: 54321,
    },
    {
      name: "WorkstationName",
      type: "string",
      description: "Source workstation name",
      example: "CLIENT01",
    },
    {
      name: "ProcessName",
      type: "string",
      description: "Process that initiated the event",
      example: "C:\\Windows\\System32\\lsass.exe",
    },
  ],
  parsing: {
    examples: {
      winlogbeat: `winlogbeat.event_logs:
  - name: Security
    event_id: 4624, 4625, 4648, 4672, 4720, 4732
    processors:
      - drop_event.when.not.or:
        - equals.winlog.event_id: 4624
        - equals.winlog.event_id: 4625
        - equals.winlog.event_id: 4648`,
      nxlog: `<Input eventlog>
    Module im_msvistalog
    Query <QueryList>\\
        <Query Id="0">\\
            <Select Path="Security">*[System[(EventID=4624 or EventID=4625 or EventID=4648)]]</Select>\\
        </Query>\\
    </QueryList>
</Input>`,
      powershell: `Get-WinEvent -FilterHashtable @{
    LogName='Security'
    ID=4624,4625,4648
    StartTime=(Get-Date).AddHours(-24)
} | Select-Object TimeCreated, Id, Message`,
      wef: `# Windows Event Forwarding subscription
wecutil cs subscription.xml

# subscription.xml content:
<Subscription>
  <SubscriptionId>Security-Events</SubscriptionId>
  <Query>
    <![CDATA[
      <QueryList>
        <Query Path="Security">
          <Select>*[System[(EventID=4624 or EventID=4625)]]</Select>
        </Query>
      </QueryList>
    ]]>
  </Query>
</Subscription>`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable via Group Policy or Local Security Policy",
      example: `# Enable via auditpol
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Logoff" /success:enable
auditpol /set /subcategory:"Special Logon" /success:enable`,
    },
  },
  useCases: {
    operational: [
      {
        name: "User login tracking",
        description: "Monitor successful and failed logons",
        fieldsUsed: ["EventID", "TargetUserName", "IpAddress"],
      },
    ],
    security: [
      {
        name: "Brute force detection",
        description: "Multiple failed logons (4625)",
        fieldsUsed: ["EventID", "TargetUserName", "IpAddress"],
        logic: "EventID=4625 COUNT BY IpAddress WHERE count > 5 IN 5min",
      },
      {
        name: "Pass-the-hash detection",
        description: "NTLM logons without interactive logon",
        fieldsUsed: ["EventID", "LogonType", "AuthenticationPackage"],
        logic: "EventID=4624 AND LogonType=3 AND AuthenticationPackage=NTLM",
      },
      {
        name: "Privilege escalation",
        description: "Special privileges assigned (4672)",
        fieldsUsed: ["EventID", "SubjectUserName", "PrivilegeList"],
        logic: "EventID=4672",
      },
      {
        name: "Account creation",
        description: "New user accounts created (4720)",
        fieldsUsed: ["EventID", "TargetUserName", "SubjectUserName"],
        logic: "EventID=4720",
      },
      {
        name: "Group membership changes",
        description: "Users added to privileged groups (4732)",
        fieldsUsed: ["EventID", "TargetUserName", "GroupName"],
        logic: "EventID=4732 AND GroupName IN ('Administrators', 'Domain Admins')",
      },
    ],
    business: [
      {
        name: "Login hours analysis",
        description: "When users typically log in",
        fieldsUsed: ["EventID", "TimeCreated", "TargetUserName"],
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Event ID 4625 not appearing",
      causes: ["Audit policy not enabled", "Log full and overwriting"],
      solutions: [
        "Enable audit policy: auditpol /set /subcategory:\"Logon\" /failure:enable",
        "Check log size: wevtutil gl Security",
        "Increase log size in Event Viewer properties",
      ],
    },
    {
      problem: "Too many events to process",
      causes: ["Service account noise", "Health check logons"],
      solutions: [
        "Filter out service accounts in your SIEM",
        "Use targeted event subscriptions",
        "Exclude known machine accounts",
      ],
    },
  ],
  testedOn: [
    {
      version: "Windows Server 2022",
      os: "Windows Server 2022",
      testedBy: "windows_expert",
      testedAt: "2025-12-15",
    },
    {
      version: "Windows 11 23H2",
      os: "Windows 11",
      testedBy: "admin",
      testedAt: "2025-12-10",
    },
  ],
  contribution: {
    createdAt: "2024-02-15",
    createdBy: "admin",
    updatedAt: "2025-12-15",
    updatedBy: "windows_expert",
    contributors: ["admin", "windows_expert", "security_analyst"],
    upvotes: 312,
    downvotes: 5,
    validated: true,
    commentsCount: 18,
  },
};

export const windowsEvent4624: LogType = {
  id: "4624",
  technologyId: "windows",
  name: "Event ID 4624 - Successful Logon",
  description: "Records successful authentication events to Windows systems, including the logon type, authentication package, source IP, and elevated privileges. Essential for tracking user access, detecting lateral movement, and identifying anomalous authentication patterns",
  quickFacts: {
    defaultPathLinux: "N/A (Windows Event Forwarding to SIEM)",
    defaultFormat: "Windows Event Log (EVTX)",
    jsonNative: false,
    rotation: "Windows Event Log settings (default 20MB)",
  },
  paths: {
    windows: [
      {
        variant: "Event Viewer",
        path: "Event Viewer > Windows Logs > Security > Filter by Event ID 4624",
      },
      {
        variant: "File Path",
        path: "C:\\Windows\\System32\\winevt\\Logs\\Security.evtx",
      },
      {
        variant: "PowerShell",
        path: "Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624}",
      },
    ],
    cloud: [
      {
        provider: "Microsoft Sentinel",
        path: "SecurityEvent | where EventID == 4624",
      },
      {
        provider: "Microsoft Defender for Identity",
        path: "Advanced Hunting > IdentityLogonEvents | where ActionType == 'LogonSuccess'",
      },
    ],
  },
  formats: [
    {
      id: "evtx",
      name: "Windows Event Log Format",
      isDefault: true,
      structure: "XML-based binary format with structured EventData fields",
      example: `Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/3/2026 10:15:32 AM
Event ID:      4624
Task Category: Logon
Level:         Information
Keywords:      Audit Success
User:          N/A
Computer:      DC01.corp.local
Description:
An account was successfully logged on.

Subject:
    Security ID:        S-1-5-18
    Account Name:       DC01$
    Account Domain:     CORP
    Logon ID:           0x3E7

Logon Information:
    Logon Type:         3
    Restricted Admin Mode: -
    Virtual Account:    No
    Elevated Token:     Yes

Impersonation Level:    Impersonation

New Logon:
    Security ID:        S-1-5-21-1234567890-1234567890-1234567890-1001
    Account Name:       jsmith
    Account Domain:     CORP
    Logon ID:           0x12345678
    Linked Logon ID:    0x0
    Network Account Name: -
    Network Account Domain: -
    Logon GUID:         {00000000-0000-0000-0000-000000000000}

Process Information:
    Process ID:         0x0
    Process Name:       -

Network Information:
    Workstation Name:   CLIENT01
    Source Network Address: 192.168.1.100
    Source Port:        49152

Detailed Authentication Information:
    Logon Process:      NtLmSsp
    Authentication Package: NTLM
    Transited Services: -
    Package Name (NTLM only): NTLM V2
    Key Length:         128`,
    },
    {
      id: "xml",
      name: "XML Format",
      isDefault: false,
      structure: "Native XML representation of the event",
      example: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Security-Auditing" Guid="{54849625-5478-4994-A5BA-3E3B0328C30D}"/>
    <EventID>4624</EventID>
    <Version>2</Version>
    <Level>0</Level>
    <Task>12544</Task>
    <Opcode>0</Opcode>
    <Keywords>0x8020000000000000</Keywords>
    <TimeCreated SystemTime="2026-01-03T10:15:32.123456789Z"/>
    <EventRecordID>123456</EventRecordID>
    <Computer>DC01.corp.local</Computer>
  </System>
  <EventData>
    <Data Name="SubjectUserSid">S-1-5-18</Data>
    <Data Name="SubjectUserName">DC01$</Data>
    <Data Name="SubjectDomainName">CORP</Data>
    <Data Name="SubjectLogonId">0x3e7</Data>
    <Data Name="TargetUserSid">S-1-5-21-1234567890-1234567890-1234567890-1001</Data>
    <Data Name="TargetUserName">jsmith</Data>
    <Data Name="TargetDomainName">CORP</Data>
    <Data Name="TargetLogonId">0x12345678</Data>
    <Data Name="LogonType">3</Data>
    <Data Name="LogonProcessName">NtLmSsp</Data>
    <Data Name="AuthenticationPackageName">NTLM</Data>
    <Data Name="WorkstationName">CLIENT01</Data>
    <Data Name="LogonGuid">{00000000-0000-0000-0000-000000000000}</Data>
    <Data Name="TransmittedServices">-</Data>
    <Data Name="LmPackageName">NTLM V2</Data>
    <Data Name="KeyLength">128</Data>
    <Data Name="ProcessId">0x0</Data>
    <Data Name="ProcessName">-</Data>
    <Data Name="IpAddress">192.168.1.100</Data>
    <Data Name="IpPort">49152</Data>
    <Data Name="ImpersonationLevel">%%1833</Data>
    <Data Name="ElevatedToken">%%1842</Data>
    <Data Name="VirtualAccount">%%1843</Data>
  </EventData>
</Event>`,
    },
    {
      id: "json",
      name: "JSON (Winlogbeat/NXLog)",
      isDefault: false,
      structure: "Structured JSON from log forwarders",
      example: `{
  "event_id": 4624,
  "log_name": "Security",
  "source_name": "Microsoft-Windows-Security-Auditing",
  "computer_name": "DC01.corp.local",
  "time_created": "2026-01-03T10:15:32.123Z",
  "keywords": ["Audit Success"],
  "event_data": {
    "SubjectUserSid": "S-1-5-18",
    "SubjectUserName": "DC01$",
    "SubjectDomainName": "CORP",
    "TargetUserSid": "S-1-5-21-1234567890-1234567890-1234567890-1001",
    "TargetUserName": "jsmith",
    "TargetDomainName": "CORP",
    "TargetLogonId": "0x12345678",
    "LogonType": "3",
    "LogonProcessName": "NtLmSsp",
    "AuthenticationPackageName": "NTLM",
    "WorkstationName": "CLIENT01",
    "IpAddress": "192.168.1.100",
    "IpPort": "49152",
    "LmPackageName": "NTLM V2",
    "KeyLength": "128",
    "ElevatedToken": "%%1842",
    "ImpersonationLevel": "%%1833"
  }
}`,
    },
  ],
  fields: [
    {
      name: "EventID",
      type: "integer",
      description: "Event identifier (always 4624 for successful logon)",
      example: 4624,
    },
    {
      name: "TimeCreated",
      type: "datetime",
      description: "Timestamp when the successful logon occurred",
      example: "2026-01-03T10:15:32.123Z",
    },
    {
      name: "Computer",
      type: "string",
      description: "Computer name where the logon occurred",
      example: "DC01.corp.local",
    },
    {
      name: "SubjectUserSid",
      type: "string",
      description: "SID of the account that initiated the logon (machine account for network logons)",
      example: "S-1-5-18",
    },
    {
      name: "SubjectUserName",
      type: "string",
      description: "Account name that initiated the logon process",
      example: "DC01$",
    },
    {
      name: "SubjectDomainName",
      type: "string",
      description: "Domain of the subject account",
      example: "CORP",
    },
    {
      name: "SubjectLogonId",
      type: "string",
      description: "Logon ID of the subject session (for correlation)",
      example: "0x3E7",
    },
    {
      name: "TargetUserSid",
      type: "string",
      description: "SID of the account that logged on",
      example: "S-1-5-21-1234567890-1234567890-1234567890-1001",
    },
    {
      name: "TargetUserName",
      type: "string",
      description: "Account name that logged on - the actual user identity",
      example: "jsmith",
    },
    {
      name: "TargetDomainName",
      type: "string",
      description: "Domain of the account that logged on",
      example: "CORP",
    },
    {
      name: "TargetLogonId",
      type: "string",
      description: "Logon ID for the new session - use for correlating with other events",
      example: "0x12345678",
    },
    {
      name: "LogonType",
      type: "integer",
      description: "Type of logon that was performed",
      example: 3,
      enum: [
        "2 - Interactive (local console logon)",
        "3 - Network (SMB, mapped drives, WinRM, remote registry)",
        "4 - Batch (scheduled tasks)",
        "5 - Service (service startup)",
        "7 - Unlock (workstation unlock)",
        "8 - NetworkCleartext (IIS basic auth, PowerShell with CredSSP)",
        "9 - NewCredentials (RunAs /netonly, cloned token)",
        "10 - RemoteInteractive (RDP, Remote Assistance)",
        "11 - CachedInteractive (cached domain credentials)",
        "12 - CachedRemoteInteractive (cached RDP credentials)",
        "13 - CachedUnlock (cached credentials for unlock)",
      ],
    },
    {
      name: "LogonProcessName",
      type: "string",
      description: "Name of the trusted logon process",
      example: "NtLmSsp",
      enum: ["NtLmSsp", "Kerberos", "User32", "Advapi", "Schannel", "Negotiate", "seclogo"],
    },
    {
      name: "AuthenticationPackageName",
      type: "string",
      description: "Authentication package used for the logon",
      example: "NTLM",
      enum: ["NTLM", "Kerberos", "Negotiate", "Microsoft_Authentication_Package_V1_0", "CloudAP"],
    },
    {
      name: "WorkstationName",
      type: "string",
      description: "NetBIOS name of the source workstation",
      example: "CLIENT01",
    },
    {
      name: "LogonGuid",
      type: "string",
      description: "GUID for Kerberos logons - can correlate with DC events",
      example: "{F85484B2-7F9D-1234-ABCD-0123456789AB}",
    },
    {
      name: "TransmittedServices",
      type: "string",
      description: "List of SPNs for S4U (Service for User) delegation",
      example: "HTTP/webserver.corp.local",
    },
    {
      name: "LmPackageName",
      type: "string",
      description: "NTLM version used (only for NTLM authentication)",
      example: "NTLM V2",
      enum: ["NTLM V1", "NTLM V2", "LM", "-"],
    },
    {
      name: "KeyLength",
      type: "integer",
      description: "Length of the session key in bits (0 for Kerberos)",
      example: 128,
    },
    {
      name: "IpAddress",
      type: "ip",
      description: "Source IP address of the logon (for network logons)",
      example: "192.168.1.100",
    },
    {
      name: "IpPort",
      type: "integer",
      description: "Source port of the logon connection",
      example: 49152,
    },
    {
      name: "ImpersonationLevel",
      type: "string",
      description: "Impersonation level of the new logon session",
      example: "%%1833",
      enum: [
        "%%1832 - Identification (can query identity only)",
        "%%1833 - Impersonation (can impersonate locally)",
        "%%1834 - Delegation (can impersonate over network)",
        "%%1840 - Anonymous",
      ],
    },
    {
      name: "ElevatedToken",
      type: "string",
      description: "Whether the logon created an elevated token (admin privileges)",
      example: "%%1842",
      enum: ["%%1842 - Yes (elevated)", "%%1843 - No (standard)"],
    },
    {
      name: "VirtualAccount",
      type: "string",
      description: "Whether a virtual account was used (managed service accounts)",
      example: "%%1843",
      enum: ["%%1842 - Yes", "%%1843 - No"],
    },
    {
      name: "RestrictedAdminMode",
      type: "string",
      description: "Whether Restricted Admin mode was used (RDP without credential caching)",
      example: "-",
      enum: ["Yes", "No", "-"],
    },
    {
      name: "ProcessId",
      type: "string",
      description: "Process ID that initiated the logon (hex)",
      example: "0x4",
    },
    {
      name: "ProcessName",
      type: "string",
      description: "Full path of the process that initiated the logon",
      example: "C:\\Windows\\System32\\svchost.exe",
    },
    {
      name: "LinkedLogonId",
      type: "string",
      description: "Logon ID of linked logon session (for UAC split token)",
      example: "0x12345670",
    },
  ],
  parsing: {
    grok: {
      xml: `<Data Name="TargetUserName">%{DATA:target_username}</Data>.*<Data Name="TargetDomainName">%{DATA:target_domain}</Data>.*<Data Name="TargetLogonId">%{DATA:logon_id}</Data>.*<Data Name="LogonType">%{INT:logon_type}</Data>.*<Data Name="IpAddress">%{IP:src_ip}</Data>`,
    },
    regex: {
      xml: `TargetUserName">(?P<target_username>[^<]+)</Data>.*TargetDomainName">(?P<target_domain>[^<]+)</Data>.*TargetLogonId">(?P<logon_id>[^<]+)</Data>.*LogonType">(?P<logon_type>\\d+)</Data>.*IpAddress">(?P<src_ip>[^<]+)</Data>`,
    },
    examples: {
      splunk: `# Splunk search for Event ID 4624
index=wineventlog EventCode=4624
| stats count by TargetUserName, IpAddress, LogonType, AuthenticationPackageName
| sort -count

# Exclude noisy machine account logons
index=wineventlog EventCode=4624 NOT TargetUserName="*$"
| stats count by TargetUserName, Computer, LogonType

# RDP logons (LogonType 10)
index=wineventlog EventCode=4624 LogonType=10
| table _time, Computer, TargetUserName, IpAddress, AuthenticationPackageName

# Detect pass-the-hash (NTLM network logon without prior interactive)
index=wineventlog EventCode=4624 LogonType=3 AuthenticationPackageName=NTLM
| search NOT [search index=wineventlog EventCode=4624 LogonType=2 | dedup TargetUserName | fields TargetUserName]
| stats count by TargetUserName, IpAddress, Computer

# Logons with elevated tokens (admin sessions)
index=wineventlog EventCode=4624 ElevatedToken="%%1842"
| stats count by TargetUserName, Computer, LogonType

# Track lateral movement (network logons from internal IPs)
index=wineventlog EventCode=4624 LogonType=3
| where cidrmatch("10.0.0.0/8", IpAddress) OR cidrmatch("192.168.0.0/16", IpAddress)
| stats dc(Computer) as systems_accessed by TargetUserName, IpAddress
| where systems_accessed > 3

# props.conf for Windows Security Events
[WinEventLog:Security]
TIME_FORMAT = %Y-%m-%dT%H:%M:%S
TIME_PREFIX = TimeCreated SystemTime='
SHOULD_LINEMERGE = false
KV_MODE = xml`,
      logstash: `input {
  beats {
    port => 5044
  }
}

filter {
  if [winlog][event_id] == 4624 {
    mutate {
      add_tag => ["successful_logon", "authentication"]
    }

    # Parse LogonType to human-readable
    translate {
      field => "[winlog][event_data][LogonType]"
      destination => "[logon_type_name]"
      dictionary => {
        "2" => "Interactive"
        "3" => "Network"
        "4" => "Batch"
        "5" => "Service"
        "7" => "Unlock"
        "8" => "NetworkCleartext"
        "9" => "NewCredentials"
        "10" => "RemoteInteractive"
        "11" => "CachedInteractive"
      }
      fallback => "Unknown"
    }

    # Parse ElevatedToken
    translate {
      field => "[winlog][event_data][ElevatedToken]"
      destination => "[elevated_session]"
      dictionary => {
        "%%1842" => "Yes"
        "%%1843" => "No"
      }
    }

    # Filter out machine accounts (ending with $)
    if [winlog][event_data][TargetUserName] =~ /\$$/ {
      mutate {
        add_tag => ["machine_account"]
      }
    }

    # GeoIP enrichment for network logons
    if [winlog][event_data][IpAddress] and [winlog][event_data][IpAddress] != "-" and [winlog][event_data][IpAddress] != "127.0.0.1" {
      geoip {
        source => "[winlog][event_data][IpAddress]"
        target => "source_geo"
      }
    }
  }
}

output {
  if "successful_logon" in [tags] {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "windows-logons-%{+YYYY.MM.dd}"
    }
  }
}`,
      sigma: `title: Successful Logon from Unusual Location
id: 7a8f5d2c-3e4b-4f5a-8c9d-1a2b3c4d5e6f
status: experimental
description: Detects successful logons from IP addresses outside normal ranges
author: Security Team
date: 2026/01/03
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4624
        LogonType:
            - 3
            - 10
    filter:
        IpAddress|startswith:
            - '10.'
            - '192.168.'
            - '172.16.'
    condition: selection and not filter
falsepositives:
    - VPN users
    - Remote workers
level: medium
tags:
    - attack.initial_access
    - attack.t1078

---
title: Pass-the-Hash Detection via NTLM Network Logon
id: 8b9c6d3e-4f5a-6b7c-8d9e-2a3b4c5d6e7f
status: stable
description: Detects potential pass-the-hash by identifying NTLM network logons to sensitive systems
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4624
        LogonType: 3
        AuthenticationPackageName: 'NTLM'
    filter_machine:
        TargetUserName|endswith: '$'
    condition: selection and not filter_machine
level: medium
tags:
    - attack.lateral_movement
    - attack.t1550.002

---
title: Multiple Successful Logons to Different Hosts
id: 9c0d7e4f-5a6b-7c8d-9e0f-3b4c5d6e7f8a
status: experimental
description: Detects a single account logging into many systems in short time (lateral movement)
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4624
        LogonType: 3
    filter_machine:
        TargetUserName|endswith: '$'
    timeframe: 15m
    condition: selection and not filter_machine | count(Computer) by TargetUserName > 5
level: high
tags:
    - attack.lateral_movement
    - attack.t1021`,
      winlogbeat: `winlogbeat.event_logs:
  - name: Security
    event_id: 4624
    processors:
      # Filter out noisy machine account logons
      - drop_event:
          when:
            regexp:
              winlog.event_data.TargetUserName: '.*\\$'
      # Add logon type name
      - script:
          lang: javascript
          source: >
            function process(event) {
              var logonType = event.Get("winlog.event_data.LogonType");
              var logonTypeMap = {
                "2": "Interactive",
                "3": "Network",
                "4": "Batch",
                "5": "Service",
                "7": "Unlock",
                "8": "NetworkCleartext",
                "9": "NewCredentials",
                "10": "RemoteInteractive",
                "11": "CachedInteractive"
              };
              if (logonType && logonTypeMap[logonType]) {
                event.Put("logon_type_name", logonTypeMap[logonType]);
              }
              var elevated = event.Get("winlog.event_data.ElevatedToken");
              event.Put("elevated_session", elevated === "%%1842" ? "Yes" : "No");
            }

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "winlogbeat-logons-%{+yyyy.MM.dd}"`,
      powershell: `# Get successful logons in last 24 hours (excluding machine accounts)
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    ID = 4624
    StartTime = (Get-Date).AddHours(-24)
} | ForEach-Object {
    $xml = [xml]$_.ToXml()
    $targetUser = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'TargetUserName'}).'#text'
    if ($targetUser -notmatch '\\$$') {
        [PSCustomObject]@{
            TimeCreated = $_.TimeCreated
            TargetUser = $targetUser
            TargetDomain = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'TargetDomainName'}).'#text'
            LogonType = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'LogonType'}).'#text'
            SourceIP = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'IpAddress'}).'#text'
            Workstation = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'WorkstationName'}).'#text'
            AuthPackage = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'AuthenticationPackageName'}).'#text'
            Elevated = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'ElevatedToken'}).'#text'
            Computer = $_.MachineName
        }
    }
} | Export-Csv -Path "C:\\Logs\\SuccessfulLogons.csv" -NoTypeInformation

# Find RDP logons
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624} -MaxEvents 1000 |
    Where-Object {
        $xml = [xml]$_.ToXml()
        ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'LogonType'}).'#text' -eq '10'
    } | ForEach-Object {
        $xml = [xml]$_.ToXml()
        [PSCustomObject]@{
            Time = $_.TimeCreated
            User = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'TargetUserName'}).'#text'
            SourceIP = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'IpAddress'}).'#text'
            Computer = $_.MachineName
        }
    }

# Count logons per user per system (lateral movement detection)
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4624;StartTime=(Get-Date).AddHours(-1)} |
    ForEach-Object {
        $xml = [xml]$_.ToXml()
        $user = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'TargetUserName'}).'#text'
        $logonType = ($xml.Event.EventData.Data | Where-Object {$_.Name -eq 'LogonType'}).'#text'
        if ($user -notmatch '\\$$' -and $logonType -eq '3') {
            "$user|$($_.MachineName)"
        }
    } | Group-Object | Where-Object { $_.Count -gt 1 } | Sort-Object Count -Descending`,
      qradar: `# QRadar AQL for Event ID 4624
SELECT
    DATEFORMAT(starttime, 'yyyy-MM-dd HH:mm:ss') as Time,
    sourceip as "Source IP",
    LOGSOURCENAME(logsourceid) as "Log Source",
    "TargetUserName" as "User",
    "TargetDomainName" as "Domain",
    "LogonType" as "Logon Type",
    "AuthenticationPackageName" as "Auth Package",
    "WorkstationName" as "Source Host"
FROM events
WHERE LOGSOURCETYPENAME(devicetype) = 'Microsoft Windows Security Event Log'
AND "EventID" = '4624'
AND "TargetUserName" NOT LIKE '%$'
LAST 24 HOURS

# RDP Sessions
SELECT
    DATEFORMAT(starttime, 'yyyy-MM-dd HH:mm:ss') as Time,
    sourceip as "Source IP",
    "TargetUserName" as "User",
    "Computer" as "Destination"
FROM events
WHERE "EventID" = '4624'
AND "LogonType" = '10'
LAST 7 DAYS

# Lateral movement detection rule
# Rule: User Accessing Multiple Systems via Network Logon
# Test: when the destination host count >= 5
# Group by: Username
# Time window: 15 minutes
# Filter: LogonType = 3 AND NOT TargetUserName LIKE '%$'`,
      sentinel: `// Microsoft Sentinel KQL - Successful Logons
SecurityEvent
| where EventID == 4624
| where TargetUserName !endswith "$"  // Exclude machine accounts
| extend LogonTypeName = case(
    LogonType == 2, "Interactive",
    LogonType == 3, "Network",
    LogonType == 4, "Batch",
    LogonType == 5, "Service",
    LogonType == 7, "Unlock",
    LogonType == 8, "NetworkCleartext",
    LogonType == 9, "NewCredentials",
    LogonType == 10, "RemoteInteractive (RDP)",
    LogonType == 11, "CachedInteractive",
    "Other")
| project TimeGenerated, Computer, TargetUserName, TargetDomainName, LogonType, LogonTypeName, IpAddress, WorkstationName, AuthenticationPackageName
| order by TimeGenerated desc

// RDP Logon tracking
SecurityEvent
| where EventID == 4624
| where LogonType == 10
| where TargetUserName !endswith "$"
| project TimeGenerated, Computer, TargetUserName, IpAddress, WorkstationName
| summarize RDPSessions = count(), FirstSeen = min(TimeGenerated), LastSeen = max(TimeGenerated) by TargetUserName, Computer, IpAddress

// Lateral movement detection - user accessing multiple systems
SecurityEvent
| where EventID == 4624
| where LogonType == 3
| where TargetUserName !endswith "$"
| where TimeGenerated > ago(1h)
| summarize
    SystemsAccessed = dcount(Computer),
    Systems = make_set(Computer),
    SourceIPs = make_set(IpAddress)
    by TargetUserName, bin(TimeGenerated, 15m)
| where SystemsAccessed > 5
| project TimeGenerated, TargetUserName, SystemsAccessed, Systems, SourceIPs

// Pass-the-Hash detection - NTLM network logons
SecurityEvent
| where EventID == 4624
| where LogonType == 3
| where AuthenticationPackageName == "NTLM"
| where TargetUserName !endswith "$"
| where TimeGenerated > ago(24h)
| summarize
    LogonCount = count(),
    Computers = make_set(Computer),
    SourceIPs = make_set(IpAddress)
    by TargetUserName
| where LogonCount > 10

// Elevated sessions (admin logons)
SecurityEvent
| where EventID == 4624
| where ElevatedToken == "%%1842"
| where TargetUserName !endswith "$"
| project TimeGenerated, Computer, TargetUserName, LogonType, IpAddress
| summarize AdminLogons = count() by TargetUserName, Computer, bin(TimeGenerated, 1h)

// First time logon from new IP (anomaly)
let known_ips = SecurityEvent
| where EventID == 4624
| where TimeGenerated between (ago(30d) .. ago(1d))
| where TargetUserName !endswith "$"
| summarize by TargetUserName, IpAddress;
SecurityEvent
| where EventID == 4624
| where TimeGenerated > ago(1d)
| where TargetUserName !endswith "$"
| join kind=leftanti known_ips on TargetUserName, IpAddress
| project TimeGenerated, Computer, TargetUserName, IpAddress, LogonType`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable auditing for successful logon events via Group Policy or auditpol",
      example: `# Enable via auditpol (run as Administrator)
auditpol /set /subcategory:"Logon" /success:enable

# Verify current settings
auditpol /get /subcategory:"Logon"

# Enable via Group Policy
# Computer Configuration > Windows Settings > Security Settings >
# Advanced Audit Policy Configuration > Logon/Logoff > Audit Logon
# Enable "Success"

# Note: Enabling success auditing can generate high volume of events
# Consider filtering at collection time for high-traffic systems

# Enable related subcategories for complete visibility
auditpol /set /subcategory:"Special Logon" /success:enable
auditpol /set /subcategory:"Other Logon/Logoff Events" /success:enable
auditpol /set /subcategory:"Network Policy Server" /success:enable`,
      note: "Success logon auditing generates high volume - filter machine accounts and service logons at collection",
    },
    logToSyslog: {
      description: "Forward events to SIEM using Windows Event Forwarding or agents",
      example: `# Windows Event Forwarding (WEF) subscription for 4624 events
# Filtering to reduce volume - only collect network and RDP logons

<?xml version="1.0" encoding="UTF-8"?>
<Subscription xmlns="http://schemas.microsoft.com/2006/03/windows/events/subscription">
  <SubscriptionId>Successful-Logons-4624</SubscriptionId>
  <SubscriptionType>SourceInitiated</SubscriptionType>
  <Description>Collect network and RDP logon events (4624)</Description>
  <Enabled>true</Enabled>
  <Uri>http://schemas.microsoft.com/wbem/wsman/1/windows/EventLog</Uri>
  <Query>
    <![CDATA[
      <QueryList>
        <Query Id="0" Path="Security">
          <Select Path="Security">
            *[System[(EventID=4624)]]
            and
            *[EventData[Data[@Name='LogonType']='3' or Data[@Name='LogonType']='10']]
          </Select>
          <Suppress Path="Security">
            *[EventData[Data[@Name='TargetUserName'] and (Data[@Name='TargetUserName']='SYSTEM' or Data[@Name='TargetUserName']='ANONYMOUS LOGON')]]
          </Suppress>
        </Query>
      </QueryList>
    ]]>
  </Query>
  <ReadExistingEvents>false</ReadExistingEvents>
  <TransportName>HTTP</TransportName>
  <ContentFormat>Events</ContentFormat>
  <Locale Language="en-US"/>
  <LogFile>ForwardedEvents</LogFile>
  <AllowedSourceNonDomainComputers></AllowedSourceNonDomainComputers>
  <AllowedSourceDomainComputers>O:NSG:NSD:(A;;GA;;;DC)(A;;GA;;;NS)</AllowedSourceDomainComputers>
</Subscription>

# Apply subscription
wecutil cs 4624-subscription.xml`,
    },
  },
  useCases: {
    operational: [
      {
        name: "User activity monitoring",
        description: "Track when and where users log in across the environment",
        fieldsUsed: ["TimeCreated", "TargetUserName", "Computer", "IpAddress", "LogonType"],
        logic: "EventID=4624 AND TargetUserName!='*$' | stats count by TargetUserName, Computer",
      },
      {
        name: "RDP session tracking",
        description: "Monitor Remote Desktop connections for capacity and security",
        fieldsUsed: ["TargetUserName", "Computer", "IpAddress", "LogonType"],
        logic: "EventID=4624 AND LogonType=10 | stats count by TargetUserName, Computer, IpAddress",
      },
      {
        name: "Service account usage",
        description: "Track service account logons to ensure proper usage",
        fieldsUsed: ["TargetUserName", "Computer", "LogonType"],
        logic: "EventID=4624 AND LogonType IN (4, 5) | stats count by TargetUserName, Computer",
      },
      {
        name: "Authentication method analysis",
        description: "Understand which authentication protocols are in use",
        fieldsUsed: ["AuthenticationPackageName", "LmPackageName"],
        logic: "EventID=4624 | stats count by AuthenticationPackageName, LmPackageName",
      },
    ],
    security: [
      {
        name: "Lateral movement detection",
        description: "Detect users accessing multiple systems in short time periods",
        fieldsUsed: ["TargetUserName", "Computer", "IpAddress", "LogonType", "TimeCreated"],
        logic: "EventID=4624 AND LogonType=3 | stats dc(Computer) by TargetUserName within 15m | where dc > 5",
      },
      {
        name: "Pass-the-Hash detection",
        description: "Identify NTLM network logons that may indicate credential theft",
        fieldsUsed: ["TargetUserName", "AuthenticationPackageName", "LogonType", "IpAddress"],
        logic: "EventID=4624 AND LogonType=3 AND AuthenticationPackageName='NTLM' AND TargetUserName!='*$'",
      },
      {
        name: "Anomalous logon location",
        description: "Detect logons from unexpected IP addresses or workstations",
        fieldsUsed: ["TargetUserName", "IpAddress", "WorkstationName"],
        logic: "EventID=4624 | lookup user_baseline | where IpAddress NOT IN baseline_ips",
      },
      {
        name: "Off-hours access detection",
        description: "Monitor logons outside normal business hours",
        fieldsUsed: ["TimeCreated", "TargetUserName", "Computer", "LogonType"],
        logic: "EventID=4624 AND (hour(TimeCreated) < 6 OR hour(TimeCreated) > 20) AND LogonType IN (3, 10)",
      },
      {
        name: "Privileged session monitoring",
        description: "Track logons with elevated tokens (admin access)",
        fieldsUsed: ["TargetUserName", "ElevatedToken", "Computer", "LogonType"],
        logic: "EventID=4624 AND ElevatedToken='%%1842'",
      },
      {
        name: "Kerberos vs NTLM usage",
        description: "Monitor for NTLM usage which should be minimal in modern environments",
        fieldsUsed: ["AuthenticationPackageName", "TargetUserName", "Computer"],
        logic: "EventID=4624 AND AuthenticationPackageName='NTLM' | stats count by TargetUserName, Computer",
      },
      {
        name: "First-time system access",
        description: "Detect users logging into systems they haven't accessed before",
        fieldsUsed: ["TargetUserName", "Computer", "TimeCreated"],
        logic: "EventID=4624 | lookup user_system_history | where NOT previously_seen",
      },
      {
        name: "Impossible travel detection",
        description: "Identify logons from geographically distant locations in short time",
        fieldsUsed: ["TargetUserName", "IpAddress", "TimeCreated"],
        logic: "EventID=4624 | geoip IpAddress | detect_impossible_travel by TargetUserName",
      },
    ],
    business: [
      {
        name: "User login patterns",
        description: "Understand when users typically work for resource planning",
        fieldsUsed: ["TimeCreated", "TargetUserName", "LogonType"],
        logic: "EventID=4624 AND LogonType IN (2, 10) | timechart count by TargetUserName",
      },
      {
        name: "Compliance reporting",
        description: "Document access for audit and regulatory requirements",
        fieldsUsed: ["TimeCreated", "TargetUserName", "Computer", "IpAddress", "LogonType"],
      },
      {
        name: "VDI/Remote work metrics",
        description: "Track remote access usage for capacity planning",
        fieldsUsed: ["LogonType", "TargetUserName", "TimeCreated"],
        logic: "EventID=4624 AND LogonType=10 | stats dc(TargetUserName) as users by bin(TimeCreated, 1h)",
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Too many 4624 events overwhelming SIEM",
      causes: [
        "Machine account logons (accounts ending with $)",
        "Service logons (LogonType 5)",
        "SYSTEM and NETWORK SERVICE logons",
        "Health check/monitoring logons",
      ],
      solutions: [
        "Filter machine accounts: TargetUserName NOT LIKE '%$'",
        "Exclude service logons: LogonType NOT IN (4, 5)",
        "Use WEF queries to filter before forwarding",
        "Only collect network (3) and RDP (10) logons for security monitoring",
        "Aggregate batch/service logons instead of individual events",
      ],
    },
    {
      problem: "Missing network address information",
      causes: [
        "Local logon (LogonType 2, 7, 11)",
        "Service account logon",
        "Logon initiated by local process",
      ],
      solutions: [
        "This is expected for non-network logons",
        "Use WorkstationName as fallback identifier",
        "Correlate with LogonType to understand context",
        "For RDP, ensure NLA is enabled to capture IP earlier",
      ],
    },
    {
      problem: "Cannot correlate logon with user activity",
      causes: [
        "LogonId changes between events",
        "Multiple sessions for same user",
        "Session ended before activity",
      ],
      solutions: [
        "Use TargetLogonId to correlate with subsequent events",
        "Track session with 4624 (logon) and 4634 (logoff) events",
        "Use LogonGuid for Kerberos session correlation with DC",
        "Correlate by user + computer + time window",
      ],
    },
    {
      problem: "Event ID 4624 not appearing",
      causes: [
        "Audit policy not enabled for successful logons",
        "Policy being overridden",
        "Security log full",
      ],
      solutions: [
        "Enable auditing: auditpol /set /subcategory:\"Logon\" /success:enable",
        "Check effective policy: auditpol /get /category:\"Logon/Logoff\"",
        "Verify GPO application: gpresult /h report.html",
        "Check and increase Security log size",
      ],
    },
    {
      problem: "LogonType showing unexpected values",
      causes: [
        "New Windows versions add new logon types",
        "Special authentication scenarios",
      ],
      solutions: [
        "LogonType 12/13 are newer cached remote logon types",
        "Reference Microsoft documentation for your Windows version",
        "Update SIEM parsing rules for new logon types",
      ],
    },
  ],
  testedOn: [
    {
      version: "Windows Server 2022",
      os: "Windows Server 2022",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
    {
      version: "Windows Server 2019",
      os: "Windows Server 2019",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
    {
      version: "Windows 11 23H2",
      os: "Windows 11",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
    {
      version: "Windows 10 22H2",
      os: "Windows 10",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
  ],
  contribution: {
    createdAt: "2026-01-03",
    createdBy: "admin",
    updatedAt: "2026-01-03",
    updatedBy: "admin",
    contributors: ["admin"],
    validated: false,
  },
};

export const windowsEvent4625: LogType = {
  id: "4625",
  technologyId: "windows",
  name: "Event ID 4625 - Failed Logon",
  description: "Records failed authentication attempts to Windows systems, including the failure reason, source IP, logon type, and account information. Critical for detecting brute force attacks, password spraying, and credential stuffing",
  quickFacts: {
    defaultPathLinux: "N/A (Windows Event Forwarding to SIEM)",
    defaultFormat: "Windows Event Log (EVTX)",
    jsonNative: false,
    rotation: "Windows Event Log settings (default 20MB)",
  },
  paths: {
    windows: [
      {
        variant: "Event Viewer",
        path: "Event Viewer > Windows Logs > Security > Filter by Event ID 4625",
      },
      {
        variant: "File Path",
        path: "C:\\Windows\\System32\\winevt\\Logs\\Security.evtx",
      },
      {
        variant: "PowerShell",
        path: "Get-WinEvent -FilterHashtable @{LogName='Security';ID=4625}",
      },
    ],
    cloud: [
      {
        provider: "Microsoft Sentinel",
        path: "SecurityEvent | where EventID == 4625",
      },
      {
        provider: "Microsoft Defender for Identity",
        path: "Advanced Hunting > IdentityLogonEvents | where ActionType == 'LogonFailed'",
      },
    ],
  },
  formats: [
    {
      id: "evtx",
      name: "Windows Event Log Format",
      isDefault: true,
      structure: "XML-based binary format with structured EventData fields",
      example: `Log Name:      Security
Source:        Microsoft-Windows-Security-Auditing
Date:          1/3/2026 10:15:32 AM
Event ID:      4625
Task Category: Logon
Level:         Information
Keywords:      Audit Failure
User:          N/A
Computer:      DC01.corp.local
Description:
An account failed to log on.

Subject:
    Security ID:        S-1-0-0
    Account Name:       -
    Account Domain:     -
    Logon ID:           0x0

Logon Type:            3

Account For Which Logon Failed:
    Security ID:        S-1-0-0
    Account Name:       administrator
    Account Domain:     CORP

Failure Information:
    Failure Reason:     Unknown user name or bad password.
    Status:             0xC000006D
    Sub Status:         0xC000006A

Process Information:
    Caller Process ID:  0x0
    Caller Process Name: -

Network Information:
    Workstation Name:   ATTACKER-PC
    Source Network Address: 192.168.1.50
    Source Port:        49152

Detailed Authentication Information:
    Logon Process:      NtLmSsp
    Authentication Package: NTLM
    Transited Services: -
    Package Name (NTLM only): -
    Key Length:         0`,
    },
    {
      id: "xml",
      name: "XML Format",
      isDefault: false,
      structure: "Native XML representation of the event",
      example: `<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-Security-Auditing" Guid="{54849625-5478-4994-A5BA-3E3B0328C30D}"/>
    <EventID>4625</EventID>
    <Version>0</Version>
    <Level>0</Level>
    <Task>12544</Task>
    <Opcode>0</Opcode>
    <Keywords>0x8010000000000000</Keywords>
    <TimeCreated SystemTime="2026-01-03T10:15:32.123456789Z"/>
    <EventRecordID>123456</EventRecordID>
    <Computer>DC01.corp.local</Computer>
  </System>
  <EventData>
    <Data Name="TargetUserName">administrator</Data>
    <Data Name="TargetDomainName">CORP</Data>
    <Data Name="Status">0xc000006d</Data>
    <Data Name="SubStatus">0xc000006a</Data>
    <Data Name="LogonType">3</Data>
    <Data Name="IpAddress">192.168.1.50</Data>
    <Data Name="IpPort">49152</Data>
    <Data Name="WorkstationName">ATTACKER-PC</Data>
    <Data Name="AuthenticationPackageName">NTLM</Data>
  </EventData>
</Event>`,
    },
    {
      id: "json",
      name: "JSON (Winlogbeat/NXLog)",
      isDefault: false,
      structure: "Structured JSON from log forwarders",
      example: `{
  "event_id": 4625,
  "log_name": "Security",
  "source_name": "Microsoft-Windows-Security-Auditing",
  "computer_name": "DC01.corp.local",
  "time_created": "2026-01-03T10:15:32.123Z",
  "event_data": {
    "TargetUserName": "administrator",
    "TargetDomainName": "CORP",
    "Status": "0xc000006d",
    "SubStatus": "0xc000006a",
    "LogonType": "3",
    "IpAddress": "192.168.1.50",
    "IpPort": "49152",
    "WorkstationName": "ATTACKER-PC",
    "AuthenticationPackageName": "NTLM",
    "FailureReason": "%%2313"
  }
}`,
    },
  ],
  fields: [
    {
      name: "EventID",
      type: "integer",
      description: "Event identifier (always 4625 for failed logon)",
      example: 4625,
    },
    {
      name: "TimeCreated",
      type: "datetime",
      description: "Timestamp when the failed logon attempt occurred",
      example: "2026-01-03T10:15:32.123Z",
    },
    {
      name: "Computer",
      type: "string",
      description: "Computer name where the failed logon was attempted",
      example: "DC01.corp.local",
    },
    {
      name: "SubjectUserSid",
      type: "string",
      description: "SID of the account that reported the failure (usually S-1-0-0 for network logons)",
      example: "S-1-0-0",
    },
    {
      name: "SubjectUserName",
      type: "string",
      description: "Account name that reported the failure",
      example: "-",
    },
    {
      name: "SubjectDomainName",
      type: "string",
      description: "Domain of the subject account",
      example: "-",
    },
    {
      name: "SubjectLogonId",
      type: "string",
      description: "Logon ID of the subject session",
      example: "0x0",
    },
    {
      name: "TargetUserSid",
      type: "string",
      description: "SID of the account that failed to log on",
      example: "S-1-0-0",
    },
    {
      name: "TargetUserName",
      type: "string",
      description: "Account name that failed to log on - critical for identifying targeted accounts",
      example: "administrator",
    },
    {
      name: "TargetDomainName",
      type: "string",
      description: "Domain of the account that failed to log on",
      example: "CORP",
    },
    {
      name: "Status",
      type: "string",
      description: "NTSTATUS code indicating the failure category",
      example: "0xC000006D",
      enum: [
        "0xC000006D - STATUS_LOGON_FAILURE (bad username or password)",
        "0xC0000064 - STATUS_NO_SUCH_USER (user does not exist)",
        "0xC000006A - STATUS_WRONG_PASSWORD (wrong password)",
        "0xC0000234 - STATUS_ACCOUNT_LOCKED_OUT (account locked)",
        "0xC0000072 - STATUS_ACCOUNT_DISABLED (account disabled)",
        "0xC000006F - STATUS_INVALID_LOGON_HOURS (outside allowed hours)",
        "0xC0000070 - STATUS_INVALID_WORKSTATION (not allowed from this workstation)",
        "0xC0000071 - STATUS_PASSWORD_EXPIRED (password expired)",
        "0xC0000193 - STATUS_ACCOUNT_EXPIRED (account expired)",
        "0xC0000133 - STATUS_TIME_DIFFERENCE_AT_DC (time sync issue)",
        "0xC0000224 - STATUS_PASSWORD_MUST_CHANGE (password must change at next logon)",
      ],
    },
    {
      name: "SubStatus",
      type: "string",
      description: "More specific NTSTATUS code providing additional failure details",
      example: "0xC000006A",
      enum: [
        "0x0 - No sub-status",
        "0xC0000064 - User name does not exist",
        "0xC000006A - Wrong password",
        "0xC0000071 - Password expired",
        "0xC0000072 - Account disabled",
        "0xC0000234 - Account locked out",
        "0xC0000413 - Authentication firewall prohibited",
      ],
    },
    {
      name: "FailureReason",
      type: "string",
      description: "Human-readable failure reason",
      example: "Unknown user name or bad password.",
    },
    {
      name: "LogonType",
      type: "integer",
      description: "Type of logon that was attempted",
      example: 3,
      enum: [
        "2 - Interactive (local console logon)",
        "3 - Network (SMB, mapped drives, remote registry)",
        "4 - Batch (scheduled tasks)",
        "5 - Service (service startup)",
        "7 - Unlock (workstation unlock)",
        "8 - NetworkCleartext (IIS basic auth)",
        "9 - NewCredentials (RunAs /netonly)",
        "10 - RemoteInteractive (RDP)",
        "11 - CachedInteractive (cached credentials)",
      ],
    },
    {
      name: "IpAddress",
      type: "ip",
      description: "Source IP address of the failed logon attempt",
      example: "192.168.1.50",
    },
    {
      name: "IpPort",
      type: "integer",
      description: "Source port of the failed logon attempt",
      example: 49152,
    },
    {
      name: "WorkstationName",
      type: "string",
      description: "NetBIOS name of the source workstation",
      example: "ATTACKER-PC",
    },
    {
      name: "LogonProcessName",
      type: "string",
      description: "Name of the logon process",
      example: "NtLmSsp",
      enum: ["NtLmSsp", "Kerberos", "User32", "Advapi", "Schannel", "Negotiate"],
    },
    {
      name: "AuthenticationPackageName",
      type: "string",
      description: "Authentication package used for the logon attempt",
      example: "NTLM",
      enum: ["NTLM", "Kerberos", "Negotiate", "Microsoft_Authentication_Package_V1_0"],
    },
    {
      name: "TransmittedServices",
      type: "string",
      description: "Services involved in S4U (Service for User) logon",
      example: "-",
    },
    {
      name: "LmPackageName",
      type: "string",
      description: "NTLM version used (for NTLM authentication)",
      example: "NTLM V2",
      enum: ["NTLM V1", "NTLM V2", "LM", "-"],
    },
    {
      name: "KeyLength",
      type: "integer",
      description: "Length of the session key (0 for failed logons)",
      example: 0,
    },
    {
      name: "ProcessId",
      type: "string",
      description: "Process ID of the caller process",
      example: "0x0",
    },
    {
      name: "ProcessName",
      type: "string",
      description: "Full path of the caller process",
      example: "-",
    },
  ],
  parsing: {
    grok: {
      xml: `<Data Name="TargetUserName">%{DATA:target_username}</Data>.*<Data Name="TargetDomainName">%{DATA:target_domain}</Data>.*<Data Name="Status">%{DATA:status}</Data>.*<Data Name="SubStatus">%{DATA:sub_status}</Data>.*<Data Name="LogonType">%{INT:logon_type}</Data>.*<Data Name="IpAddress">%{IP:src_ip}</Data>`,
    },
    regex: {
      xml: `TargetUserName">(?P<target_username>[^<]+)</Data>.*TargetDomainName">(?P<target_domain>[^<]+)</Data>.*Status">(?P<status>[^<]+)</Data>.*SubStatus">(?P<sub_status>[^<]+)</Data>.*LogonType">(?P<logon_type>\\d+)</Data>.*IpAddress">(?P<src_ip>[^<]+)</Data>`,
    },
    examples: {
      splunk: `# Splunk search for Event ID 4625
index=wineventlog EventCode=4625
| stats count by TargetUserName, IpAddress, Status, SubStatus
| sort -count

# Brute force detection (5+ failures in 5 minutes)
index=wineventlog EventCode=4625
| bin _time span=5m
| stats count by _time, IpAddress, TargetUserName
| where count > 5

# Password spray detection (same password across multiple accounts)
index=wineventlog EventCode=4625 Status=0xC000006A
| bin _time span=10m
| stats dc(TargetUserName) as unique_users count by _time, IpAddress
| where unique_users > 10

# Failed logons by status code
index=wineventlog EventCode=4625
| lookup windows_status_codes.csv Status OUTPUT Description
| stats count by Status, Description
| sort -count

# props.conf for Windows Security Events
[WinEventLog:Security]
TIME_FORMAT = %Y-%m-%dT%H:%M:%S
TIME_PREFIX = TimeCreated SystemTime='
SHOULD_LINEMERGE = false
KV_MODE = xml`,
      logstash: `input {
  beats {
    port => 5044
  }
}

filter {
  if [winlog][event_id] == 4625 {
    mutate {
      add_tag => ["failed_logon", "security_event"]
    }

    # Parse Status codes to human-readable
    translate {
      field => "[winlog][event_data][Status]"
      destination => "[failure_category]"
      dictionary => {
        "0xc000006d" => "Bad username or password"
        "0xc0000064" => "User does not exist"
        "0xc000006a" => "Wrong password"
        "0xc0000234" => "Account locked out"
        "0xc0000072" => "Account disabled"
        "0xc000006f" => "Outside allowed logon hours"
        "0xc0000070" => "Workstation restriction"
        "0xc0000071" => "Password expired"
        "0xc0000193" => "Account expired"
      }
      fallback => "Unknown status"
    }

    # Parse LogonType to human-readable
    translate {
      field => "[winlog][event_data][LogonType]"
      destination => "[logon_type_name]"
      dictionary => {
        "2" => "Interactive"
        "3" => "Network"
        "4" => "Batch"
        "5" => "Service"
        "7" => "Unlock"
        "8" => "NetworkCleartext"
        "9" => "NewCredentials"
        "10" => "RemoteInteractive"
        "11" => "CachedInteractive"
      }
      fallback => "Unknown"
    }

    # GeoIP enrichment
    if [winlog][event_data][IpAddress] and [winlog][event_data][IpAddress] != "-" {
      geoip {
        source => "[winlog][event_data][IpAddress]"
        target => "source_geo"
      }
    }
  }
}

output {
  if "failed_logon" in [tags] {
    elasticsearch {
      hosts => ["localhost:9200"]
      index => "windows-failed-logons-%{+YYYY.MM.dd}"
    }
  }
}`,
      sigma: `title: Multiple Failed Logons from Single Source
id: 0e95725d-7320-415d-80f7-004da920fc11
status: stable
description: Detects multiple failed logon attempts from a single source IP, indicating potential brute force attack
author: Security Team
date: 2026/01/03
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4625
    timeframe: 5m
    condition: selection | count(IpAddress) by IpAddress > 10
falsepositives:
    - Misconfigured service accounts
    - Legitimate users who forgot their password
level: medium
tags:
    - attack.credential_access
    - attack.t1110.001
    - attack.t1110.003

---
title: Password Spraying Attack Detection
id: 3e85c3d8-9d3a-4c4b-8e7f-5f6a7b8c9d0e
status: experimental
description: Detects password spraying by identifying failed logons across multiple accounts from single IP
logsource:
    product: windows
    service: security
detection:
    selection:
        EventID: 4625
        SubStatus: '0xC000006A'  # Wrong password
    timeframe: 10m
    condition: selection | count(TargetUserName) by IpAddress > 10
level: high
tags:
    - attack.credential_access
    - attack.t1110.003`,
      winlogbeat: `winlogbeat.event_logs:
  - name: Security
    event_id: 4625
    processors:
      - script:
          lang: javascript
          source: >
            function process(event) {
              var status = event.Get("winlog.event_data.Status");
              var statusMap = {
                "0xc000006d": "Bad username or password",
                "0xc0000064": "User does not exist",
                "0xc000006a": "Wrong password",
                "0xc0000234": "Account locked out",
                "0xc0000072": "Account disabled"
              };
              if (status && statusMap[status.toLowerCase()]) {
                event.Put("failure_reason_decoded", statusMap[status.toLowerCase()]);
              }
            }

output.elasticsearch:
  hosts: ["localhost:9200"]
  index: "winlogbeat-failed-logons-%{+yyyy.MM.dd}"`,
      powershell: `# Get failed logons in last 24 hours
Get-WinEvent -FilterHashtable @{
    LogName = 'Security'
    ID = 4625
    StartTime = (Get-Date).AddHours(-24)
} | ForEach-Object {
    $xml = [xml]$_.ToXml()
    [PSCustomObject]@{
        TimeCreated = $_.TimeCreated
        TargetUser = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'TargetUserName'} | Select-Object -ExpandProperty '#text'
        TargetDomain = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'TargetDomainName'} | Select-Object -ExpandProperty '#text'
        SourceIP = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'IpAddress'} | Select-Object -ExpandProperty '#text'
        Status = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'Status'} | Select-Object -ExpandProperty '#text'
        LogonType = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'LogonType'} | Select-Object -ExpandProperty '#text'
        Workstation = $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'WorkstationName'} | Select-Object -ExpandProperty '#text'
    }
} | Export-Csv -Path "C:\\Logs\\FailedLogons.csv" -NoTypeInformation

# Group by source IP to find potential attackers
Get-WinEvent -FilterHashtable @{LogName='Security';ID=4625;StartTime=(Get-Date).AddHours(-1)} |
    ForEach-Object {
        $xml = [xml]$_.ToXml()
        $xml.Event.EventData.Data | Where-Object {$_.Name -eq 'IpAddress'} | Select-Object -ExpandProperty '#text'
    } | Group-Object | Sort-Object Count -Descending | Select-Object -First 10`,
      qradar: `# QRadar AQL for Event ID 4625
SELECT
    DATEFORMAT(starttime, 'yyyy-MM-dd HH:mm:ss') as Time,
    sourceip as "Source IP",
    LOGSOURCENAME(logsourceid) as "Log Source",
    "TargetUserName" as "Target User",
    "TargetDomainName" as "Domain",
    "Status" as "Status Code",
    "LogonType" as "Logon Type"
FROM events
WHERE LOGSOURCETYPENAME(devicetype) = 'Microsoft Windows Security Event Log'
AND "EventID" = '4625'
LAST 24 HOURS

# Brute force detection rule
# Rule: Multiple Failed Logons from Same IP
# Test: when the event count >= 10
# Group by: Source IP
# Time window: 5 minutes

# Custom property extractions
EventID: EventID from Windows Security
TargetUserName: Extract using regex from payload
Status: Extract using regex from payload
SubStatus: Extract using regex from payload`,
      sentinel: `// Microsoft Sentinel KQL - Failed Logons
SecurityEvent
| where EventID == 4625
| extend TargetAccount = strcat(TargetDomainName, "\\\\", TargetUserName)
| project TimeGenerated, Computer, TargetAccount, IpAddress, LogonType, Status, SubStatus, WorkstationName
| order by TimeGenerated desc

// Brute force detection
SecurityEvent
| where EventID == 4625
| where TimeGenerated > ago(1h)
| summarize FailureCount = count(),
            TargetAccounts = make_set(TargetUserName),
            DistinctAccounts = dcount(TargetUserName)
    by IpAddress, bin(TimeGenerated, 5m)
| where FailureCount > 10
| project TimeGenerated, IpAddress, FailureCount, DistinctAccounts, TargetAccounts

// Password spray detection
SecurityEvent
| where EventID == 4625
| where SubStatus == "0xc000006a" // Wrong password
| where TimeGenerated > ago(1h)
| summarize AttemptCount = count(),
            UniqueAccounts = dcount(TargetUserName),
            Accounts = make_set(TargetUserName)
    by IpAddress, bin(TimeGenerated, 10m)
| where UniqueAccounts > 10
| project TimeGenerated, IpAddress, AttemptCount, UniqueAccounts, Accounts

// Failed logons by status code
SecurityEvent
| where EventID == 4625
| where TimeGenerated > ago(24h)
| extend StatusDescription = case(
    Status == "0xc000006d", "Bad username or password",
    Status == "0xc0000064", "User does not exist",
    Status == "0xc000006a", "Wrong password",
    Status == "0xc0000234", "Account locked out",
    Status == "0xc0000072", "Account disabled",
    Status == "0xc000006f", "Outside allowed hours",
    Status == "0xc0000071", "Password expired",
    "Other")
| summarize Count = count() by StatusDescription
| order by Count desc`,
    },
  },
  configuration: {
    enableLogging: {
      description: "Enable auditing for failed logon attempts via Group Policy or auditpol",
      example: `# Enable via auditpol (run as Administrator)
auditpol /set /subcategory:"Logon" /failure:enable

# Verify current settings
auditpol /get /subcategory:"Logon"

# Enable via Group Policy
# Computer Configuration > Windows Settings > Security Settings >
# Advanced Audit Policy Configuration > Logon/Logoff > Audit Logon
# Enable "Failure"

# Enable via PowerShell (requires restart of audit service)
Set-ItemProperty -Path "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\EventLog\\Security" -Name "MaxSize" -Value 104857600

# Enable detailed authentication logging
auditpol /set /subcategory:"Credential Validation" /failure:enable
auditpol /set /subcategory:"Kerberos Authentication Service" /failure:enable
auditpol /set /subcategory:"Kerberos Service Ticket Operations" /failure:enable`,
      note: "Ensure Security log size is sufficient to retain events (minimum 100MB recommended for high-traffic systems)",
    },
    logToSyslog: {
      description: "Forward events to SIEM using Windows Event Forwarding or agents",
      example: `# Windows Event Forwarding (WEF) subscription for 4625 events
# Create subscription XML file: 4625-subscription.xml

<?xml version="1.0" encoding="UTF-8"?>
<Subscription xmlns="http://schemas.microsoft.com/2006/03/windows/events/subscription">
  <SubscriptionId>Failed-Logons-4625</SubscriptionId>
  <SubscriptionType>SourceInitiated</SubscriptionType>
  <Description>Collect all Event ID 4625 failed logon events</Description>
  <Enabled>true</Enabled>
  <Uri>http://schemas.microsoft.com/wbem/wsman/1/windows/EventLog</Uri>
  <Query>
    <![CDATA[
      <QueryList>
        <Query Id="0" Path="Security">
          <Select Path="Security">*[System[(EventID=4625)]]</Select>
        </Query>
      </QueryList>
    ]]>
  </Query>
  <ReadExistingEvents>false</ReadExistingEvents>
  <TransportName>HTTP</TransportName>
  <ContentFormat>Events</ContentFormat>
  <Locale Language="en-US"/>
  <LogFile>ForwardedEvents</LogFile>
  <AllowedSourceNonDomainComputers></AllowedSourceNonDomainComputers>
  <AllowedSourceDomainComputers>O:NSG:NSD:(A;;GA;;;DC)(A;;GA;;;NS)</AllowedSourceDomainComputers>
</Subscription>

# Apply subscription
wecutil cs 4625-subscription.xml

# Verify subscription
wecutil gs Failed-Logons-4625`,
    },
  },
  useCases: {
    operational: [
      {
        name: "Failed logon monitoring dashboard",
        description: "Real-time visibility into authentication failures across the environment",
        fieldsUsed: ["TimeCreated", "Computer", "TargetUserName", "IpAddress", "Status"],
        logic: "EventID=4625 | timechart count by Computer",
      },
      {
        name: "Account lockout tracking",
        description: "Monitor accounts being locked out due to failed attempts",
        fieldsUsed: ["TargetUserName", "Status", "IpAddress"],
        logic: "EventID=4625 AND Status=0xC0000234 | stats count by TargetUserName, IpAddress",
      },
      {
        name: "Service account health",
        description: "Identify service accounts with authentication issues",
        fieldsUsed: ["TargetUserName", "LogonType", "Status"],
        logic: "EventID=4625 AND LogonType IN (4, 5) | stats count by TargetUserName",
      },
    ],
    security: [
      {
        name: "Brute force attack detection",
        description: "Multiple failed logons from single IP targeting one or more accounts",
        fieldsUsed: ["IpAddress", "TargetUserName", "TimeCreated"],
        logic: "EventID=4625 | stats count by IpAddress within 5m | where count > 10",
      },
      {
        name: "Password spraying detection",
        description: "Same password tried against multiple accounts (many users, few attempts per user)",
        fieldsUsed: ["IpAddress", "TargetUserName", "SubStatus", "TimeCreated"],
        logic: "EventID=4625 AND SubStatus=0xC000006A | stats dc(TargetUserName) by IpAddress within 10m | where dc > 10",
      },
      {
        name: "Credential stuffing detection",
        description: "Automated attacks using breached credential lists",
        fieldsUsed: ["IpAddress", "TargetUserName", "Status", "TimeCreated"],
        logic: "EventID=4625 AND Status=0xC0000064 | stats count, dc(TargetUserName) by IpAddress | where count > 50",
      },
      {
        name: "Lateral movement attempts",
        description: "Failed logons from internal IPs to multiple systems",
        fieldsUsed: ["IpAddress", "Computer", "TargetUserName", "LogonType"],
        logic: "EventID=4625 AND LogonType=3 AND IpAddress STARTS_WITH '10.' | stats dc(Computer) by IpAddress | where dc > 5",
      },
      {
        name: "RDP brute force",
        description: "Failed Remote Desktop logon attempts",
        fieldsUsed: ["IpAddress", "TargetUserName", "LogonType"],
        logic: "EventID=4625 AND LogonType=10 | stats count by IpAddress, TargetUserName | where count > 5",
      },
      {
        name: "Privileged account targeting",
        description: "Failed logons to administrator or service accounts",
        fieldsUsed: ["TargetUserName", "IpAddress", "Status"],
        logic: "EventID=4625 AND TargetUserName IN ('Administrator', 'admin', 'root', '*svc*', '*service*')",
      },
      {
        name: "After-hours attack detection",
        description: "Failed logons outside business hours",
        fieldsUsed: ["TimeCreated", "IpAddress", "TargetUserName"],
        logic: "EventID=4625 AND (hour(TimeCreated) < 6 OR hour(TimeCreated) > 20)",
      },
      {
        name: "Geographic anomaly detection",
        description: "Failed logons from unusual geographic locations",
        fieldsUsed: ["IpAddress", "TargetUserName"],
        logic: "EventID=4625 | geoip IpAddress | where country NOT IN (allowed_countries)",
      },
    ],
    business: [
      {
        name: "User experience issues",
        description: "Identify users having repeated login problems",
        fieldsUsed: ["TargetUserName", "Status", "SubStatus"],
        logic: "EventID=4625 | stats count by TargetUserName | where count > 3",
      },
      {
        name: "Compliance reporting",
        description: "Document failed access attempts for audit requirements",
        fieldsUsed: ["TimeCreated", "TargetUserName", "IpAddress", "Computer", "Status"],
      },
      {
        name: "Password policy effectiveness",
        description: "Analyze failure reasons to assess password policy impact",
        fieldsUsed: ["Status", "SubStatus", "TargetUserName"],
        logic: "EventID=4625 | stats count by Status, SubStatus",
      },
    ],
  },
  troubleshooting: [
    {
      problem: "Event ID 4625 not appearing in Security log",
      causes: [
        "Audit policy not enabled for failed logons",
        "Local Security Policy overriding domain policy",
        "Security log full with 'Do not overwrite' setting",
        "Events being filtered by agent or forwarder",
      ],
      solutions: [
        "Enable auditing: auditpol /set /subcategory:\"Logon\" /failure:enable",
        "Check effective policy: auditpol /get /category:\"Logon/Logoff\"",
        "Verify GPO is applied: gpresult /h report.html",
        "Check Security log settings: wevtutil gl Security",
        "Increase log size: wevtutil sl Security /ms:104857600",
      ],
    },
    {
      problem: "Too many 4625 events overwhelming SIEM",
      causes: [
        "Service accounts with wrong passwords",
        "Scheduled tasks with stale credentials",
        "Network scanners triggering authentication",
        "Legitimate brute force attacks",
      ],
      solutions: [
        "Filter known service account failures at the forwarder level",
        "Update service account credentials in scheduled tasks",
        "Whitelist vulnerability scanner IPs in SIEM rules",
        "Implement rate limiting rules to aggregate high-volume attacks",
        "Use WEF queries to filter before forwarding",
      ],
    },
    {
      problem: "IpAddress field shows '-' or '127.0.0.1'",
      causes: [
        "Local/interactive logon (LogonType 2 or 7)",
        "Logon initiated by local process",
        "Network address not available for the authentication method",
      ],
      solutions: [
        "This is expected for local logons - correlate with LogonType field",
        "For network logons, check if NLA is enabled for RDP",
        "Enable Network Level Authentication to capture IP earlier in RDP sessions",
        "Check WorkstationName field as alternative identifier",
      ],
    },
    {
      problem: "Cannot determine actual failure reason from Status code",
      causes: [
        "Status/SubStatus codes are cryptic NTSTATUS values",
        "Multiple codes can indicate similar issues",
      ],
      solutions: [
        "Use SubStatus for more specific reason when Status=0xC000006D",
        "Create SIEM lookup table mapping codes to descriptions",
        "Common mappings: 0xC000006A=wrong password, 0xC0000064=bad username, 0xC0000234=locked out",
        "Reference: docs.microsoft.com/en-us/windows/security/threat-protection/auditing/event-4625",
      ],
    },
    {
      problem: "Missing events during high-volume attacks",
      causes: [
        "Security log buffer overflow",
        "Events dropped due to rate limiting",
        "Agent/forwarder cannot keep up",
      ],
      solutions: [
        "Increase Security log max size to 1GB+",
        "Enable log file auto-backup when full",
        "Scale out log collection infrastructure",
        "Consider sampling during extreme attacks",
        "Use Windows Event Forwarding with proper batching",
      ],
    },
  ],
  testedOn: [
    {
      version: "Windows Server 2022",
      os: "Windows Server 2022",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
    {
      version: "Windows Server 2019",
      os: "Windows Server 2019",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
    {
      version: "Windows 11 23H2",
      os: "Windows 11",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
    {
      version: "Windows 10 22H2",
      os: "Windows 10",
      testedBy: "admin",
      testedAt: "2026-01-03",
    },
  ],
  contribution: {
    createdAt: "2026-01-03",
    createdBy: "admin",
    updatedAt: "2026-01-03",
    updatedBy: "admin",
    contributors: ["admin"],
    validated: false,
  },
};
