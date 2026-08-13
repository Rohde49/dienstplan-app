import { ipcMain } from 'electron'
import { db } from '../db'
import type { Planeintrag } from '../../shared/types'
import {
  ensurePlaneintraegeTabelle,
  getPlaneintraegeFuerDienstplan
} from '../db/planeintragRepository'

export function registerPlaneintragHandlers(): void {
  ensurePlaneintraegeTabelle(db)

  ipcMain.handle('planeintrag:listFuerDienstplan', (_event, dienstplanId: number): Planeintrag[] =>
    getPlaneintraegeFuerDienstplan(dienstplanId, db)
  )
}
