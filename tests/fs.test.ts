import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { decode } from '../src'
import { readIniFile, readIniFileSync } from '../src/fs'
import fixtureFoo from './fixtures/foo.ini?raw'

const fixturePath = join(import.meta.dirname, 'fixtures', 'foo.ini')

describe('fs helpers', () => {
  it('readIniFile reads and decodes ini file asynchronously', async () => {
    const result = await readIniFile(fixturePath)

    expect(result).toStrictEqual(decode(fixtureFoo))
  })

  it('readIniFileSync reads and decodes ini file synchronously', () => {
    const result = readIniFileSync(fixturePath)

    expect(result).toStrictEqual(decode(fixtureFoo))
  })

  it('strips BOM before decoding ini content', async () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'ini-es-'))
    const bomFile = join(tempDir, 'bom.ini')

    writeFileSync(bomFile, '\uFEFF[section]\nkey=value')

    const asyncResult = await readIniFile(bomFile)
    const syncResult = readIniFileSync(bomFile)
    const expected = decode('[section]\nkey=value')

    expect(asyncResult).toStrictEqual(expected)
    expect(syncResult).toStrictEqual(expected)

    rmSync(tempDir, { force: true, recursive: true })
  })
})
