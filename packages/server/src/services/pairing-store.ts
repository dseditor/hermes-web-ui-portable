import { randomBytes } from 'crypto'

// In-memory, single-use pairing codes for the "external pairing" flow.
// A code is created when the owner opens external access, embedded in the QR
// (URL fragment), and consumed the first time a device claims it. It also
// expires after a TTL and is cleared when the tunnel stops.

export interface PairingCode {
  code: string
  createdAt: number
  expiresAt: number
  used: boolean
}

const DEFAULT_TTL_MS = 10 * 60 * 1000 // 10 minutes
// Unambiguous alphabet (no 0/O/1/I) for codes that may be typed by hand.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

let current: PairingCode | null = null

function randomCode(length = 8): string {
  const bytes = randomBytes(length)
  let out = ''
  for (let i = 0; i < length; i++) out += ALPHABET[bytes[i] % ALPHABET.length]
  return out
}

export function generatePairingCode(ttlMs = DEFAULT_TTL_MS): PairingCode {
  const now = Date.now()
  current = { code: randomCode(8), createdAt: now, expiresAt: now + ttlMs, used: false }
  return current
}

export function getCurrentCode(): PairingCode | null {
  if (current && current.expiresAt < Date.now()) current = null
  return current
}

// Validate + consume a code (single-use). Returns true only on the first
// successful claim of a live, unexpired, unused code.
export function consumeCode(input: string): boolean {
  const code = getCurrentCode()
  if (!code || code.used) return false
  if (String(input || '').trim().toUpperCase() !== code.code) return false
  code.used = true
  return true
}

export function clearCode(): void {
  current = null
}
