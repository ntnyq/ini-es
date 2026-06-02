import { ARRAY_SUFFIX, EOL_CRLF, EOL_LF, SECTION_SEPARATOR } from './constants'
import { safe } from './safe'
import type {
  AnyObject,
  EncodeLayoutContext,
  NormalizedEncodeOptions,
  Platform,
} from './types'
import { splitSections } from './utils'

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
 * Applies defaults and shorthand normalization for encode options.
 *
 * @param options - user-provided encode options or section shorthand
 * @returns normalized options consumed by the encoder internals
 */
function normalizeOptions(
  options: string | EncodeOptions,
): NormalizedEncodeOptions {
  const parsedOptions =
    typeof options === 'string'
      ? {
          section: options,
        }
      : options

  return {
    align: parsedOptions.align ?? false,
    bracketedArray: parsedOptions.bracketedArray ?? true,
    newline: parsedOptions.newline ?? false,
    platform:
      parsedOptions.platform ??
      (typeof process === 'undefined'
        ? undefined
        : (process.platform as Platform)),
    section: parsedOptions.section,
    sort: parsedOptions.sort ?? false,
    whitespace: parsedOptions.whitespace ?? parsedOptions.align ?? false,
  }
}

/**
 * Calculates key padding width required for aligned separators.
 *
 * @param obj - source object being encoded
 * @param keys - selected key list for current section
 * @param options - alignment-related options subset
 * @returns max rendered key width or 0 when alignment is disabled
 */
function getPadToChars(
  obj: AnyObject,
  keys: string[],
  options: Pick<NormalizedEncodeOptions, 'align'> &
    Pick<EncodeLayoutContext, 'arraySuffix'>,
): number {
  if (!options.align) {
    return 0
  }

  return safe(
    keys
      .filter(
        k =>
          obj[k] === null ||
          Array.isArray(obj[k]) ||
          typeof obj[k] !== 'object',
      )
      .map(k => (Array.isArray(obj[k]) ? `${k}${options.arraySuffix}` : k))
      .concat([''])
      .reduce((a, b) => (safe(a).length >= safe(b).length ? a : b)),
  ).length
}

/**
 * Encodes primitive and array entries for one section and collects nested children.
 *
 * @param obj - current section object
 * @param keys - key list to encode
 * @param context - rendering layout context
 * @returns encoded section output and child object keys
 */
function encodeEntries(
  obj: AnyObject,
  keys: string[],
  context: EncodeLayoutContext,
): { out: string; children: string[] } {
  let out = ''
  const children: string[] = []

  for (const k of keys) {
    const val = obj[k]
    if (val && Array.isArray(val)) {
      for (const item of val) {
        out +=
          safe(`${k}${context.arraySuffix}`).padEnd(context.padToChars, ' ') +
          context.separator +
          safe(item) +
          context.eol
      }
      continue
    }

    if (val && typeof val === 'object') {
      children.push(k)
      continue
    }

    out +=
      safe(k).padEnd(context.padToChars, ' ') +
      context.separator +
      safe(val) +
      context.eol
  }

  return {
    out,
    children,
  }
}

/**
 * Parameters used while encoding nested child sections.
 */
interface EncodeChildSectionsParams {
  /** Current object whose child objects will be recursively encoded. */
  obj: AnyObject
  /** Child keys collected from current section. */
  children: string[]
  /** Normalized parent options to carry into recursion. */
  options: NormalizedEncodeOptions
  /** End-of-line marker for current platform. */
  eol: string
  /** Current accumulated output. */
  out: string
}

/**
 * Encodes nested object sections and appends them to the current output.
 *
 * @param params - recursion context
 * @param encodeChild - callback used to encode each child object
 * @returns full output including child sections
 */
function encodeChildSections(
  params: EncodeChildSectionsParams,
  encodeChild: (value: AnyObject, section: string) => string,
): string {
  let result = params.out

  for (const k of params.children) {
    const nk = splitSections(k, SECTION_SEPARATOR).join(String.raw`\.`)
    const newSection =
      (params.options.section
        ? `${params.options.section}${SECTION_SEPARATOR}`
        : '') + nk
    const child = encodeChild(params.obj[k], newSection)
    if (result.length > 0 && child.length > 0) {
      result += params.eol
    }

    result += child
  }

  return result
}

/**
 * Builds recursive options for one child section branch.
 *
 * @param options - normalized parent options
 * @param section - child section path
 * @returns EncodeOptions object for recursive call
 */
function buildChildOptions(
  options: NormalizedEncodeOptions,
  section: string,
): EncodeOptions {
  return {
    align: options.align,
    bracketedArray: options.bracketedArray,
    newline: options.newline,
    platform: options.platform,
    section,
    sort: options.sort,
    whitespace: options.whitespace,
  }
}
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
  const normalized = normalizeOptions(options)

  const eol = normalized.platform === 'win32' ? EOL_CRLF : EOL_LF
  const separator = normalized.whitespace ? ' = ' : '='

  const keys = normalized.sort ? Object.keys(obj).toSorted() : Object.keys(obj)
  const arraySuffix = normalized.bracketedArray ? ARRAY_SUFFIX : ''
  const padToChars = getPadToChars(obj, keys, {
    align: normalized.align,
    arraySuffix,
  })
  const { out: sectionOut, children } = encodeEntries(obj, keys, {
    arraySuffix,
    separator,
    eol,
    padToChars,
  })

  let out = sectionOut

  if (normalized.section && out.length > 0) {
    out = `[${safe(normalized.section)}]${normalized.newline ? eol + eol : eol}${out}`
  }

  return encodeChildSections(
    {
      obj,
      children,
      options: normalized,
      eol,
      out,
    },
    (value, section) => encode(value, buildChildOptions(normalized, section)),
  )
}

/**
 * Alias of `encode`
 *
 * @see {@link encode}
 */
export const stringify: typeof encode = encode
