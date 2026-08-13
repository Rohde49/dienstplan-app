import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  BemerkungAenderung,
  Dienstplan,
  Dienstplantag,
  Eintragsdefinition,
  Planeintrag,
  PlaneintragAenderung,
  Rufbereitschaft,
  RufbereitschaftAenderung,
  TeamMember
} from '../shared/types'

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
  speichernPlanungsstand: (
    dienstplanId: number,
    titel: string,
    aenderungen: PlaneintragAenderung[],
    rufbereitschaftAenderungen: RufbereitschaftAenderung[],
    bemerkungAenderungen: BemerkungAenderung[]
  ) => Promise<{
    dienstplan: Dienstplan
    planeintraege: Planeintrag[]
    rufbereitschaften: Rufbereitschaft[]
    dienstplantage: Dienstplantag[]
  }>
}

interface PlaneintragAPI {
  listFuerDienstplan: (dienstplanId: number) => Promise<Planeintrag[]>
}

interface RufbereitschaftAPI {
  listFuerDienstplan: (dienstplanId: number) => Promise<Rufbereitschaft[]>
}

interface API {
  team: TeamAPI
  eintragsdefinition: EintragsdefinitionAPI
  dienstplan: DienstplanAPI
  planeintrag: PlaneintragAPI
  rufbereitschaft: RufbereitschaftAPI
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
