// ============================================================================
// Technology Types
// ============================================================================

export interface Technology {
  id: string;
  name: string;
  description: string;
  vendor?: string;
  openSource: boolean;
  license?: string;
  officialDocs?: string;
  githubRepo?: string;
  currentVersion?: string;
  logo?: string;
  categories: string[];
  logTypes: LogTypeSummary[];
  defaultPaths: Record<string, string>;
  configFile?: string;
  related?: string[];
  compareWith?: string[];
  contribution: ContributionInfo;
}

export interface LogTypeSummary {
  id: string;
  name: string;
  description: string;
  defaultPath: string | null;
  optional?: boolean;
}

// ============================================================================
// Log Type Detail Types
// ============================================================================

export interface LogType {
  id: string;
  technologyId: string;
  name: string;
  description: string;
  quickFacts: QuickFacts;
  paths: PathsByPlatform;
  formats: LogFormat[];
  fields: Field[];
  parsing: ParsingConfig;
  configuration: ConfigurationSection;
  useCases: UseCases;
  troubleshooting: TroubleshootingItem[];
  allVariables?: VariablesByCategory;
  testedOn: TestedOnEntry[];
  contribution: ContributionInfo;
}

export interface QuickFacts {
  defaultPathLinux: string;
  defaultPathDocker?: string;
  defaultFormat: string;
  jsonNative: boolean;
  jsonSinceVersion?: string;
  rotation?: string;
}

export interface PathsByPlatform {
  linux?: PathEntry[];
  windows?: PathEntry[];
  macos?: PathEntry[];
  containers?: PathEntry[];
  cloud?: PathEntry[];
}

export interface PathEntry {
  distro?: string;
  variant?: string;
  platform?: string;
  provider?: string;
  path: string;
  note?: string;
}

export interface LogFormat {
  id: string;
  name: string;
  isDefault: boolean;
  structure: string;
  example: string;
  nativeSupport?: boolean;
  sinceVersion?: string;
  configRequired?: boolean;
}

export interface Field {
  name: string;
  variable?: string;
  type: FieldType;
  format?: string;
  description: string;
  example: string | number;
  note?: string;
  enum?: string[];
  range?: [number, number];
  unit?: string;
  sinceVersion?: string;
}

export type FieldType =
  | "string"
  | "integer"
  | "float"
  | "ip"
  | "datetime"
  | "boolean";

export interface ParsingConfig {
  grok?: Record<string, string>;
  regex?: Record<string, string>;
  examples: Record<string, string>;
}

export interface ConfigurationSection {
  enableLogging?: ConfigExample;
  disableLogging?: ConfigExample;
  changeFormat?: ConfigSteps;
  enableJson?: ConfigExample;
  addRequestId?: ConfigExample;
  conditionalLogging?: ConfigExample;
  logToSyslog?: ConfigExample;
  logRotation?: LogRotationConfig;
  [key: string]: ConfigExample | ConfigSteps | LogRotationConfig | undefined;
}

export interface ConfigExample {
  directive?: string;
  file?: string;
  example?: string;
  note?: string;
  description?: string;
  recommended?: boolean;
  sinceVersion?: string;
}

export interface ConfigSteps {
  steps: string[];
  example: string;
}

export interface LogRotationConfig {
  tool: string;
  configPath: string;
  example: string;
}

export interface UseCases {
  operational: UseCase[];
  security: UseCase[];
  business: UseCase[];
}

export interface UseCase {
  name: string;
  description: string;
  fieldsUsed: string[];
  logic?: string;
}

export interface TroubleshootingItem {
  problem: string;
  causes: string[];
  solutions: string[];
}

export interface VariablesByCategory {
  request?: Variable[];
  client?: Variable[];
  response?: Variable[];
  time?: Variable[];
  upstream?: Variable[];
  ssl?: Variable[];
  headers?: Variable[];
  server?: Variable[];
  [key: string]: Variable[] | undefined;
}

export interface Variable {
  var: string;
  desc: string;
}

export interface TestedOnEntry {
  version: string;
  os: string;
  testedBy: string;
  testedAt: string;
}

export interface ContributionInfo {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  contributors: string[];
  upvotes?: number;
  downvotes?: number;
  validated: boolean;
  commentsCount?: number;
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  icon: string;
  technologies?: string[];
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  technologies: string[];
}

// ============================================================================
// Search Types
// ============================================================================

export interface SearchResult {
  type: "technology" | "logType";
  id: string;
  technologyId?: string;
  name: string;
  description: string;
  categories?: string[];
  path?: string;
}

// ============================================================================
// UI Helper Types
// ============================================================================

export interface Breadcrumb {
  label: string;
  href: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}
