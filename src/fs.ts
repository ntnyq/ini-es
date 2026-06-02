import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { decode } from './decode'
import type { AnyObject } from './types'
import { stripBOM } from './utils'

/**
 * Parses INI text into a plain object after stripping BOM.
 *
 * @param data - raw INI file content
 * @returns parsed object tree
 */
function parse(data: string): AnyObject {
  return decode(stripBOM(data))
}

/**
 * Asynchronously reads and parses an INI file.
 * @param filePath - path to INI file
 * @returns parsed INI data object
 */
export async function readIniFile(filePath: string): Promise<AnyObject> {
  const data = await readFile(filePath, 'utf8')
  return parse(data)
}

/**
 * Synchronous version of {@link readIniFile}
 * @param filePath - path to INI file
 * @returns parsed INI data Object
 */
export function readIniFileSync(filePath: string): AnyObject {
  const data = readFileSync(filePath, 'utf8')
  return parse(data)
}
