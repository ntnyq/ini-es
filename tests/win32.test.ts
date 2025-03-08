import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decode, encode } from '../src'

describe('group', () => {
  beforeEach(() => {
    vi.stubEnv('platform', 'win32')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('should match', () => {
    const encoded = encode({ foo: { bar: 'baz' } })

    expect(encoded).toMatchInlineSnapshot(`
      "[foo]
      bar=baz
      "
    `)

    expect(decode('=just junk!\r\n[foo]\r\nbar\r\n')).toMatchInlineSnapshot(`
      {
        "foo": {
          "bar": true,
        },
      }
    `)

    expect(decode('[x]\r\ny=1\r\ny[]=2\r\n')).toMatchInlineSnapshot(`
      {
        "x": {
          "y": [
            "1",
            "2",
          ],
        },
      }
    `)
  })
})
