import { BOM_CODE_POINT, JSON_LITERAL_VALUES } from './constants'
import type { AnyObject } from './types'

/**
 * Checks whether an object has the given own property.
 *
 * @param obj - target object
 * @param key - property key to check
 * @returns true when key exists directly on the object
 */
export function hasOwn(obj: AnyObject, key: PropertyKey): boolean {
  return Object.hasOwn(obj, key)
}

/**
 * Checks whether a string is quoted with matching single or double quotes.
 *
 * @param value - candidate text
 * @returns true when text starts and ends with the same quote style
 */
export function isQuoted(value: string): boolean {
  return (
    (value.startsWith(`"`) && value.endsWith(`"`)) ||
    (value.startsWith(`'`) && value.endsWith(`'`))
  )
}

/**
 * Splits a section path by separator while honoring escaped separators.
 *
 * @param text - section path text
 * @param separator - separator token, usually `.`
 * @returns section path segments preserving escaped separators
 */
export function splitSections(text: string, separator: string): string[] {
  let lastMatchIndex = 0
  let lastSeparatorIndex = 0
  let nextIndex = 0
  const sections: string[] = []

  do {
    nextIndex = text.indexOf(separator, lastMatchIndex)

    if (nextIndex !== -1) {
      lastMatchIndex = nextIndex + separator.length

      if (nextIndex > 0 && text[nextIndex - 1] === '\\') {
        continue
      }

      sections.push(text.slice(lastSeparatorIndex, nextIndex))
      lastSeparatorIndex = nextIndex + separator.length
    }
  } while (nextIndex !== -1)

  sections.push(text.slice(lastSeparatorIndex))

  return sections
}

/**
 * Parses INI scalar literals represented as JSON-compatible strings.
 *
 * @param raw - unescaped string value
 * @returns boolean/null when literal matches, otherwise original string
 */
export function parseJsonLiteral(raw: string): unknown {
  return JSON_LITERAL_VALUES.includes(
    raw as (typeof JSON_LITERAL_VALUES)[number],
  )
    ? JSON.parse(raw)
    : raw
}

/**
 * Strips BOM character from string
 *
 * @param text - input string
 * @returns string without BOM character
 */
export function stripBOM(text: string): string {
  if (text.codePointAt(0) === BOM_CODE_POINT) {
    return text.slice(1)
  }
  return text
}
