/**
 * Input validation schemas and utilities
 */

import { INPUT_LIMITS } from "./security";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates an identifier (technology ID, log type ID, etc.)
 */
export function validateIdentifier(
  value: unknown,
  fieldName: string,
  maxLength: number = INPUT_LIMITS.IDENTIFIER
): ValidationResult {
  const errors: string[] = [];

  if (!value || typeof value !== "string") {
    errors.push(`${fieldName} is required`);
    return { valid: false, errors };
  }

  if (value.length > maxLength) {
    errors.push(`${fieldName} must be ${maxLength} characters or less`);
  }

  if (!/^[a-z][a-z0-9-]*$/.test(value)) {
    errors.push(
      `${fieldName} must start with a lowercase letter and contain only lowercase letters, numbers, and hyphens`
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a string field with length limit
 */
export function validateString(
  value: unknown,
  fieldName: string,
  maxLength: number,
  required: boolean = false
): ValidationResult {
  const errors: string[] = [];

  if (value === undefined || value === null || value === "") {
    if (required) {
      errors.push(`${fieldName} is required`);
    }
    return { valid: !required, errors };
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string`);
    return { valid: false, errors };
  }

  if (value.length > maxLength) {
    errors.push(`${fieldName} must be ${maxLength} characters or less`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates Linux paths array
 */
export function validateLinuxPaths(paths: unknown): ValidationResult {
  const errors: string[] = [];

  if (paths === undefined || paths === null) {
    return { valid: true, errors };
  }

  if (!Array.isArray(paths)) {
    errors.push("Linux paths must be an array");
    return { valid: false, errors };
  }

  if (paths.length > 20) {
    errors.push("Maximum 20 Linux paths allowed");
  }

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];
    if (!p || typeof p !== "object") {
      errors.push(`Invalid path entry at index ${i}`);
      continue;
    }

    const { distro, path: pathValue } = p as {
      distro?: unknown;
      path?: unknown;
    };

    if (distro !== undefined && distro !== null) {
      if (typeof distro !== "string" || distro.length > 50) {
        errors.push(`Invalid distro at index ${i}`);
      }
    }

    if (pathValue !== undefined && pathValue !== null) {
      if (typeof pathValue !== "string") {
        errors.push(`Invalid path at index ${i}`);
      } else if (pathValue.length > INPUT_LIMITS.PATH) {
        errors.push(`Path too long at index ${i}`);
      } else if (!/^[\/~][\w.\/-]*$/.test(pathValue)) {
        errors.push(`Invalid path format at index ${i}`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a new log type request body
 */
export function validateNewLogTypeRequest(body: unknown): ValidationResult {
  const allErrors: string[] = [];

  if (!body || typeof body !== "object") {
    return { valid: false, errors: ["Invalid request body"] };
  }

  const data = body as Record<string, unknown>;

  // Required identifiers
  const techIdResult = validateIdentifier(
    data.technologyId,
    "technologyId",
    INPUT_LIMITS.TECHNOLOGY_ID
  );
  const logTypeIdResult = validateIdentifier(
    data.logTypeId,
    "logTypeId",
    INPUT_LIMITS.TECHNOLOGY_ID
  );

  allErrors.push(...techIdResult.errors, ...logTypeIdResult.errors);

  // Required names
  const logTypeNameResult = validateString(
    data.logTypeName,
    "logTypeName",
    INPUT_LIMITS.TECHNOLOGY_NAME,
    true
  );
  allErrors.push(...logTypeNameResult.errors);

  // Optional but length-limited fields
  const optionalFields: Array<{
    key: string;
    max: number;
    required?: boolean;
  }> = [
    { key: "technologyName", max: INPUT_LIMITS.TECHNOLOGY_NAME },
    { key: "technologyDescription", max: INPUT_LIMITS.DESCRIPTION },
    { key: "logTypeDescription", max: INPUT_LIMITS.DESCRIPTION },
    { key: "windowsPath", max: INPUT_LIMITS.PATH },
    { key: "macPath", max: INPUT_LIMITS.PATH },
    { key: "example", max: INPUT_LIMITS.EXAMPLE },
    { key: "structure", max: INPUT_LIMITS.STRUCTURE },
    { key: "grokPattern", max: INPUT_LIMITS.PATTERN },
    { key: "regexPattern", max: INPUT_LIMITS.PATTERN },
    { key: "additionalNotes", max: INPUT_LIMITS.NOTES },
  ];

  for (const field of optionalFields) {
    const result = validateString(
      data[field.key],
      field.key,
      field.max,
      field.required
    );
    allErrors.push(...result.errors);
  }

  // Linux paths
  if (data.linuxPaths !== undefined) {
    const pathsResult = validateLinuxPaths(data.linuxPaths);
    allErrors.push(...pathsResult.errors);
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}

/**
 * Validates file upload metadata
 */
export function validateUploadMetadata(
  technology: unknown,
  logType: unknown
): ValidationResult {
  const errors: string[] = [];

  if (!technology || typeof technology !== "string") {
    errors.push("Technology is required");
  } else if (technology.length > 100) {
    errors.push("Technology name too long");
  } else if (!/^[a-zA-Z0-9_-]+$/.test(technology)) {
    errors.push("Technology contains invalid characters");
  }

  if (!logType || typeof logType !== "string") {
    errors.push("Log type is required");
  } else if (logType.length > 100) {
    errors.push("Log type name too long");
  } else if (!/^[a-zA-Z0-9_-]+$/.test(logType)) {
    errors.push("Log type contains invalid characters");
  }

  return { valid: errors.length === 0, errors };
}
