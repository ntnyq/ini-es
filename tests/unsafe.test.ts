import { expect, it } from 'vitest'
import { unsafe } from '../src'

it('unsafe', () => {
  expect(unsafe('')).toBe('')
  expect(unsafe('x;y')).toBe('x')
  expect(unsafe('x  # y')).toBe('x')
  expect(unsafe('x "\\')).toBe('x "\\')
})
