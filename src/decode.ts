import { unsafe } from './unsafe'
import { hasOwn, splitSections } from './utils'
import type { AnyObject } from './types'

export interface DecodeOptions {
  /**
   * Whether to append `[]` to array keys.
   * Some parsers treat duplicate names by themselves as arrays
   *
   * @default true
   */
  bracketedArray?: boolean
}

/**
 * Attempts to turn the given INI string into a nested data object.
 *
 * @param text - init string
 * @param options - decode options {@link DecodeOptions}
 * @returns nested data object
 */
export function decode<T extends AnyObject = AnyObject>(
  text: string,
  options: DecodeOptions = {},
): T {
  const { bracketedArray = true } = options
  const out: AnyObject = Object.create(null)
  let p: AnyObject = out
  let section = null

  //          section          |key      = value
  const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/
  const lines = text.split(/[\r\n]+/g)
  const duplicates: Record<string, any> = {}

  for (const line of lines) {
    if (!line || /^\s*[;#]/.test(line) || /^\s*$/.test(line)) {
      continue
    }
    const match = line.match(re)
    if (!match) {
      continue
    }
    if (match[1] !== undefined) {
      section = unsafe(match[1])
      if (section === '__proto__') {
        // not allowed
        // keep parsing the section, but don't attach it.
        p = Object.create(null)
        continue
      }
      p = out[section] = out[section] || Object.create(null)
      continue
    }
    const keyRaw = unsafe(match[2])
    let isArray: boolean
    if (bracketedArray) {
      isArray = keyRaw.length > 2 && keyRaw.slice(-2) === '[]'
    } else {
      duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1
      isArray = duplicates[keyRaw] > 1
    }
    const key = isArray && keyRaw.endsWith('[]') ? keyRaw.slice(0, -2) : keyRaw

    if (key === '__proto__') {
      continue
    }
    const valueRaw = match[3] ? unsafe(match[4]) : true
    const value =
      valueRaw === 'true' || valueRaw === 'false' || valueRaw === 'null'
        ? JSON.parse(valueRaw)
        : valueRaw

    // Convert keys with '[]' suffix to an array
    if (isArray) {
      if (!hasOwn(p, key)) {
        p[key] = []
      } else if (!Array.isArray(p[key])) {
        p[key] = [p[key]]
      }
    }

    // safeguard against resetting a previously defined
    // array by accidentally forgetting the brackets
    if (Array.isArray(p[key])) {
      p[key].push(value)
    } else {
      p[key] = value
    }
  }

  // {a:{y:1},"a.b":{x:2}} --> {a:{y:1,b:{x:2}}}
  // use a filter to return the keys that have to be deleted.
  const remove: string[] = []

  for (const k of Object.keys(out)) {
    if (
      !hasOwn(out, k)
      || typeof out[k] !== 'object'
      || Array.isArray(out[k])
    ) {
      continue
    }

    // see if the parent section is also an object.
    // if so, add it to that, and mark this one for deletion
    const parts = splitSections(k, '.')
    p = out
    const l = parts.pop() || ''
    const nl = l.replace(/\\\./g, '.')
    for (const part of parts) {
      if (part === '__proto__') {
        continue
      }
      if (!hasOwn(p, part) || typeof p[part] !== 'object') {
        p[part] = Object.create(null)
      }
      p = p[part]
    }
    if (p === out && nl === l) {
      continue
    }

    p[nl] = out[k]
    remove.push(k)
  }

  for (const del of remove) {
    delete out[del]
  }

  return out as T
}

/**
 * alias of `decode`
 *
 * @see {@link decode}
 */
export const parse: typeof decode = decode
