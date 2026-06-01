import { request } from '../client'

export interface PairingStatus {
  configured: boolean
  running: boolean
  url: string
  code: string
  expiresAt: number
}

export interface PairingStartResult {
  url: string
  link: string
  code: string
  expiresAt: number
  qr: string
}

export async function fetchPairingStatus(): Promise<PairingStatus> {
  return request<PairingStatus>('/api/pairing/status')
}

export async function startPairing(): Promise<PairingStartResult> {
  return request<PairingStartResult>('/api/pairing/start', { method: 'POST' })
}

export async function stopPairing(): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>('/api/pairing/stop', { method: 'POST' })
}

export async function claimPairing(code: string): Promise<{ token: string }> {
  return request<{ token: string }>('/api/pairing/claim', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}
