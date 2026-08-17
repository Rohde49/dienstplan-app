import type Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { Eintragsdefinition } from '../../shared/types'
import {
  addEintragsdefinition,
  deleteEintragsdefinition,
  getEintragsdefinitionen,
  updateEintragsdefinition
} from '../db/eintragsdefinitionRepository'

type Db = InstanceType<typeof Database>

export function registerEintragsdefinitionHandlers(db: Db): void {
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
