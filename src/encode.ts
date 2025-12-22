import { safe } from './safe'
import { splitSections } from './utils'
import type { AnyObject } from './types'

export interface EncodeOptions {
  /**
   * Whether to align the `=` character for each section.
   *
   * -> Also enables the `whitespace` option
   *
   * @default false
   */
  align?: boolean

  /**
   * Whether to append `[]` to array keys.
   *
   * Some parsers treat duplicate names by themselves as arrays
   *
   * @default true
   */
  bracketedArray?: boolean

  /**
   * Whether to insert a newline after each section header.
   *
   * The TOSHIBA & FlashAir parser require this format.
   *
   * @default false
   */
  newline?: boolean

  /**
   * Which platforms line-endings should be used.
   *
   * win32 -> CR+LF
   * other -> LF
   *
   * Default is the current platform
   *
   * @default process.platform
   */
  platform?: Platform

  /**
   * Specify section to decode
   */
  section?: string

  /**
   * Whether to sort all sections & their keys alphabetically.
   *
   * @default false
   */
  sort?: boolean

  /**
   * Whether to insert spaces before & after `=`
   *
   * Disabled by default to have better
   * compatibility with old picky parsers.
   *
   * @default false
   */
  whitespace?: boolean
}

/**
 * Type of `process.platform`
 */
type Platform =
  | 'aix'
  | 'android'
  | 'cygwin'
  | 'darwin'
  | 'freebsd'
  | 'haiku'
  | 'linux'
  | 'netbsd'
  | 'openbsd'
  | 'sunos'
  | 'win32'

/**
 * Encodes the given data object as an INI formatted string
 *
 * @param obj - given data
 * @param options - encode options {@link EncodeOptions}
 * @returns formatted string
 */
export function encode(
  obj: AnyObject,
  options: string | EncodeOptions = {},
): string {
  if (typeof options === 'string') {
    options = {
      section: options,
    }
  }

  const {
    align = false,
    bracketedArray = true,
    newline = false,
    // @ts-expect-error process may be undefined in some environments
    platform = typeof process == 'undefined' ? undefined : process.platform,
    section,
    sort = false,
    whitespace = options.align || false,
  } = options

  const eol = platform === 'win32' ? '\r\n' : '\n'
  const separator = whitespace ? ' = ' : '='
  const children: string[] = []

  const keys = sort ? Object.keys(obj).sort() : Object.keys(obj)

  let padToChars = 0
  // If aligning on the separator, then padToChars is determined as follows:
  // 1. Get the keys
  // 2. Exclude keys pointing to objects unless the value is null or an array
  // 3. Add `[]` to array keys
  // 4. Ensure non empty set of keys
  // 5. Reduce the set to the longest `safe` key
  // 6. Get the `safe` length
  if (align) {
    padToChars = safe(
      keys
        .filter(
          k =>
            obj[k] === null
            || Array.isArray(obj[k])
            || typeof obj[k] !== 'object',
        )
        .map(k => (Array.isArray(obj[k]) ? `${k}[]` : k))
        .concat([''])
        .reduce((a, b) => (safe(a).length >= safe(b).length ? a : b)),
    ).length
  }

  let out = ''
  const arraySuffix = bracketedArray ? '[]' : ''

  for (const k of keys) {
    const val = obj[k]
    if (val && Array.isArray(val)) {
      for (const item of val) {
        out +=
          safe(`${k}${arraySuffix}`).padEnd(padToChars, ' ')
          + separator
          + safe(item)
          + eol
      }
    } else if (val && typeof val === 'object') {
      children.push(k)
    } else {
      out += safe(k).padEnd(padToChars, ' ') + separator + safe(val) + eol
    }
  }

  if (section && out.length) {
    out = `[${safe(section)}]${newline ? eol + eol : eol}${out}`
  }

  for (const k of children) {
    const nk = splitSections(k, '.').join('\\.')
    const newSection = (section ? `${section}.` : '') + nk
    const child = encode(obj[k], {
      align,
      bracketedArray,
      newline,
      platform,
      section: newSection,
      sort,
      whitespace,
    })
    if (out.length && child.length) {
      out += eol
    }

    out += child
  }

  return out
}

/**
 * alias of `encode`
 *
 * @see {@link encode}
 */
export const stringify: typeof encode = encode
