// Profanity filter with fuzzy matching
// Standard blacklist with common substitutions

const BLACKLIST = [
  // Standard profanity (keeping this list professional but comprehensive)
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap', 'piss', 'dick', 'cock',
  'pussy', 'cunt', 'bastard', 'slut', 'whore', 'fag', 'nigger', 'nigga',
  'retard', 'spic', 'chink', 'kike', 'wetback', 'cracker',
  // Compound words
  'asshole', 'bullshit', 'horseshit', 'dumbass', 'jackass', 'dipshit',
  'motherfucker', 'fucker', 'fuckface', 'fuckhead', 'shithead', 'dickhead',
  'bitchass', 'cocksucker',
]

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
    } else {
      pattern += char + '[\\s._-]*'
    }
  }
  return pattern
}

// Pre-build regex patterns for all blacklisted words
const PATTERNS = BLACKLIST.map(word => ({
  word,
  regex: new RegExp(buildFuzzyPattern(word), 'gi')
}))

/**
 * Check if text contains profanity
 * @param {string} text - Text to check
 * @returns {{ hasProfanity: boolean, matches: string[] }}
 */
export function checkProfanity(text) {
  if (!text || typeof text !== 'string') {
    return { hasProfanity: false, matches: [] }
  }

  const normalizedText = text.toLowerCase().replace(/\s+/g, ' ')
  const matches = []

  for (const { word, regex } of PATTERNS) {
    regex.lastIndex = 0 // Reset regex state
    if (regex.test(normalizedText)) {
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
  for (const { regex } of PATTERNS) {
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
