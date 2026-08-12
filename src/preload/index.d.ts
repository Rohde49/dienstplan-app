import { ElectronAPI } from '@electron-toolkit/preload'
import type { TeamMember } from '../shared/types'

interface TeamAPI {
  list: () => Promise<TeamMember[]>
  add: (data: Omit<TeamMember, 'id'>) => Promise<TeamMember>
  update: (id: number, data: Omit<TeamMember, 'id'>) => Promise<TeamMember>
}

interface API {
  team: TeamAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
