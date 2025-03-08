import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { encode, parse, stringify } from '../src'
import { FIXTURE_DUPLICATED, FIXTURE_FOO } from './fixtures'

const parsedFoo = parse(FIXTURE_FOO)
const parsedDuplicated = parse(FIXTURE_DUPLICATED)

const encodeFoo = encode(parsedFoo)
const stringifyFoo = stringify(parsedFoo)
const encodeDuplicated = encode(parsedDuplicated)
const stringifyDuplicated = stringify(parsedDuplicated)

const FIXTURE_OBJECT = {
  log: {
    level: { label: 'debug', value: 10 },
    type: 'file',
    user: { age: 100 },
  },
}

it('encode foo', () => {
  expect(encodeFoo).toMatchSnapshot()
})

it('encode duplicated', () => {
  expect(encodeDuplicated).toMatchSnapshot()
})

it('stringify is alias of encode', () => {
  expect(stringifyFoo).toBe(encodeFoo)
  expect(stringifyDuplicated).toBe(encodeDuplicated)
})

it('never a blank first of last line', () => {
  const encodedObject = encode(FIXTURE_OBJECT)

  expect(encodedObject.slice(0, 1)).not.toBe('\n')
  expect(encodedObject.slice(-2)).not.toBe('\n\n')
})

it('encode with options', () => {
  expect(encode(FIXTURE_OBJECT, { section: 'prefix' })).toMatchInlineSnapshot(`
    "[prefix.log]
    type=file

    [prefix.log.level]
    label=debug
    value=10

    [prefix.log.user]
    age=100
    "
  `)
})

it('encode with whitespace', () => {
  expect(encode(FIXTURE_OBJECT, { whitespace: true })).toMatchInlineSnapshot(`
    "[log]
    type = file

    [log.level]
    label = debug
    value = 10

    [log.user]
    age = 100
    "
  `)
})

it('encode with newline', () => {
  expect(encode(FIXTURE_OBJECT, { newline: true })).toMatchInlineSnapshot(`
    "[log]

    type=file

    [log.level]

    label=debug
    value=10

    [log.user]

    age=100
    "
  `)
})

it('encode with align', () => {
  expect(encode(FIXTURE_OBJECT, { align: true })).toMatchInlineSnapshot(`
    "[log]
    type = file

    [log.level]
    label = debug
    value = 10

    [log.user]
    age = 100
    "
  `)
})

it('encode with sort', () => {
  expect(encode(FIXTURE_OBJECT, { sort: true })).toMatchInlineSnapshot(`
    "[log]
    type=file

    [log.level]
    label=debug
    value=10

    [log.user]
    age=100
    "
  `)
})

it('encode with align and sort', () => {
  expect(encode(FIXTURE_OBJECT, { align: true, sort: true }))
    .toMatchInlineSnapshot(`
      "[log]
      type = file

      [log.level]
      label = debug
      value = 10

      [log.user]
      age = 100
      "
    `)
})

it('encode with platform-win32', () => {
  expect(encode(FIXTURE_OBJECT, { platform: 'win32' })).toMatchInlineSnapshot(`
    "[log]
    type=file

    [log.level]
    label=debug
    value=10

    [log.user]
    age=100
    "
  `)
})

describe('browser', () => {
  beforeEach(() => {
    vi.stubEnv('platform', undefined)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('encode with platform-undefined', () => {
    expect(encode(FIXTURE_OBJECT)).toMatchInlineSnapshot(`
    "[log]
    type=file

    [log.level]
    label=debug
    value=10

    [log.user]
    age=100
    "
  `)
  })
})
