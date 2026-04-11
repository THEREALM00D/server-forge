export interface SystemStats {
  cpu: number
  ram: number
  ramUsed: number
  ramTotal: number
  uptime: number
}

export type ServerStatus = 'stopped' | 'starting' | 'running' | 'stopping' | 'crashed'

export interface FirewallRuleStatus {
  name: string
  port: number
  protocol: 'TCP' | 'UDP'
  active: boolean
}

export interface OperationResult {
  success: boolean
  error?: string
}

export type GameId = 'palworld'

export interface GameDefinition {
  id: GameId
  name: string
  steamAppId: number
  executableName: string
  configRelPath: string
}
