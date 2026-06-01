import { spawn, type ChildProcess } from 'child_process'
import { logger } from './logger'

// Manages the cloudflared quick tunnel lifecycle from inside the web server so
// the "external pairing" feature can start/stop it and read its public URL.
//
// Configured via env (set by the portable start.bat):
//   HERMES_TUNNEL_CLOUDFLARED  absolute path to cloudflared(.exe)
//   HERMES_TUNNEL_CONFIG       optional path to an isolated quick-tunnel config
//                              (cf-quick.yml) so cloudflared does NOT read the
//                              user's production ~/.cloudflared/config.yml
//   PORT                       local web-ui port to expose (default 8648)

const URL_RE = /https:\/\/[-a-z0-9]+\.trycloudflare\.com/i

let proc: ChildProcess | null = null
let publicUrl = ''
let startPromise: Promise<string> | null = null

export interface TunnelState {
  running: boolean
  url: string
}

export function getTunnelState(): TunnelState {
  return { running: !!proc && !proc.killed, url: publicUrl }
}

export function isTunnelConfigured(): boolean {
  return !!process.env.HERMES_TUNNEL_CLOUDFLARED
}

export function stopTunnel(): void {
  if (proc && !proc.killed) {
    try { proc.kill() } catch { /* ignore */ }
  }
  proc = null
  publicUrl = ''
  startPromise = null
}

export function startTunnel(timeoutMs = 30000): Promise<string> {
  if (publicUrl && proc && !proc.killed) return Promise.resolve(publicUrl)
  if (startPromise) return startPromise

  const bin = process.env.HERMES_TUNNEL_CLOUDFLARED
  if (!bin) {
    return Promise.reject(new Error('Tunnel is not configured (HERMES_TUNNEL_CLOUDFLARED is unset).'))
  }
  const config = process.env.HERMES_TUNNEL_CONFIG
  const port = process.env.PORT || '8648'
  const args = ['tunnel']
  if (config) args.push('--config', config)
  args.push('--url', `http://localhost:${port}`, '--http-host-header', `localhost:${port}`)

  startPromise = new Promise<string>((resolve, reject) => {
    let settled = false
    let child: ChildProcess
    try {
      child = spawn(bin, args, { windowsHide: true })
    } catch (err) {
      startPromise = null
      reject(err)
      return
    }
    proc = child

    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      logger.error('Tunnel start timed out after %dms', timeoutMs)
      stopTunnel()
      reject(new Error('Timed out waiting for the tunnel URL.'))
    }, timeoutMs)

    const scan = (buf: Buffer) => {
      const text = buf.toString()
      const m = text.match(URL_RE)
      if (m && !settled) {
        settled = true
        clearTimeout(timer)
        publicUrl = m[0]
        logger.info('Tunnel ready: %s', publicUrl)
        resolve(publicUrl)
      }
    }
    child.stdout?.on('data', scan)
    child.stderr?.on('data', scan)

    child.on('exit', (code) => {
      logger.info('cloudflared exited with code %s', code)
      if (child === proc) {
        proc = null
        publicUrl = ''
        startPromise = null
      }
      if (!settled) {
        settled = true
        clearTimeout(timer)
        reject(new Error(`cloudflared exited before producing a URL (code ${code}).`))
      }
    })
    child.on('error', (err) => {
      if (!settled) {
        settled = true
        clearTimeout(timer)
        stopTunnel()
        reject(err)
      }
    })
  })

  return startPromise
}
