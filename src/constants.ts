/**
 * Internal key that must never be assigned to prevent prototype pollution.
 */
export const PROTO_KEY = '__proto__'

/**
 * Suffix indicating an array key in INI notation.
 */
export const ARRAY_SUFFIX = '[]'

/**
 * Logical separator used between nested section path segments.
 */
export const SECTION_SEPARATOR = '.'

/**
 * Comment marker characters recognized by INI syntax.
 */
export const COMMENT_PREFIXES = ';#'

/**
 * Regular expression matching section headers and key/value lines.
 */
export const LINE_RE =
  /^\[(?<section>[^\]]*)\]\s*$|^(?<key>[^=]+)(?:=(?<value>.*))?$/u

/**
 * Regular expression used to split text into INI lines.
 */
export const LINE_SPLIT_RE = /[\r\n]+/gu

/**
 * Regular expression matching empty lines or comment-only lines.
 */
export const EMPTY_OR_COMMENT_RE = /^\s*(?:[;#].*)?$/u

/**
 * Literal tokens parsed via JSON semantics.
 */
export const JSON_LITERAL_VALUES = ['true', 'false', 'null'] as const

/**
 * Unicode BOM code point stripped from file input.
 */
export const BOM_CODE_POINT = 0xfe_ff

/**
 * Windows CRLF line ending.
 */
export const EOL_CRLF = '\r\n'

/**
 * Unix LF line ending.
 */
export const EOL_LF = '\n'
