import { ipcMain } from 'electron'
import { db } from '../db'
import type { Rufbereitschaft } from '../../shared/types'
import {
  ensureRufbereitschaftenTabelle,
  getRufbereitschaftenFuerDienstplan
} from '../db/rufbereitschaftRepository'

export function registerRufbereitschaftHandlers(): void {
  ensureRufbereitschaftenTabelle(db)

  ipcMain.handle(
    'rufbereitschaft:listFuerDienstplan',
    (_event, dienstplanId: number): Rufbereitschaft[] =>
      getRufbereitschaftenFuerDienstplan(dienstplanId, db)
  )
}
