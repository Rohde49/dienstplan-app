import { ElectronAPI } from '@electron-toolkit/preload'
import type { Eintragsdefinition, TeamMember } from '../shared/types'

interface TeamAPI {
  list: () => Promise<TeamMember[]>
  add: (data: Omit<TeamMember, 'id'>) => Promise<TeamMember>
  update: (id: number, data: Omit<TeamMember, 'id'>) => Promise<TeamMember>
}

interface EintragsdefinitionAPI {
  list: () => Promise<Eintragsdefinition[]>
  add: (data: Omit<Eintragsdefinition, 'id'>) => Promise<Eintragsdefinition>
  update: (id: number, data: Omit<Eintragsdefinition, 'id'>) => Promise<Eintragsdefinition>
}

interface API {
  team: TeamAPI
  eintragsdefinition: EintragsdefinitionAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
