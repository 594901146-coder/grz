import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = path.join(projectRoot, 'dist')
const sourceFiles = [
  'src/ocean-runtime/shared.js',
  'src/ocean-runtime/simulation.js',
  'src/ocean-runtime/renderer.js',
  'src/ocean-runtime/bridge.js',
  'src/components/HeroScene/HeroScene.tsx',
  'src/pages/HomePage.tsx',
  'src/styles.css',
  'vite.config.ts',
  'vercel.json',
]

const sha256 = (content) => createHash('sha256').update(content).digest('hex')

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

async function hashFiles(root, files) {
  return Promise.all(files.map(async (file) => {
    const content = await readFile(path.join(root, file))
    return { file, bytes: content.byteLength, sha256: sha256(content) }
  }))
}

const git = (args, fallback = 'unknown') => {
  try {
    return execFileSync('git', args, { cwd: projectRoot, encoding: 'utf8' }).trim()
  } catch {
    return fallback
  }
}

const createdAt = new Date().toISOString()
const outputFiles = await walk(distRoot)
const host = await readFile(path.join(distRoot, 'ocean', 'ocean-host.js'), 'utf8')
const oceanFingerprint = host.match(/ZD-OCEAN-FP:([a-f0-9]{16})/i)?.[1] ?? 'missing'
const manifest = {
  schemaVersion: 1,
  owner: 'ZD',
  notice: 'Original site design, content, integration, and interaction code. Third-party ocean core remains MIT licensed.',
  createdAt,
  git: {
    commit: git(['rev-parse', 'HEAD']),
    branch: git(['branch', '--show-current']),
    dirty: git(['status', '--porcelain'], '').length > 0,
  },
  oceanFingerprint,
  sourceFiles: await hashFiles(projectRoot, sourceFiles),
  outputFiles: await hashFiles(distRoot, outputFiles),
}

const outputDirectory = path.join(projectRoot, 'output', 'provenance')
const safeTimestamp = createdAt.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
const shortCommit = manifest.git.commit === 'unknown' ? 'unknown' : manifest.git.commit.slice(0, 12)
const outputPath = path.join(outputDirectory, `${safeTimestamp}-${shortCommit}.json`)
await mkdir(outputDirectory, { recursive: true })
await writeFile(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
console.log(`Provenance manifest written to ${path.relative(projectRoot, outputPath)}.`)
