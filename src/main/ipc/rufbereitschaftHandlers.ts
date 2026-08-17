import type Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { Rufbereitschaft } from '../../shared/types'
import { getRufbereitschaftenFuerDienstplan } from '../db/rufbereitschaftRepository'

type Db = InstanceType<typeof Database>

export function registerRufbereitschaftHandlers(db: Db): void {
  ipcMain.handle(
    IPC_KANAELE.rufbereitschaft.listFuerDienstplan,
    (_event, dienstplanId: number): Rufbereitschaft[] =>
      getRufbereitschaftenFuerDienstplan(dienstplanId, db)
  )
}
