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
