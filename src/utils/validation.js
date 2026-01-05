/**
 * Validation utilities for form inputs
 */

/**
 * Validate email address format
 * Uses a practical regex that catches most invalid emails without being overly strict
 *
 * @param {string} email - Email to validate
 * @returns {boolean} True if email appears valid
 *
 * @example
 * isValidEmail('user@example.com') // true
 * isValidEmail('invalid') // false
 * isValidEmail('user@localhost') // false (no TLD)
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false

  // Trim whitespace and check length
  const trimmed = email.trim().toLowerCase()
  if (trimmed.length < 5 || trimmed.length > 254) return false

  // RFC 5322 practical email regex
  // Matches: local-part@domain where domain has at least one dot
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

  return emailRegex.test(trimmed)
}

/**
 * Validate URL format
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL appears valid
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false

  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

/**
 * Validate required field is not empty
 *
 * @param {string} value - Value to check
 * @returns {boolean} True if value is non-empty after trimming
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  return true
}

/**
 * Validate string length within range
 *
 * @param {string} value - Value to check
 * @param {number} min - Minimum length (inclusive)
 * @param {number} max - Maximum length (inclusive)
 * @returns {boolean} True if length is within range
 */
export function isLengthInRange(value, min, max) {
  if (!value || typeof value !== 'string') return min === 0
  const len = value.trim().length
  return len >= min && len <= max
}
