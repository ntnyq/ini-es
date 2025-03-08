import { expect, it } from 'vitest'
import { decode, parse } from '../src'
import { FIXTURE_DUPLICATED, FIXTURE_FOO } from './fixtures'

const parsedFoo = parse(FIXTURE_FOO)
const decodedFoo = decode(FIXTURE_FOO)

const parsedDuplicated = parse(FIXTURE_DUPLICATED)
const decodedDuplicated = parse(FIXTURE_DUPLICATED)

it('decode foo', () => {
  expect(decodedFoo).toMatchSnapshot()
})

it('decode duplicated', () => {
  expect(decodedDuplicated).toMatchSnapshot()
})

it('parse is alias of decode', () => {
  expect(parsedFoo).toStrictEqual(decodedFoo)
  expect(parsedDuplicated).toStrictEqual(decodedDuplicated)
})

it('decode foo - bracketedArray', () => {
  expect(
    decode(FIXTURE_FOO, {
      bracketedArray: false,
    }),
  ).toMatchSnapshot()
})
