import { Technology, LogType, Category } from "@/types";

// Import all technologies
import { nginx, nginxAccessLog, nginxErrorLog } from "./technologies/nginx";
import { apache, apacheAccessLog, apacheErrorLog } from "./technologies/apache";
import { linux, linuxSyslog, linuxAuthLog } from "./technologies/linux";
import { windows, windowsSecurityLog, windowsEvent4625 } from "./technologies/windows";
import { docker, dockerContainerLog, dockerDaemonLog } from "./technologies/docker";
import { postgresql, postgresqlServerLog } from "./technologies/postgresql";
import { mysql, mysqlErrorLog, mysqlSlowLog } from "./technologies/mysql";
import { paloalto, paloaltoTrafficLog, paloaltoThreatLog, paloaltoUrlLog, paloaltoWildFireLog } from "./technologies/paloalto";
import { cortexXdr, cortexXdrEndpointEvents, cortexXdrAlerts } from "./technologies/cortex-xdr";

// All technologies indexed by ID
export const technologies: Record<string, Technology> = {
  nginx,
  apache,
  linux,
  windows,
  docker,
  postgresql,
  mysql,
  paloalto,
  "cortex-xdr": cortexXdr,
};

// All log types indexed by "technologyId/logTypeId"
export const logTypes: Record<string, LogType> = {
  "nginx/access": nginxAccessLog,
  "nginx/error": nginxErrorLog,
  "apache/access": apacheAccessLog,
  "apache/error": apacheErrorLog,
  "linux/syslog": linuxSyslog,
  "linux/auth": linuxAuthLog,
  "windows/security": windowsSecurityLog,
  "windows/4625": windowsEvent4625,
  "docker/container": dockerContainerLog,
  "docker/daemon": dockerDaemonLog,
  "postgresql/server": postgresqlServerLog,
  "mysql/error": mysqlErrorLog,
  "mysql/slow": mysqlSlowLog,
  "paloalto/traffic": paloaltoTrafficLog,
  "paloalto/threat": paloaltoThreatLog,
  "paloalto/url": paloaltoUrlLog,
  "paloalto/wildfire": paloaltoWildFireLog,
  "cortex-xdr/endpoint-events": cortexXdrEndpointEvents,
  "cortex-xdr/alerts": cortexXdrAlerts,
};

// Get technology by ID
export function getTechnology(id: string): Technology | undefined {
  return technologies[id];
}

// Get log type by technology ID and log type ID
export function getLogType(
  technologyId: string,
  logTypeId: string
): LogType | undefined {
  return logTypes[`${technologyId}/${logTypeId}`];
}

// Get all technologies as array
export function getAllTechnologies(): Technology[] {
  return Object.values(technologies);
}

// Get all log types for a technology
export function getLogTypesForTechnology(technologyId: string): LogType[] {
  return Object.values(logTypes).filter((lt) => lt.technologyId === technologyId);
}

// Categories for filtering and navigation
export const categories: Category[] = [
  {
    id: "web",
    name: "Web & Reverse Proxies",
    icon: "Globe",
    technologies: ["nginx", "apache"],
  },
  {
    id: "os",
    name: "Operating Systems",
    icon: "Monitor",
    subcategories: [
      {
        id: "linux",
        name: "Linux",
        technologies: ["linux"],
      },
      {
        id: "windows",
        name: "Windows",
        technologies: ["windows"],
      },
    ],
  },
  {
    id: "containers",
    name: "Containers & Orchestration",
    icon: "Box",
    technologies: ["docker"],
  },
  {
    id: "databases",
    name: "Databases",
    icon: "Database",
    technologies: ["postgresql", "mysql"],
  },
  {
    id: "security",
    name: "Security & Firewalls",
    icon: "Shield",
    technologies: ["paloalto", "cortex-xdr"],
  },
];

// Search function
export function searchTechnologies(query: string): Technology[] {
  const q = query.toLowerCase();
  return getAllTechnologies().filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.categories.some((c) => c.toLowerCase().includes(q))
  );
}

// Search log types
export function searchLogTypes(query: string): LogType[] {
  const q = query.toLowerCase();
  return Object.values(logTypes).filter(
    (lt) =>
      lt.name.toLowerCase().includes(q) ||
      lt.description.toLowerCase().includes(q) ||
      lt.technologyId.toLowerCase().includes(q)
  );
}

// Combined search
export interface SearchResult {
  type: "technology" | "logType";
  technology: Technology;
  logType?: LogType;
}

export function search(query: string): SearchResult[] {
  const results: SearchResult[] = [];
  const q = query.toLowerCase();

  // Search technologies
  for (const tech of getAllTechnologies()) {
    if (
      tech.name.toLowerCase().includes(q) ||
      tech.description.toLowerCase().includes(q)
    ) {
      results.push({ type: "technology", technology: tech });
    }

    // Search log types within this technology
    for (const lt of getLogTypesForTechnology(tech.id)) {
      if (
        lt.name.toLowerCase().includes(q) ||
        lt.description.toLowerCase().includes(q)
      ) {
        results.push({ type: "logType", technology: tech, logType: lt });
      }
    }
  }

  return results;
}

// Popular technologies for homepage
export const popularTechnologies = [
  technologies.nginx,
  technologies.linux,
  technologies.docker,
  technologies.windows,
  technologies.postgresql,
  technologies.apache,
  technologies.paloalto,
];
