import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { TeamMember } from '../shared/types'

// Custom APIs for renderer
const api = {
  team: {
    list: (): Promise<TeamMember[]> => ipcRenderer.invoke('team:list'),
    add: (data: Omit<TeamMember, 'id'>): Promise<TeamMember> =>
      ipcRenderer.invoke('team:add', data),
    update: (id: number, data: Omit<TeamMember, 'id'>): Promise<TeamMember> =>
      ipcRenderer.invoke('team:update', id, data)
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
