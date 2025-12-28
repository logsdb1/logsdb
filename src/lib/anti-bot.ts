/**
 * Anti-bot protection utilities for anonymous uploads
 */

import crypto from "crypto";

const CHALLENGE_SECRET =
  process.env.ANTIBOT_SECRET || crypto.randomBytes(32).toString("hex");
const CHALLENGE_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes

export interface ChallengeResult {
  valid: boolean;
  reason?: string;
}

/**
 * Generate a time-based challenge token
 */
export function generateChallenge(): { token: string; timestamp: number } {
  const timestamp = Date.now();
  const data = `${timestamp}:${CHALLENGE_SECRET}`;
  const token = crypto
    .createHash("sha256")
    .update(data)
    .digest("hex")
    .slice(0, 32);
  return { token, timestamp };
}

/**
 * Verify a challenge token
 */
export function verifyChallenge(
  token: string,
  timestamp: number
): ChallengeResult {
  // Check timestamp is recent
  const now = Date.now();
  if (now - timestamp > CHALLENGE_VALIDITY_MS) {
    return { valid: false, reason: "Challenge expired" };
  }

  // Check timestamp is not in the future (clock skew tolerance: 1 minute)
  if (timestamp > now + 60000) {
    return { valid: false, reason: "Invalid timestamp" };
  }

  // Verify token
  const expected = crypto
    .createHash("sha256")
    .update(`${timestamp}:${CHALLENGE_SECRET}`)
    .digest("hex")
    .slice(0, 32);

  try {
    if (
      !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    ) {
      return { valid: false, reason: "Invalid challenge token" };
    }
  } catch {
    return { valid: false, reason: "Invalid challenge token" };
  }

  return { valid: true };
}

/**
 * Check for honeypot fields (should be empty)
 */
export function checkHoneypot(formData: FormData): ChallengeResult {
  // These fields should NOT be filled by real users
  const honeypotFields = ["website", "url", "email2", "phone"];

  for (const field of honeypotFields) {
    const value = formData.get(field);
    if (value && String(value).trim() !== "") {
      return { valid: false, reason: "Bot detected" };
    }
  }

  return { valid: true };
}

/**
 * Validate file content is actually a log file
 */
export function validateLogContent(content: Buffer): ChallengeResult {
  // Check if content is valid UTF-8 text
  try {
    const text = content.toString("utf-8");

    // Check for binary content (null bytes, etc.)
    if (text.includes("\0")) {
      return { valid: false, reason: "Binary content not allowed" };
    }

    // Check that file is not empty
    if (text.trim().length === 0) {
      return { valid: false, reason: "Empty file" };
    }

    // Check for reasonable line structure
    const lines = text.split("\n");
    if (lines.length === 0) {
      return { valid: false, reason: "Empty file" };
    }

    // Check for suspicious patterns (executables, scripts, etc.)
    const firstChunk = text.slice(0, 1000);
    const suspiciousPatterns = [
      /^MZ/, // DOS/PE executable
      /^.ELF/, // ELF executable
      /^PK/, // ZIP/JAR archive
      /<\?php/i, // PHP script
      /^#!.*python/i, // Python shebang
      /^#!.*bash/i, // Bash shebang
      /^#!.*sh/i, // Shell shebang
      /<script[\s>]/i, // JavaScript in HTML
      /^%PDF/, // PDF (use upload route instead)
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(firstChunk)) {
        return { valid: false, reason: "File content not allowed" };
      }
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: "Invalid file encoding" };
  }
}

/**
 * Simple timing check - submission should take at least 2 seconds
 * (bots often submit instantly)
 */
export function checkSubmissionTiming(startTime: number): ChallengeResult {
  const elapsed = Date.now() - startTime;
  if (elapsed < 2000) {
    // Less than 2 seconds
    return { valid: false, reason: "Submission too fast" };
  }
  return { valid: true };
}

/**
 * Validate file extension matches content type
 */
export function validateFileExtension(
  filename: string,
  allowedExtensions: string[]
): ChallengeResult {
  const ext = filename.toLowerCase().split(".").pop();
  if (!ext || !allowedExtensions.includes(`.${ext}`)) {
    return {
      valid: false,
      reason: `Only ${allowedExtensions.join(", ")} files allowed`,
    };
  }
  return { valid: true };
}
