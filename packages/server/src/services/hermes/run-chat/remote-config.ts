/**
 * Remote backend configuration (frontend-only mode).
 *
 * When HERMES_REMOTE_API_URL is set, this web-ui acts as a pure frontend and
 * forwards chat runs to a remote Hermes API server (e.g. a hermes-agent
 * running in Docker on another machine) instead of spawning a local Python
 * agent bridge. The remote server must have API_SERVER_ENABLED=true and the
 * key here must match its API_SERVER_KEY.
 *
 * Default behaviour (no env set) is unchanged: local CLI bridge mode.
 */

/** Remote Hermes API server base URL, e.g. http://192.168.1.100:8642. Empty when local. */
export function remoteApiUrl(): string {
  return (process.env.HERMES_REMOTE_API_URL || '').trim().replace(/\/+$/, '')
}

/** Bearer key for the remote API server (must match its API_SERVER_KEY). */
export function remoteApiKey(): string {
  return (process.env.HERMES_REMOTE_API_KEY || '').trim()
}

/** True when this instance is configured as a pure frontend to a remote agent. */
export function isRemoteBackend(): boolean {
  return remoteApiUrl().length > 0
}
