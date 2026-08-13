import { ipcMain } from 'electron'
import { db } from '../db'
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

  ipcMain.handle('team:list', (): TeamMember[] => getTeamMembers(db))

  ipcMain.handle('team:add', (_event, data: Omit<TeamMember, 'id'>): TeamMember =>
    addTeamMember(data, db)
  )

  ipcMain.handle('team:update', (_event, id: number, data: Omit<TeamMember, 'id'>): TeamMember =>
    updateTeamMember(id, data, db)
  )

  ipcMain.handle('team:delete', (_event, id: number): { geloescht: boolean; grund?: string } =>
    deleteTeamMember(id, db)
  )
}
