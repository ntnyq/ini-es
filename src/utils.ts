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
