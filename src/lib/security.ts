/**
 * Security utilities for input validation and sanitization
 */

/**
 * Escapes special regex characters in a string to prevent ReDoS attacks
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Validates that a string contains only safe identifier characters
 * For logTypeId, fieldName, technology, etc.
 */
export function isValidIdentifier(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  return /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(str) && str.length <= 100;
}

/**
 * Validates that a string contains only safe field names
 * More restrictive than identifier - only lowercase with underscores
 */
export function isValidFieldName(str: string): boolean {
  if (!str || typeof str !== "string") return false;
  return /^[a-z][a-zA-Z0-9]*$/.test(str) && str.length <= 50;
}

/**
 * Sanitizes string for safe use in regex patterns
 */
export function sanitizeForRegex(
  str: string,
  maxLength: number = 200
): string {
  if (!str || typeof str !== "string" || str.length > maxLength) {
    throw new Error("Invalid input for regex pattern");
  }
  return escapeRegex(str);
}

/**
 * Validates and sanitizes a filename
 * Returns null if invalid
 */
export function sanitizeFilename(filename: string): string | null {
  if (!filename || typeof filename !== "string") return null;
  if (filename.length > 255) return null;

  // Remove path separators and null bytes
  const sanitized = filename
    .replace(/[\\/\0]/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  if (!sanitized || sanitized.startsWith(".")) return null;
  return sanitized;
}

/**
 * Validates that a path doesn't contain traversal attempts
 */
export function isPathSafe(filepath: string, baseDir: string): boolean {
  if (!filepath || !baseDir) return false;

  const path = require("path");
  const resolvedPath = path.resolve(filepath);
  const resolvedBase = path.resolve(baseDir);

  return resolvedPath.startsWith(resolvedBase + path.sep);
}

/**
 * Maximum lengths for various fields
 */
export const INPUT_LIMITS = {
  IDENTIFIER: 100,
  TECHNOLOGY_ID: 50,
  TECHNOLOGY_NAME: 100,
  DESCRIPTION: 2000,
  PATH: 500,
  EXAMPLE: 10000,
  STRUCTURE: 5000,
  PATTERN: 5000,
  NOTES: 5000,
  FILENAME: 255,
};

/**
 * Validates string length
 */
export function validateLength(
  value: string | undefined | null,
  maxLength: number,
  fieldName: string
): { valid: boolean; error?: string } {
  if (!value) return { valid: true };
  if (typeof value !== "string") {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} must be ${maxLength} characters or less`,
    };
  }
  return { valid: true };
}
