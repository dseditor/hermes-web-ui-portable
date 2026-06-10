import { request } from '../client'

export interface LaunchBrowserResponse {
  success: boolean
  port: number
  cdpUrl: string
}

/**
 * Trigger the local CDP launcher: connects to an already-running browser on the
 * port, or launches a visible Chrome on the persistent login profile, then wires
 * browser.cdp_url into config.
 */
export async function launchBrowser(port: number, chromePath?: string): Promise<LaunchBrowserResponse> {
  return request<LaunchBrowserResponse>('/api/hermes/browser/launch', {
    method: 'POST',
    body: JSON.stringify({ port, chromePath: chromePath || undefined }),
  })
}
