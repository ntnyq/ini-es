import {
  ARRAY_SUFFIX,
  EMPTY_OR_COMMENT_RE,
  LINE_RE,
  LINE_SPLIT_RE,
  PROTO_KEY,
  SECTION_SEPARATOR,
} from './constants'
import type { AnyObject, ParsedLine } from './types'
import { unsafe } from './unsafe'
import { hasOwn, parseJsonLiteral, splitSections } from './utils'

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
 * Parses one INI line into a normalized intermediate record.
 *
 * @param line - raw line text
 * @returns parsed section/entry record when line is meaningful
 */
function parseLine(line: string): ParsedLine | undefined {
  if (!line || EMPTY_OR_COMMENT_RE.test(line)) {
    return
  }

  const match = line.match(LINE_RE)
  if (!match?.groups) {
    return
  }

  const { section, key, value } = match.groups
  if (section !== undefined) {
    return {
      type: 'section',
      section: unsafe(section),
    }
  }

  if (key === undefined) {
    return
  }

  return {
    type: 'entry',
    keyRaw: unsafe(key),
    hasValue: value !== undefined,
    valueRaw: value ?? '',
  }
}

/**
 * Resolves the mutable object pointer for a decoded section.
 *
 * @param out - decode output object
 * @param section - decoded section name
 * @returns object to receive parsed key/value entries
 */
function getSectionPointer(out: AnyObject, section: string): AnyObject {
  if (section === PROTO_KEY) {
    return Object.create(null)
  }

  const sectionValue = out[section] || Object.create(null)
  out[section] = sectionValue
  return sectionValue
}

/**
 * Determines whether a parsed key should map to an array and returns normalized key text.
 *
 * @param keyRaw - raw decoded key text
 * @param bracketedArray - whether `[]` controls array behavior
 * @param duplicates - per-section duplicate counter map
 * @returns normalized key and array flag
 */
function resolveArrayKey(
  keyRaw: string,
  bracketedArray: boolean,
  duplicates: Record<string, any>,
): { key: string; isArray: boolean } {
  let isArray = false
  if (bracketedArray) {
    isArray =
      keyRaw.length > ARRAY_SUFFIX.length && keyRaw.endsWith(ARRAY_SUFFIX)
  } else {
    duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1
    isArray = duplicates[keyRaw] > 1
  }

  return {
    isArray,
    key:
      isArray && keyRaw.endsWith(ARRAY_SUFFIX)
        ? keyRaw.slice(0, -ARRAY_SUFFIX.length)
        : keyRaw,
  }
}

/**
 * Parameters for assigning one decoded key/value record.
 */
interface AssignValueParams {
  /** Current section object receiving values. */
  target: AnyObject
  /** Final key name after array normalization. */
  key: string
  /** Parsed scalar value to assign. */
  value: unknown
  /** Whether key should be represented as an array. */
  isArray: boolean
}

/**
 * Assigns a decoded value onto the target object while preserving array semantics.
 *
 * @param params - assignment context
 */
function assignValue({ target, key, value, isArray }: AssignValueParams): void {
  if (isArray) {
    if (!hasOwn(target, key)) {
      target[key] = []
    } else if (!Array.isArray(target[key])) {
      target[key] = [target[key]]
    }
  }

  if (Array.isArray(target[key])) {
    target[key].push(value)
    return
  }

  target[key] = value
}

/**
 * Merges dotted section keys into nested object paths.
 *
 * @param out - decode output object to normalize in-place
 */
function mergeNestedSections(out: AnyObject): void {
  const remove: string[] = []

  for (const k of Object.keys(out)) {
    if (
      !hasOwn(out, k) ||
      typeof out[k] !== 'object' ||
      Array.isArray(out[k])
    ) {
      continue
    }

    const parts = splitSections(k, SECTION_SEPARATOR)
    let parent: AnyObject = out
    const leaf = parts.pop() || ''
    const normalizedLeaf = leaf.replaceAll(
      `\\${SECTION_SEPARATOR}`,
      SECTION_SEPARATOR,
    )

    for (const part of parts) {
      if (part === PROTO_KEY) {
        continue
      }
      if (!hasOwn(parent, part) || typeof parent[part] !== 'object') {
        parent[part] = Object.create(null)
      }
      parent = parent[part]
    }

    if (parent === out && normalizedLeaf === leaf) {
      continue
    }

    parent[normalizedLeaf] = out[k]
    remove.push(k)
  }

  for (const del of remove) {
    delete out[del]
  }
}

/**
 * Attempts to turn the given INI string into a nested data object.
 *
 * @param text - ini string
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
  const lines = text.split(LINE_SPLIT_RE)
  let duplicates: Record<string, any> = Object.create(null)

  for (const line of lines) {
    const parsed = parseLine(line)
    if (!parsed) {
      continue
    }

    if (parsed.type === 'section') {
      duplicates = Object.create(null)
      p = getSectionPointer(out, parsed.section)
      continue
    }

    const { key, isArray } = resolveArrayKey(
      parsed.keyRaw,
      bracketedArray,
      duplicates,
    )

    if (key === PROTO_KEY) {
      continue
    }

    const value = parsed.hasValue
      ? parseJsonLiteral(unsafe(parsed.valueRaw))
      : true
    assignValue({
      target: p,
      key,
      value,
      isArray,
    })
  }

  mergeNestedSections(out)

  return out as T
}

/**
 * Alias of `decode`
 *
 * @see {@link decode}
 */
export const parse: typeof decode = decode
