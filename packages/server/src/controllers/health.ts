import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import * as hermesCli from '../services/hermes/hermes-cli'

declare const __APP_VERSION__: string

type PackageInfo = {
  name: string
  version: string
  repositoryUrl?: string
}

function readPackageInfo(): PackageInfo | null {
  const candidatePaths = [
    // ts-node dev: packages/server/src/controllers -> repo root
    resolve(__dirname, '../../../../package.json'),
    // bundled server: dist/server -> repo root/package root
    resolve(__dirname, '../../package.json'),
    // fallback for dev/test processes started at the repo root
    resolve(process.cwd(), 'package.json'),
  ]

  for (const packagePath of candidatePaths) {
    if (!existsSync(packagePath)) continue

    try {
      const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'))
      if (pkg?.name && pkg?.version) {
        const repository = typeof pkg.repository === 'string'
          ? pkg.repository
          : typeof pkg.repository?.url === 'string'
            ? pkg.repository.url
            : ''
        return {
          name: String(pkg.name),
          version: String(pkg.version),
          repositoryUrl: repository,
        }
      }
    } catch {
      // Try the next candidate path.
    }
  }

  return null
}

/**
 * Parse the GitHub owner/repo from the package.json repository URL so the
 * portable build checks the configured fork's GitHub Releases for updates
 * instead of the public npm registry (the official update path is disconnected).
 */
function getGithubRepoParts(): { owner: string; repo: string } | null {
  const raw = (PACKAGE_INFO?.repositoryUrl || '').trim()
  if (!raw) return null
  const normalized = raw
    .replace(/^git\+/, '')
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '')
  const match = normalized.match(/github\.com\/([^/]+)\/([^/]+)$/)
  return match ? { owner: match[1], repo: match[2] } : null
}

const PACKAGE_INFO = readPackageInfo()
const LOCAL_VERSION = typeof __APP_VERSION__ !== 'undefined'
  ? __APP_VERSION__
  : PACKAGE_INFO?.version || ''

let cachedLatestVersion = ''

/**
 * Whether the periodic version check is disabled.
 *
 * The portable build checks the configured fork's GitHub Releases for a newer
 * version. Disable this when you don't want the "update available" prompt or the
 * periodic outbound request (e.g. a locked-down or offline distribution).
 *
 * Set HERMES_WEB_UI_DISABLE_UPDATE_CHECK=true (or 1, on, yes) to disable.
 */
function isUpdateCheckDisabled(): boolean {
  const raw = (process.env.HERMES_WEB_UI_DISABLE_UPDATE_CHECK || '').trim().toLowerCase()
  return raw === 'true' || raw === '1' || raw === 'on' || raw === 'yes'
}

export async function checkLatestVersion(): Promise<void> {
  if (isUpdateCheckDisabled()) return
  // Portable build: the official `npm i -g hermes-web-ui@latest` update path is
  // disconnected, so the "update available" prompt is driven by the configured
  // fork's GitHub Releases (handleUpdate downloads the matching release asset).
  const repo = getGithubRepoParts()
  if (!repo) return
  try {
    const res = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}/releases/latest`, {
      headers: { 'User-Agent': 'hermes-web-ui-update', Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(10000),
    })
    if (res.ok) {
      const data = await res.json() as { tag_name?: string }
      const latest = (data.tag_name || '').replace(/^v/i, '')
      if (latest) {
        cachedLatestVersion = latest
        if (LOCAL_VERSION && cachedLatestVersion !== LOCAL_VERSION) {
          console.log(`Update available: ${LOCAL_VERSION} → ${cachedLatestVersion}`)
        }
      }
    }
    // 404 (no releases yet) leaves cachedLatestVersion empty -> no false prompt.
  } catch { /* ignore */ }
}

export function startVersionCheck(): void {
  if (isUpdateCheckDisabled()) return
  setTimeout(checkLatestVersion, 5000)
  setInterval(checkLatestVersion, 30 * 60 * 1000)
}

export async function healthCheck(ctx: any) {
  const raw = await hermesCli.getVersion()
  const hermesVersion = raw.split('\n')[0].replace('Hermes Agent ', '') || ''
  ctx.body = {
    status: 'ok',
    platform: 'hermes-agent',
    version: hermesVersion,
    gateway: 'running',
    webui_version: LOCAL_VERSION,
    webui_latest: isUpdateCheckDisabled() ? '' : cachedLatestVersion,
    webui_update_available: isUpdateCheckDisabled()
      ? false
      : Boolean(LOCAL_VERSION && cachedLatestVersion && cachedLatestVersion !== LOCAL_VERSION),
    node_version: process.versions.node,
  }
}
