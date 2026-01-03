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
