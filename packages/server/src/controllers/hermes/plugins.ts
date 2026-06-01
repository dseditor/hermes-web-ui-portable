import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { listHermesPlugins } from '../../services/hermes/plugins'
import { getActiveProfileName, getProfileDir } from '../../services/hermes/hermes-profile'
import { readConfigYamlForProfile, updateConfigYamlForProfile, saveEnvValueForProfile } from '../../services/config-helpers'

export async function list(ctx: any) {
  try {
    ctx.body = await listHermesPlugins(ctx.state?.profile?.name)
  } catch (err: any) {
    ctx.status = 500
    ctx.body = { error: err.message || 'Failed to discover Hermes plugins' }
  }
}

// Capabilities whose active backend is selected via "<capability>.provider"
// in config.yaml (e.g. `hermes config set image_gen.provider openai-codex`).
const CAPABILITY_KEYS = ['image_gen', 'video_gen', 'web']

function requestedProfile(ctx: any): string {
  return ctx.state?.profile?.name || getActiveProfileName() || 'default'
}

// Return the names of env vars currently present in the profile's .env
// (names only — never the secret values).
function readEnvKeys(profile: string): string[] {
  const envPath = join(getProfileDir(profile), '.env')
  if (!existsSync(envPath)) return []
  try {
    return readFileSync(envPath, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#') && line.includes('='))
      .map(line => line.slice(0, line.indexOf('=')).trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

// GET current capability provider selections + which env keys are already set.
export async function getCapabilityConfig(ctx: any) {
  try {
    const profile = requestedProfile(ctx)
    const config = await readConfigYamlForProfile(profile)
    const providers: Record<string, string> = {}
    for (const cap of CAPABILITY_KEYS) {
      const section = config?.[cap]
      providers[cap] = section && typeof section === 'object' && !Array.isArray(section)
        ? String(section.provider || '')
        : ''
    }
    ctx.body = { profile, providers, envKeys: readEnvKeys(profile) }
  } catch (err: any) {
    ctx.status = 500
    ctx.body = { error: err.message || 'Failed to read capability config' }
  }
}

// POST { capability?, provider?, env? } — writes "<capability>.provider" to
// config.yaml and any env vars to .env, reusing the standard config helpers.
export async function setCapabilityConfig(ctx: any) {
  try {
    const profile = requestedProfile(ctx)
    const body = (ctx.request.body || {}) as { capability?: string; provider?: string; env?: Record<string, unknown> }
    const capability = String(body.capability || '').trim()

    if (capability) {
      if (!/^[a-z][a-z0-9_]*$/.test(capability)) {
        ctx.status = 400
        ctx.body = { error: 'invalid capability key' }
        return
      }
      if (typeof body.provider === 'string') {
        const provider = body.provider.trim()
        await updateConfigYamlForProfile(profile, (config) => {
          const section = config[capability]
          if (!section || typeof section !== 'object' || Array.isArray(section)) {
            config[capability] = {}
          }
          if (provider) {
            config[capability].provider = provider
          } else {
            delete config[capability].provider
          }
          return config
        })
      }
    }

    if (body.env && typeof body.env === 'object') {
      for (const [key, value] of Object.entries(body.env)) {
        if (typeof value === 'string') {
          await saveEnvValueForProfile(profile, key, value.trim())
        }
      }
    }

    ctx.body = { ok: true, profile }
  } catch (err: any) {
    ctx.status = err?.status || 500
    ctx.body = { error: err.message || 'Failed to save capability config' }
  }
}
