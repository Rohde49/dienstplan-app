import { ipcMain } from 'electron'
import { db } from '../db'
import type { Dienstplan, Dienstplantag } from '../../shared/types'
import {
  createDienstplan,
  ensureDienstplanTabellen,
  getDienstplaene,
  getDienstplanMitTagen,
  updateDienstplanTitel
} from '../db/dienstplanRepository'

export function registerDienstplanHandlers(): void {
  ensureDienstplanTabellen(db)

  ipcMain.handle('dienstplan:list', (): Dienstplan[] => getDienstplaene(db))

  ipcMain.handle(
    'dienstplan:get',
    (_event, id: number): { dienstplan: Dienstplan; tage: Dienstplantag[] } | null =>
      getDienstplanMitTagen(id, db)
  )

  ipcMain.handle(
    'dienstplan:create',
    (
      _event,
      data: { monat: number; jahr: number; titel: string }
    ): { dienstplan: Dienstplan; tage: Dienstplantag[] } => createDienstplan(data, db)
  )

  ipcMain.handle('dienstplan:updateTitel', (_event, id: number, titel: string): Dienstplan =>
    updateDienstplanTitel(id, titel, db)
  )
}
