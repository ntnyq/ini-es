import { COMMENT_PREFIXES } from './constants'
import { isQuoted } from './utils'

/**
 * Reverts a token previously processed by {@link safe}.
 *
 * @param text - given ini key or value
 * @returns unescaped and normalized text value
 */
export function unsafe(text: string): string {
  let value = (text || '').trim()
  if (isQuoted(value)) {
    // Remove the single quotes before calling JSON.parse
    if (value.charAt(0) === "'") {
      value = value.slice(1, -1)
    }
    try {
      value = JSON.parse(value)
    } catch {
      // Ignore errors
    }
  } else {
    // Walk the text to find the first not-escaped ; character
    let esc = false
    let unesc = ''
    for (let i = 0, l = value.length; i < l; i++) {
      const c = value.charAt(i)
      if (esc) {
        if (COMMENT_PREFIXES.includes(c)) {
          unesc += c
        } else {
          unesc += `\\${c}`
        }

        esc = false
      } else if (COMMENT_PREFIXES.includes(c)) {
        break
      } else if (c === '\\') {
        esc = true
      } else {
        unesc += c
      }
    }
    if (esc) {
      unesc += '\\'
    }

    return unesc.trim()
  }
  return value
}
