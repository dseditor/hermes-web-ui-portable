import { request } from '../client'

export type PluginConfigStatus = 'enabled' | 'disabled' | 'not-enabled' | 'auto' | 'provider-managed'
export type PluginEffectiveStatus = 'enabled' | 'disabled' | 'inactive' | 'auto-active' | 'provider-managed'

export interface HermesPluginInfo {
  key: string
  name: string
  kind: string
  source: string
  configStatus: PluginConfigStatus | string
  effectiveStatus: PluginEffectiveStatus | string
  version: string
  description: string
  author: string
  path: string
  providesTools: string[]
  providesHooks: string[]
  requiresEnv: Array<string | Record<string, unknown>>
}

export interface HermesPluginsMetadata {
  hermesAgentRoot: string
  pythonExecutable: string
  cwd: string
  projectPluginsEnabled: boolean
}

export interface HermesPluginsResponse {
  plugins: HermesPluginInfo[]
  warnings: string[]
  metadata: HermesPluginsMetadata
}

export async function fetchPlugins(): Promise<HermesPluginsResponse> {
  return request<HermesPluginsResponse>('/api/hermes/plugins')
}

export interface CapabilityConfig {
  profile: string
  providers: Record<string, string>
  envKeys: string[]
}

export async function fetchCapabilityConfig(): Promise<CapabilityConfig> {
  return request<CapabilityConfig>('/api/hermes/plugins/capability-config')
}

export async function saveCapabilityConfig(payload: {
  capability?: string
  provider?: string
  env?: Record<string, string>
}): Promise<{ ok: boolean; profile: string }> {
  return request<{ ok: boolean; profile: string }>('/api/hermes/plugins/capability-config', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
