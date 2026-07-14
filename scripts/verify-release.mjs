import { access, readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(projectRoot, 'dist')
const requiredFiles = [
  'index.html',
  'ocean/LICENSE',
  'ocean/embed.css',
  'ocean/index.html',
  'ocean/ocean-core.js',
  'ocean/ocean-host.js',
]
const forbiddenBasenames = new Set([
  'bridge.js',
  'ocean-worker.js',
  'renderer.js',
  'shared.js',
  'simulation.js',
  'ui.js',
  'waves.css',
  'waves.js',
])

async function walk(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const relativePath = path.posix.join(prefix, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walk(path.join(directory, entry.name), relativePath))
    } else {
      files.push(relativePath)
    }
  }
  return files
}

await access(distRoot).catch(() => {
  throw new Error('dist/ is missing. Run npm run build before verify:release.')
})

const files = await walk(distRoot)
const failures = []
for (const required of requiredFiles) {
  if (!files.includes(required)) failures.push(`Missing required release file: ${required}`)
}
for (const file of files) {
  if (file.endsWith('.map')) failures.push(`Source map must not be published: ${file}`)
  if (forbiddenBasenames.has(path.posix.basename(file))) failures.push(`Raw ocean source must not be published: ${file}`)
}

const [core, host, license] = await Promise.all([
  readFile(path.join(distRoot, 'ocean', 'ocean-core.js'), 'utf8'),
  readFile(path.join(distRoot, 'ocean', 'ocean-host.js'), 'utf8'),
  readFile(path.join(distRoot, 'ocean', 'LICENSE'), 'utf8'),
])
const fingerprint = host.match(/ZD-OCEAN-FP:([a-f0-9]{16})/i)?.[1]

if (!core.includes('@license Ocean Wave Simulation core')) failures.push('Ocean core license banner is missing.')
if (!license.includes('The MIT License')) failures.push('The distributed ocean MIT license is incomplete.')
if (!fingerprint) failures.push('Protected ocean host fingerprint is missing.')
if (host.includes('var OceanRenderer = function (canvas')) failures.push('Ocean host appears to contain unprotected source.')

if (failures.length > 0) {
  for (const failure of failures) console.error(`ERROR: ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Release verification passed: ${files.length} files, ocean fingerprint ${fingerprint}.`)
}
