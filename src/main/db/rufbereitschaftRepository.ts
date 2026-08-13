import type Database from 'better-sqlite3'
import type { Rufbereitschaft } from '../../shared/types'

type Db = InstanceType<typeof Database>

export function ensureRufbereitschaftenTabelle(database: Db): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS rufbereitschaften (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dienstplantagId INTEGER NOT NULL UNIQUE REFERENCES dienstplantage(id),
      teamMemberId INTEGER NOT NULL
    )
  `)
}

export function getRufbereitschaftenFuerDienstplan(
  dienstplanId: number,
  database: Db
): Rufbereitschaft[] {
  return database
    .prepare(
      `SELECT r.id, r.dienstplantagId, r.teamMemberId
       FROM rufbereitschaften r
       JOIN dienstplantage d ON d.id = r.dienstplantagId
       WHERE d.dienstplanId = @dienstplanId
       ORDER BY r.id`
    )
    .all({ dienstplanId }) as Rufbereitschaft[]
}
