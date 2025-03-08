import { isQuoted } from './utils'

/**
 * Revert `safe` processed result
 *
 * @param text - given ini key or value
 * @returns reversed safe process result
 */
export function unsafe(text: string): string {
  text = (text || '').trim()
  if (isQuoted(text)) {
    // remove the single quotes before calling JSON.parse
    if (text.charAt(0) === "'") {
      text = text.slice(1, -1)
    }
    try {
      text = JSON.parse(text)
    } catch {
      // ignore errors
    }
  } else {
    // walk the text to find the first not-escaped ; character
    let esc = false
    let unesc = ''
    for (let i = 0, l = text.length; i < l; i++) {
      const c = text.charAt(i)
      if (esc) {
        if ('\\;#'.includes(c)) {
          unesc += c
        } else {
          unesc += `\\${c}`
        }

        esc = false
      } else if (';#'.includes(c)) {
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
  return text
}
