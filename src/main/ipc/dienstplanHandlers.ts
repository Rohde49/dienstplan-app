import { ipcMain } from 'electron'
import { db } from '../db'
import type {
  BemerkungAenderung,
  Dienstplan,
  Dienstplantag,
  Planeintrag,
  PlaneintragAenderung,
  Rufbereitschaft,
  RufbereitschaftAenderung
} from '../../shared/types'
import {
  createDienstplan,
  ensureDienstplanTabellen,
  getDienstplaene,
  getDienstplanMitTagen,
  speicherePlanungsstand
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

  ipcMain.handle(
    'dienstplan:speichernPlanungsstand',
    (
      _event,
      dienstplanId: number,
      titel: string,
      aenderungen: PlaneintragAenderung[],
      rufbereitschaftAenderungen: RufbereitschaftAenderung[],
      bemerkungAenderungen: BemerkungAenderung[]
    ): {
      dienstplan: Dienstplan
      planeintraege: Planeintrag[]
      rufbereitschaften: Rufbereitschaft[]
      dienstplantage: Dienstplantag[]
    } =>
      speicherePlanungsstand(
        dienstplanId,
        titel,
        aenderungen,
        rufbereitschaftAenderungen,
        bemerkungAenderungen,
        db
      )
  )
}
