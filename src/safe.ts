import { COMMENT_PREFIXES } from './constants'
import { isQuoted } from './utils'

/**
 * Converts text into an INI-safe key/value representation.
 *
 * @param text - given string
 * @returns escaped or JSON-quoted INI token
 */
export function safe(text: string): string {
  if (
    typeof text !== 'string' ||
    /[=\r\n]/u.test(text) ||
    text.startsWith('[') ||
    (text.length > 1 && isQuoted(text)) ||
    text !== text.trim()
  ) {
    return JSON.stringify(text)
  }

  let output = text
  for (const prefix of COMMENT_PREFIXES) {
    output = output.split(prefix).join(`\\${prefix}`)
  }

  return output
}
