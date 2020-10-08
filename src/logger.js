import pino from 'pino'
import { fileURLToPath } from 'url'
import { dirname, relative } from 'path'

const root = dirname(fileURLToPath(import.meta.url))

export default function logger({ url }) {
  return pino({
    base: { name: relative(root, fileURLToPath(url)).slice(0, -3) },
  })
}
