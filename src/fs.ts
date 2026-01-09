import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { decode } from './decode'
import { stripBOM } from './utils'

/**
 * Asynchronously reads and parses an INI file.
 * @param filePath - path to INI file
 * @returns parsed INI data object
 */
export async function readIniFile(filePath: string) {
  const data = await readFile(filePath, 'utf-8')
  return parse(data)
}

/**
 * Synchronous version of {@link readIniFile}
 * @param filePath - path to INI file
 * @returns parsed INI data Object
 */
export function readIniFileSync(filePath: string) {
  const data = readFileSync(filePath, 'utf-8')
  return parse(data)
}

/**
 * Parses INI formatted string
 */
function parse(data: string) {
  return decode(stripBOM(data))
}
