import type Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
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
  deleteDienstplan,
  getDienstplaene,
  getDienstplanMitTagen,
  speicherePlanungsstand
} from '../db/dienstplanRepository'

type Db = InstanceType<typeof Database>

export function registerDienstplanHandlers(db: Db): void {
  ipcMain.handle(IPC_KANAELE.dienstplan.list, (): Dienstplan[] => getDienstplaene(db))

  ipcMain.handle(
    IPC_KANAELE.dienstplan.get,
    (_event, id: number): { dienstplan: Dienstplan; tage: Dienstplantag[] } | null =>
      getDienstplanMitTagen(id, db)
  )

  ipcMain.handle(
    IPC_KANAELE.dienstplan.create,
    (
      _event,
      data: { monat: number; jahr: number; titel: string }
    ): { dienstplan: Dienstplan; tage: Dienstplantag[] } => createDienstplan(data, db)
  )

  ipcMain.handle(
    IPC_KANAELE.dienstplan.speichernPlanungsstand,
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

  ipcMain.handle(IPC_KANAELE.dienstplan.delete, (_event, id: number): void =>
    deleteDienstplan(id, db)
  )
}
