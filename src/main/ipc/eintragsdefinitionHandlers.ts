import { ipcMain } from 'electron'
import { db } from '../db'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { Eintragsdefinition } from '../../shared/types'
import {
  addEintragsdefinition,
  deleteEintragsdefinition,
  ensureEintragsdefinitionenTable,
  getEintragsdefinitionen,
  updateEintragsdefinition
} from '../db/eintragsdefinitionRepository'

export function registerEintragsdefinitionHandlers(): void {
  ensureEintragsdefinitionenTable(db)

  ipcMain.handle(IPC_KANAELE.eintragsdefinition.list, (): Eintragsdefinition[] =>
    getEintragsdefinitionen(db)
  )

  ipcMain.handle(
    IPC_KANAELE.eintragsdefinition.add,
    (_event, data: Omit<Eintragsdefinition, 'id'>): Eintragsdefinition =>
      addEintragsdefinition(data, db)
  )

  ipcMain.handle(
    IPC_KANAELE.eintragsdefinition.update,
    (_event, id: number, data: Omit<Eintragsdefinition, 'id'>): Eintragsdefinition =>
      updateEintragsdefinition(id, data, db)
  )

  ipcMain.handle(IPC_KANAELE.eintragsdefinition.delete, (_event, id: number): void =>
    deleteEintragsdefinition(id, db)
  )
}
