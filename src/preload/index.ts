import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type {
  Dienstplan,
  Dienstplantag,
  Eintragsdefinition,
  Planeintrag,
  PlaneintragAenderung,
  Rufbereitschaft,
  RufbereitschaftAenderung,
  TeamMember
} from '../shared/types'

// Custom APIs for renderer
const api = {
  team: {
    list: (): Promise<TeamMember[]> => ipcRenderer.invoke('team:list'),
    add: (data: Omit<TeamMember, 'id'>): Promise<TeamMember> =>
      ipcRenderer.invoke('team:add', data),
    update: (id: number, data: Omit<TeamMember, 'id'>): Promise<TeamMember> =>
      ipcRenderer.invoke('team:update', id, data)
  },
  eintragsdefinition: {
    list: (): Promise<Eintragsdefinition[]> => ipcRenderer.invoke('eintragsdefinition:list'),
    add: (data: Omit<Eintragsdefinition, 'id'>): Promise<Eintragsdefinition> =>
      ipcRenderer.invoke('eintragsdefinition:add', data),
    update: (id: number, data: Omit<Eintragsdefinition, 'id'>): Promise<Eintragsdefinition> =>
      ipcRenderer.invoke('eintragsdefinition:update', id, data)
  },
  dienstplan: {
    list: (): Promise<Dienstplan[]> => ipcRenderer.invoke('dienstplan:list'),
    get: (id: number): Promise<{ dienstplan: Dienstplan; tage: Dienstplantag[] } | null> =>
      ipcRenderer.invoke('dienstplan:get', id),
    create: (data: {
      monat: number
      jahr: number
      titel: string
    }): Promise<{ dienstplan: Dienstplan; tage: Dienstplantag[] }> =>
      ipcRenderer.invoke('dienstplan:create', data),
    speichernPlanungsstand: (
      dienstplanId: number,
      titel: string,
      aenderungen: PlaneintragAenderung[],
      rufbereitschaftAenderungen: RufbereitschaftAenderung[]
    ): Promise<{
      dienstplan: Dienstplan
      planeintraege: Planeintrag[]
      rufbereitschaften: Rufbereitschaft[]
    }> =>
      ipcRenderer.invoke(
        'dienstplan:speichernPlanungsstand',
        dienstplanId,
        titel,
        aenderungen,
        rufbereitschaftAenderungen
      )
  },
  planeintrag: {
    listFuerDienstplan: (dienstplanId: number): Promise<Planeintrag[]> =>
      ipcRenderer.invoke('planeintrag:listFuerDienstplan', dienstplanId)
  },
  rufbereitschaft: {
    listFuerDienstplan: (dienstplanId: number): Promise<Rufbereitschaft[]> =>
      ipcRenderer.invoke('rufbereitschaft:listFuerDienstplan', dienstplanId)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
