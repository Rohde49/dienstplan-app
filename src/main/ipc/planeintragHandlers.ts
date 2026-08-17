import type Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { Planeintrag } from '../../shared/types'
import { getPlaneintraegeFuerDienstplan } from '../db/planeintragRepository'

type Db = InstanceType<typeof Database>

export function registerPlaneintragHandlers(db: Db): void {
  ipcMain.handle(
    IPC_KANAELE.planeintrag.listFuerDienstplan,
    (_event, dienstplanId: number): Planeintrag[] =>
      getPlaneintraegeFuerDienstplan(dienstplanId, db)
  )
}
