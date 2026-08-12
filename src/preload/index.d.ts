import { ElectronAPI } from '@electron-toolkit/preload'
import type { Dienstplan, Dienstplantag, Eintragsdefinition, TeamMember } from '../shared/types'

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

interface DienstplanAPI {
  list: () => Promise<Dienstplan[]>
  get: (id: number) => Promise<{ dienstplan: Dienstplan; tage: Dienstplantag[] } | null>
  create: (data: {
    monat: number
    jahr: number
    titel: string
  }) => Promise<{ dienstplan: Dienstplan; tage: Dienstplantag[] }>
  updateTitel: (id: number, titel: string) => Promise<Dienstplan>
}

interface API {
  team: TeamAPI
  eintragsdefinition: EintragsdefinitionAPI
  dienstplan: DienstplanAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
