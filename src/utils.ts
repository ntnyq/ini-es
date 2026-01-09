import type { AnyObject } from './types'

export function hasOwn(obj: AnyObject, key: PropertyKey): boolean {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

export function isQuoted(value: string): boolean {
  return (
    (value.startsWith(`"`) && value.endsWith(`"`))
    || (value.startsWith(`'`) && value.endsWith(`'`))
  )
}

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
 * Strips BOM character from string
 * @param text - input string
 * @returns - string without BOM character
 */
export function stripBOM(text: string): string {
  // eslint-disable-next-line unicorn/number-literal-case
  if (text.codePointAt(0) === 0xfeff) {
    return text.slice(1)
  }
  return text
}
