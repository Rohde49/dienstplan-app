import { ipcMain } from 'electron'
import { db } from '../db'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { Planeintrag } from '../../shared/types'
import {
  ensurePlaneintraegeTabelle,
  getPlaneintraegeFuerDienstplan
} from '../db/planeintragRepository'

export function registerPlaneintragHandlers(): void {
  ensurePlaneintraegeTabelle(db)

  ipcMain.handle(
    IPC_KANAELE.planeintrag.listFuerDienstplan,
    (_event, dienstplanId: number): Planeintrag[] =>
      getPlaneintraegeFuerDienstplan(dienstplanId, db)
  )
}
