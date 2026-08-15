import { ipcMain } from 'electron'
import { db } from '../db'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { Rufbereitschaft } from '../../shared/types'
import {
  ensureRufbereitschaftenTabelle,
  getRufbereitschaftenFuerDienstplan
} from '../db/rufbereitschaftRepository'

export function registerRufbereitschaftHandlers(): void {
  ensureRufbereitschaftenTabelle(db)

  ipcMain.handle(
    IPC_KANAELE.rufbereitschaft.listFuerDienstplan,
    (_event, dienstplanId: number): Rufbereitschaft[] =>
      getRufbereitschaftenFuerDienstplan(dienstplanId, db)
  )
}
