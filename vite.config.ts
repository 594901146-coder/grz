import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import JavaScriptObfuscator from 'javascript-obfuscator'
import { minify } from 'terser'
import { defineConfig, type Plugin } from 'vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))
const oceanSourceRoot = path.join(projectRoot, 'src', 'ocean-runtime')
const coreSources = ['shared.js', 'simulation.js']
const hostSources = ['renderer.js', 'bridge.js']

const oceanLicenseBanner = '/*! @license Ocean Wave Simulation core - Copyright (c) 2014 David Li - MIT; see /ocean/LICENSE */'

type OceanRuntime = {
  core: string
  host: string
}

async function readOceanSources(files: string[]) {
  return (await Promise.all(files.map((file) => readFile(path.join(oceanSourceRoot, file), 'utf8')))).join('\n;\n')
}

async function buildOceanRuntime(protectedBuild: boolean): Promise<OceanRuntime> {
  const [coreSource, hostSource] = await Promise.all([
    readOceanSources(coreSources),
    readOceanSources(hostSources),
  ])
  const fingerprint = createHash('sha256').update(hostSource).digest('hex').slice(0, 16)
  const hostBanner = `/*! @copyright Copyright (c) 2026 ZD. All rights reserved. ZD-OCEAN-FP:${fingerprint} */`

  if (!protectedBuild) {
    return {
      core: `${oceanLicenseBanner}\n${coreSource}`,
      host: `${hostBanner}\n${hostSource}`,
    }
  }

  const [coreResult, hostResult] = await Promise.all([
    minify(`${oceanLicenseBanner}\n${coreSource}`, {
      compress: { passes: 2 },
      mangle: { toplevel: false },
      sourceMap: false,
      format: { comments: /^!|@license|@preserve|@copyright/i },
    }),
    minify(hostSource, {
      compress: { passes: 2 },
      mangle: { toplevel: false },
      sourceMap: false,
      format: { comments: false },
    }),
  ])

  if (!coreResult.code || !hostResult.code) {
    throw new Error('Ocean runtime minification returned an empty result.')
  }

  const protectedHost = JavaScriptObfuscator.obfuscate(hostResult.code, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    renameGlobals: false,
    renameProperties: false,
    seed: Number.parseInt(fingerprint.slice(0, 8), 16),
    selfDefending: false,
    simplify: true,
    sourceMap: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75,
    transformObjectKeys: false,
    unicodeEscapeSequence: false,
  }).getObfuscatedCode()

  return {
    core: coreResult.code,
    host: `${hostBanner}\n${protectedHost}`,
  }
}

function oceanRuntimePlugin(): Plugin {
  return {
    name: 'zd-ocean-runtime',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = (request.url ?? '').split('?', 1)[0]
        const key = pathname === '/ocean/ocean-core.js'
          ? 'core'
          : pathname === '/ocean/ocean-host.js'
            ? 'host'
            : null
        if (!key) {
          next()
          return
        }

        void buildOceanRuntime(false).then((runtime) => {
          response.statusCode = 200
          response.setHeader('Content-Type', 'text/javascript; charset=utf-8')
          response.setHeader('Cache-Control', 'no-store')
          response.end(runtime[key])
        }).catch(next)
      })
    },
    async generateBundle() {
      const runtime = await buildOceanRuntime(true)
      this.emitFile({ type: 'asset', fileName: 'ocean/ocean-core.js', source: runtime.core })
      this.emitFile({ type: 'asset', fileName: 'ocean/ocean-host.js', source: runtime.host })
    },
  }
}

export default defineConfig({
  plugins: [react(), oceanRuntimePlugin()],
  build: {
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
      },
      mangle: true,
      format: {
        comments: /^!|@license|@preserve|@copyright/i,
      },
    },
  },
})
