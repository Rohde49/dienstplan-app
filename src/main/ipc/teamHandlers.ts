import { ipcMain } from 'electron'
import { db } from '../db'
import { IPC_KANAELE } from '../../shared/ipcKanaele'
import type { TeamMember } from '../../shared/types'
import {
  addTeamMember,
  deleteTeamMember,
  ensureTeamMembersTable,
  getTeamMembers,
  updateTeamMember
} from '../db/teamRepository'

export function registerTeamHandlers(): void {
  ensureTeamMembersTable(db)

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
