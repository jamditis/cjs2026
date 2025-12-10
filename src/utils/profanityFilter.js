// Profanity filter using comprehensive word list from zautumnz/profane-words
// https://github.com/zautumnz/profane-words (~2000 words)

import PROFANE_WORDS from './profane-words.json'

// Additional slurs to ensure coverage (in case any are missing)
const ADDITIONAL_WORDS = [
  'gook', 'homo', 'tranny', 'shemale', 'ladyboy'
]

// Combine both lists
const BLACKLIST = [...new Set([...PROFANE_WORDS, ...ADDITIONAL_WORDS])]

// Character substitutions for fuzzy matching
const SUBSTITUTIONS = {
  'a': ['a', '@', '4', '^'],
  'b': ['b', '8', '|3'],
  'c': ['c', '(', '<', 'k'],
  'd': ['d', '|)'],
  'e': ['e', '3'],
  'f': ['f', 'ph'],
  'g': ['g', '9', '6'],
  'h': ['h', '#'],
  'i': ['i', '1', '!', '|', 'l'],
  'k': ['k', 'c'],
  'l': ['l', '1', '|', 'i'],
  'o': ['o', '0', '()'],
  's': ['s', '$', '5', 'z'],
  't': ['t', '+', '7'],
  'u': ['u', 'v', '|_|'],
  'x': ['x', '%'],
}

// Build regex pattern for a word with fuzzy matching
function buildFuzzyPattern(word) {
  let pattern = ''
  for (const char of word.toLowerCase()) {
    const subs = SUBSTITUTIONS[char]
    if (subs) {
      // Match any of the substitutions, with optional separators between chars
      pattern += `[${subs.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('')}]+[\\s._-]*`
    } else if (/[a-z0-9]/.test(char)) {
      pattern += char + '[\\s._-]*'
    }
  }
  return pattern
}

// Pre-build regex patterns for words that need fuzzy matching
// For efficiency, only build fuzzy patterns for shorter common slurs
const FUZZY_WORDS = BLACKLIST.filter(w => w.length <= 8 && /^[a-z]+$/.test(w))
const FUZZY_PATTERNS = FUZZY_WORDS.map(word => ({
  word,
  regex: new RegExp(`\\b${buildFuzzyPattern(word)}`, 'gi')
}))

// Normalize text for exact matching
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ')    // Normalize spaces
    .trim()
}

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {{ hasProfanity: boolean, matches: string[] }}
 */
export function checkProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, matches: [] }
  }

  const normalizedText = normalizeText(text)
  const matches = []

  // Check for exact matches (whole words)
  const words = normalizedText.split(/\s+/)
  for (const word of words) {
    if (BLACKLIST.includes(word)) {
      matches.push(word)
    }
  }

  // Check for partial matches in longer text
  for (const blackWord of BLACKLIST) {
    if (blackWord.includes(' ')) {
      // Multi-word phrases - check if they appear in the normalized text
      if (normalizedText.includes(blackWord)) {
        matches.push(blackWord)
      }
    }
  }

  // Check fuzzy patterns for common substitutions
  for (const { word, regex } of FUZZY_PATTERNS) {
    regex.lastIndex = 0 // Reset regex state
    if (regex.test(text.toLowerCase())) {
      matches.push(word)
    }
  }

  return {
    hasProfanity: matches.length > 0,
    matches: [...new Set(matches)] // Dedupe
  }
}

/**
 * Filter/censor profanity from text
 * @param {string} text - Text to filter
 * @param {string} replacement - Character to use for censoring (default: '*')
 * @returns {string}
 */
export function filterProfanity(text, replacement = '*') {
  if (!text || typeof text !== 'string') {
    return text
  }

  let filtered = text

  // Replace exact matches
  for (const blackWord of BLACKLIST) {
    const regex = new RegExp(`\\b${blackWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi')
    filtered = filtered.replace(regex, match => replacement.repeat(match.length))
  }

  // Replace fuzzy matches
  for (const { regex } of FUZZY_PATTERNS) {
    regex.lastIndex = 0
    filtered = filtered.replace(regex, match => replacement.repeat(match.length))
  }

  return filtered
}

/**
 * Validate text and return error message if profanity detected
 * @param {string} text - Text to validate
 * @param {string} fieldName - Name of field for error message
 * @returns {string|null} - Error message or null if valid
 */
export function validateNoProfanity(text, fieldName = 'This field') {
  const { hasProfanity } = checkProfanity(text)
  if (hasProfanity) {
    return `${fieldName} contains inappropriate language. Please revise.`
  }
  return null
}

export default {
  checkProfanity,
  filterProfanity,
  validateNoProfanity
}
