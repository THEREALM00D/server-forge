import type { FirewallRuleStatus, OperationResult } from '../../../types'

export const firewallService = {
  isAdmin: (): Promise<boolean> => window.api.firewall.isAdmin(),
  getStatus: (
    gamePort: number,
    rconPort: number,
    restApiPort: number
  ): Promise<FirewallRuleStatus[]> =>
    window.api.firewall.getStatus(gamePort, rconPort, restApiPort),
  enableRule: (
    key: 'game' | 'rcon' | 'restapi',
    port: number,
    protocol: 'TCP' | 'UDP'
  ): Promise<OperationResult> => window.api.firewall.enableRule(key, port, protocol),
  disableRule: (key: 'game' | 'rcon' | 'restapi'): Promise<OperationResult> =>
    window.api.firewall.disableRule(key),
  applyAll: (
    gamePort: number,
    rconPort: number,
    restApiPort: number
  ): Promise<{ success: boolean; errors: string[] }> =>
    window.api.firewall.applyAll(gamePort, rconPort, restApiPort),
  removeAll: (): Promise<void> => window.api.firewall.removeAll(),
  listCustomRules: (): Promise<FirewallRuleStatus[]> => window.api.firewall.listCustomRules(),
  createCustomRule: (name: string, port: number, protocol: 'TCP' | 'UDP'): Promise<OperationResult> =>
    window.api.firewall.createCustomRule(name, port, protocol),
  deleteCustomRule: (name: string, protocol: 'TCP' | 'UDP'): Promise<OperationResult> =>
    window.api.firewall.deleteCustomRule(name, protocol),
}
