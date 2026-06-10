import { spawn } from 'child_process'
import { existsSync } from 'fs'
import { join, resolve } from 'path'
import { getHermesBaseDir } from '../../services/hermes/hermes-profile'
import { logger } from '../../services/logger'

/**
 * Portable install root. start.bat sets HERMES_HOME = <root>/data/hermes,
 * so the root is two levels up from the hermes base dir. The browser\ folder
 * (launchers + detect-chrome) lives at <root>/browser.
 */
function portableRoot(): string {
  const home = process.env.HERMES_HOME || getHermesBaseDir()
  return resolve(home, '..', '..')
}

/**
 * POST /api/hermes/browser/launch  { port?: number }
 *
 * Fire-and-forget trigger for the fork-owned launcher
 * browser/launch-login-cdp.bat, which: probes the CDP port; connects to an
 * already-running browser if present; otherwise launches a visible Chrome on
 * the persistent login profile; and always writes browser.cdp_url into config.
 * The frontend confirms the result by polling browser status afterwards.
 */
export async function launchBrowser(ctx: any) {
  const body = (ctx.request.body || {}) as { port?: number | string; chromePath?: string }
  const port = Number(body.port) || 9222
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    ctx.status = 400
    ctx.body = { error: 'invalid port' }
    return
  }
  const chromePath = typeof body.chromePath === 'string' ? body.chromePath.trim() : ''

  const root = portableRoot()
  const browserDir = join(root, 'browser')
  const bat = join(browserDir, 'launch-login-cdp.bat')
  if (!existsSync(bat)) {
    ctx.status = 500
    ctx.body = { error: `browser launcher not found at ${bat}` }
    return
  }

  try {
    const env: NodeJS.ProcessEnv = { ...process.env, CDP_PORT: String(port) }
    if (chromePath) env.CHROME_EXE = chromePath
    const child = spawn('cmd.exe', ['/c', bat], {
      cwd: browserDir,
      env,
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    })
    child.unref()
    logger.info('[browser] launch-login-cdp triggered port=%d', port)
    ctx.body = { success: true, port, cdpUrl: `http://127.0.0.1:${port}` }
  } catch (err: any) {
    logger.error(err, '[browser] failed to spawn launcher')
    ctx.status = 500
    ctx.body = { error: err?.message || 'failed to launch browser' }
  }
}
