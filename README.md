# ini-es

[![CI](https://github.com/ntnyq/ini-es/workflows/CI/badge.svg)](https://github.com/ntnyq/ini-es/actions)
[![NPM VERSION](https://img.shields.io/npm/v/ini-es.svg)](https://www.npmjs.com/package/ini-es)
[![NPM DOWNLOADS](https://img.shields.io/npm/dy/ini-es.svg)](https://www.npmjs.com/package/ini-es)
[![LICENSE](https://img.shields.io/github/license/ntnyq/ini-es.svg)](https://github.com/ntnyq/ini-es/blob/main/LICENSE)

ESM and TypeScript rewrite of [npm/ini](https://github.com/npm/ini).

## Features

- Rewritten in ESM and TypeScript, ships with type declarations
- Refactor all to pure functions, fully tree-shakable

## Install

```shell
npm install ini-es
```

```shell
yarn add ini-es
```

```shell
pnpm add ini-es
```

```shell
bun add ini-es
```

## Usage

```ts
import { encode, decode } from 'init-es'

const INI_SAMPLE = `
; This comment is being ignored
scope = global

[database]
user = db_user
password = db_password
database = use_this_database

[paths.default]
datadir = /var/lib/data
array[] = first value
array[] = second value
array[] = third value
`

const decoded = decode(INI_SAMPLE)

console.log(decoded)
// => object

const encoded = encode(decoded)

console.log(encoded)
// => ini string
```

## API

### encode

Encodes the given data object as an INI formatted string

- **Type**: `(obj: AnyObject, options: string | EncodeOptions = {}): string`

#### parameters

##### obj

- Type: `AnyObject`

Given data.

##### options

- Type: `AnyObject`
- Default: `{}`
- Required: `false`

Encode options.

### stringify

Alias of `encode`.

### decode

Attempts to turn the given INI string into a nested data object.

- **Type**: `<T extends AnyObject = AnyObject>(text: string, options: DecodeOptions = {}): T`

#### parameters

##### text

- Type: `string`

Ini string.

##### options

- Type: `AnyObject`
- Default: `{}`
- Required: `false`

Decode options.

### parse

Alias of `decode`.

## Interface

```ts
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

export interface DecodeOptions {
  /**
   * Whether to append `[]` to array keys.
   * Some parsers treat duplicate names by themselves as arrays
   *
   * @default true
   */
  bracketedArray?: boolean
}
```

## License

[MIT](./LICENSE) License © 2025-PRESENT [ntnyq](https://github.com/ntnyq)
