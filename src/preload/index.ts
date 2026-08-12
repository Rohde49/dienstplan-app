import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { Dienstplan, Dienstplantag, Eintragsdefinition, TeamMember } from '../shared/types'

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
    updateTitel: (id: number, titel: string): Promise<Dienstplan> =>
      ipcRenderer.invoke('dienstplan:updateTitel', id, titel)
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
