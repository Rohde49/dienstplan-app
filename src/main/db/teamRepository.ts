import type Database from 'better-sqlite3'
import type { TeamMember } from '../../shared/types'

type Db = InstanceType<typeof Database>

export function ensureTeamMembersTable(database: Db): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS team_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vorname TEXT NOT NULL,
      name TEXT NOT NULL,
      rolle TEXT NOT NULL,
      wochenarbeitszeitMinuten INTEGER NOT NULL,
      farbe TEXT NOT NULL
    )
  `)
}

export function getTeamMembers(database: Db): TeamMember[] {
  return database
    .prepare(
      'SELECT id, vorname, name, rolle, wochenarbeitszeitMinuten, farbe FROM team_members ORDER BY id'
    )
    .all() as TeamMember[]
}

export function addTeamMember(data: Omit<TeamMember, 'id'>, database: Db): TeamMember {
  const result = database
    .prepare(
      `INSERT INTO team_members (vorname, name, rolle, wochenarbeitszeitMinuten, farbe)
       VALUES (@vorname, @name, @rolle, @wochenarbeitszeitMinuten, @farbe)`
    )
    .run(data)

  return { id: Number(result.lastInsertRowid), ...data }
}

// id stammt stets aus zuvor geladenen Daten, kein Not-Found-Handling nötig
export function updateTeamMember(
  id: number,
  data: Omit<TeamMember, 'id'>,
  database: Db
): TeamMember {
  database
    .prepare(
      `UPDATE team_members
       SET vorname = @vorname, name = @name, rolle = @rolle,
           wochenarbeitszeitMinuten = @wochenarbeitszeitMinuten, farbe = @farbe
       WHERE id = @id`
    )
    .run({ ...data, id })

  return { id, ...data }
}
