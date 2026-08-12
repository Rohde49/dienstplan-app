import { ipcMain } from 'electron'
import { db } from '../db'
import type { Eintragsdefinition } from '../../shared/types'
import {
  addEintragsdefinition,
  ensureEintragsdefinitionenTable,
  getEintragsdefinitionen,
  updateEintragsdefinition
} from '../db/eintragsdefinitionRepository'

export function registerEintragsdefinitionHandlers(): void {
  ensureEintragsdefinitionenTable(db)

  ipcMain.handle('eintragsdefinition:list', (): Eintragsdefinition[] => getEintragsdefinitionen(db))

  ipcMain.handle(
    'eintragsdefinition:add',
    (_event, data: Omit<Eintragsdefinition, 'id'>): Eintragsdefinition =>
      addEintragsdefinition(data, db)
  )

  ipcMain.handle(
    'eintragsdefinition:update',
    (_event, id: number, data: Omit<Eintragsdefinition, 'id'>): Eintragsdefinition =>
      updateEintragsdefinition(id, data, db)
  )
}
