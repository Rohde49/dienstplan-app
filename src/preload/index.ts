import { contextBridge, ipcRenderer } from 'electron'
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

// Dieses Bündel ist die einzige Verbindung des Renderers zum Main-Prozess. Es reicht
// ausschließlich die in IPC_KANAELE deklarierten Kanäle durch — kein generischer
// ipcRenderer-Zugriff, damit die Kanalliste eine echte Grenze ist und nicht nur eine
// Konvention.
//
// Das Bundle darf außer `electron` nichts per require laden: Unter `sandbox: true`
// (src/main/index.ts) steht im Preload nur dieses eine Modul zur Verfügung, ein Paket aus
// node_modules bricht den Ladevorgang ab und `window.api` bliebe undefiniert.
contextBridge.exposeInMainWorld('api', api)
