/**
 * Generic object map used by the parser/encoder internals.
 */
export type AnyObject = Record<string, any>

/**
 * Supported Node.js platform values for line-ending selection.
 */
export type Platform =
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
 * Parsed representation of one non-empty INI line.
 */
export type ParsedLine =
  | {
      /** Line declares a section header. */
      type: 'section'
      /** Decoded section name. */
      section: string
    }
  | {
      /** Line declares a key/value entry. */
      type: 'entry'
      /** Decoded raw key text. */
      keyRaw: string
      /** Whether the entry includes an explicit value part. */
      hasValue: boolean
      /** Raw value content before unescaping and literal conversion. */
      valueRaw: string
    }

/**
 * Fully-resolved encode options with defaults applied.
 */
export interface NormalizedEncodeOptions {
  /** Whether `=` should align in each rendered section. */
  align: boolean
  /** Whether arrays are rendered with `[]` suffixes. */
  bracketedArray: boolean
  /** Whether section headers are followed by an empty line. */
  newline: boolean
  /** Platform used for line-ending generation. */
  platform: Platform | undefined
  /** Current nested section path while encoding. */
  section: string | undefined
  /** Whether keys are sorted alphabetically. */
  sort: boolean
  /** Whether separators are rendered as ` = ` instead of `=`. */
  whitespace: boolean
}

/**
 * Rendering context used while emitting key/value entry lines.
 */
export interface EncodeLayoutContext {
  /** Suffix added to array keys. */
  arraySuffix: string
  /** Key/value separator token. */
  separator: string
  /** End-of-line marker for current platform. */
  eol: string
  /** Width for key padding when alignment is enabled. */
  padToChars: number
}
