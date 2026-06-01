import type { Context } from 'koa'
import QRCode from 'qrcode'
import { startTunnel, stopTunnel, getTunnelState, isTunnelConfigured } from '../services/tunnel-manager'
import { generatePairingCode, getCurrentCode, consumeCode, clearCode } from '../services/pairing-store'
import { extractIp, checkPassword, recordPasswordFailure, recordPasswordSuccess } from '../services/login-limiter'
import { findFirstUser } from '../db/hermes/users-store'
import { issueUserJwt } from '../middleware/user-auth'

function pairUrl(base: string, code: string): string {
  // The SPA uses hash-history routing, so the route must live in the hash:
  //   https://<tunnel>/#/pair?code=XXXX
  // Everything after "#" stays client-side (never sent to the server in logs
  // and invisible to link-preview crawlers that fetch the bare URL), so the
  // code is still not leaked server-side.
  return `${base.replace(/\/+$/, '')}/#/pair?code=${code}`
}

/**
 * GET /api/pairing/status (protected)
 * Current external-access + pairing state for the owner UI.
 */
export async function status(ctx: Context) {
  const tunnel = getTunnelState()
  const code = getCurrentCode()
  ctx.body = {
    configured: isTunnelConfigured(),
    running: tunnel.running,
    url: tunnel.url,
    code: code ? code.code : '',
    expiresAt: code ? code.expiresAt : 0,
  }
}

/**
 * POST /api/pairing/start (protected)
 * Start the tunnel (if needed), mint a fresh one-time pairing code, and return
 * the public URL + code + a QR data URL that encodes the pairing deep link.
 */
export async function start(ctx: Context) {
  if (!isTunnelConfigured()) {
    ctx.status = 400
    ctx.body = { error: 'Tunnel is not configured in this deployment.' }
    return
  }
  let url: string
  try {
    url = await startTunnel()
  } catch (err: any) {
    ctx.status = 502
    ctx.body = { error: err?.message || 'Failed to start the tunnel.' }
    return
  }
  const code = generatePairingCode()
  const link = pairUrl(url, code.code)
  let qr = ''
  try {
    qr = await QRCode.toDataURL(link, { margin: 1, width: 320 })
  } catch (err: any) {
    qr = ''
  }
  ctx.body = { url, link, code: code.code, expiresAt: code.expiresAt, qr }
}

/**
 * POST /api/pairing/stop (protected)
 * Stop the tunnel and invalidate any outstanding pairing code.
 */
export async function stop(ctx: Context) {
  clearCode()
  stopTunnel()
  ctx.body = { ok: true }
}

/**
 * POST /api/pairing/claim (PUBLIC, rate-limited)
 * A device exchanges a valid one-time pairing code for an owner session token.
 */
export async function claim(ctx: Context) {
  const ip = extractIp(ctx)
  const gate = checkPassword(ip)
  if (!gate.allowed) {
    ctx.status = gate.status
    ctx.body = { error: 'Too many attempts, please try again later.' }
    return
  }

  const { code } = (ctx.request.body || {}) as { code?: string }
  if (!code || typeof code !== 'string') {
    ctx.status = 400
    ctx.body = { error: 'Pairing code is required.' }
    return
  }

  if (!consumeCode(code)) {
    recordPasswordFailure(ip)
    ctx.status = 401
    ctx.body = { error: 'Invalid or expired pairing code.' }
    return
  }

  const owner = findFirstUser()
  if (!owner) {
    ctx.status = 409
    ctx.body = { error: 'No account exists yet. Sign in once on the host first.' }
    return
  }

  let token: string
  try {
    token = await issueUserJwt(owner)
  } catch (err: any) {
    ctx.status = 500
    ctx.body = { error: err?.message || 'Failed to issue a session token.' }
    return
  }

  recordPasswordSuccess(ip)
  ctx.body = { token }
}
