import { isQuoted } from './utils'

/**
 * Turn the given string into a safe to use key or value in your INI file
 *
 * @param text - given string
 * @returns init key or value
 */
export function safe(text: string): string {
  if (
    typeof text !== 'string'
    || /[=\r\n]/.test(text)
    || /^\[/.test(text)
    || (text.length > 1 && isQuoted(text))
    || text !== text.trim()
  ) {
    return JSON.stringify(text)
  }
  return text.split(';').join('\\;').split('#').join('\\#')
}
