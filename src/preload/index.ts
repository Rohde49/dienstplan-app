import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { IPC_KANAELE } from '../shared/ipcKanaele'
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

// Custom APIs for renderer
const api = {
  team: {
    list: (): Promise<TeamMember[]> => ipcRenderer.invoke(IPC_KANAELE.team.list),
    add: (data: Omit<TeamMember, 'id'>): Promise<TeamMember> =>
      ipcRenderer.invoke(IPC_KANAELE.team.add, data),
    update: (id: number, data: Omit<TeamMember, 'id'>): Promise<TeamMember> =>
      ipcRenderer.invoke(IPC_KANAELE.team.update, id, data),
    delete: (id: number): Promise<{ geloescht: boolean; grund?: string }> =>
      ipcRenderer.invoke(IPC_KANAELE.team.delete, id)
  },
  eintragsdefinition: {
    list: (): Promise<Eintragsdefinition[]> =>
      ipcRenderer.invoke(IPC_KANAELE.eintragsdefinition.list),
    add: (data: Omit<Eintragsdefinition, 'id'>): Promise<Eintragsdefinition> =>
      ipcRenderer.invoke(IPC_KANAELE.eintragsdefinition.add, data),
    update: (id: number, data: Omit<Eintragsdefinition, 'id'>): Promise<Eintragsdefinition> =>
      ipcRenderer.invoke(IPC_KANAELE.eintragsdefinition.update, id, data),
    delete: (id: number): Promise<void> =>
      ipcRenderer.invoke(IPC_KANAELE.eintragsdefinition.delete, id)
  },
  dienstplan: {
    list: (): Promise<Dienstplan[]> => ipcRenderer.invoke(IPC_KANAELE.dienstplan.list),
    get: (id: number): Promise<{ dienstplan: Dienstplan; tage: Dienstplantag[] } | null> =>
      ipcRenderer.invoke(IPC_KANAELE.dienstplan.get, id),
    create: (data: {
      monat: number
      jahr: number
      titel: string
    }): Promise<{ dienstplan: Dienstplan; tage: Dienstplantag[] }> =>
      ipcRenderer.invoke(IPC_KANAELE.dienstplan.create, data),
    speichernPlanungsstand: (
      dienstplanId: number,
      titel: string,
      aenderungen: PlaneintragAenderung[],
      rufbereitschaftAenderungen: RufbereitschaftAenderung[],
      bemerkungAenderungen: BemerkungAenderung[]
    ): Promise<{
      dienstplan: Dienstplan
      planeintraege: Planeintrag[]
      rufbereitschaften: Rufbereitschaft[]
      dienstplantage: Dienstplantag[]
    }> =>
      ipcRenderer.invoke(
        IPC_KANAELE.dienstplan.speichernPlanungsstand,
        dienstplanId,
        titel,
        aenderungen,
        rufbereitschaftAenderungen,
        bemerkungAenderungen
      ),
    delete: (id: number): Promise<void> => ipcRenderer.invoke(IPC_KANAELE.dienstplan.delete, id)
  },
  planeintrag: {
    listFuerDienstplan: (dienstplanId: number): Promise<Planeintrag[]> =>
      ipcRenderer.invoke(IPC_KANAELE.planeintrag.listFuerDienstplan, dienstplanId)
  },
  rufbereitschaft: {
    listFuerDienstplan: (dienstplanId: number): Promise<Rufbereitschaft[]> =>
      ipcRenderer.invoke(IPC_KANAELE.rufbereitschaft.listFuerDienstplan, dienstplanId)
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
