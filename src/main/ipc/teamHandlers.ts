import type Database from 'better-sqlite3'
import { ipcMain } from 'electron'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { TeamMember } from '../../shared/types'
import {
  addTeamMember,
  deleteTeamMember,
  getTeamMembers,
  updateTeamMember
} from '../db/teamRepository'

type Db = InstanceType<typeof Database>

export function registerTeamHandlers(db: Db): void {
  ipcMain.handle(IPC_KANAELE.team.list, (): TeamMember[] => getTeamMembers(db))

  ipcMain.handle(IPC_KANAELE.team.add, (_event, data: Omit<TeamMember, 'id'>): TeamMember =>
    addTeamMember(data, db)
  )

  ipcMain.handle(
    IPC_KANAELE.team.update,
    (_event, id: number, data: Omit<TeamMember, 'id'>): TeamMember => updateTeamMember(id, data, db)
  )

  ipcMain.handle(
    IPC_KANAELE.team.delete,
    (_event, id: number): { geloescht: boolean; grund?: string } => deleteTeamMember(id, db)
  )
}
