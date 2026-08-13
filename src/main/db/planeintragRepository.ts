import type Database from 'better-sqlite3'
import type { Planeintrag } from '../../shared/types'

type Db = InstanceType<typeof Database>

export function ensurePlaneintraegeTabelle(database: Db): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS planeintraege (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dienstplantagId INTEGER NOT NULL REFERENCES dienstplantage(id),
      teamMemberId INTEGER NOT NULL,
      eintragsdefinitionId INTEGER NOT NULL,
      kuerzel TEXT NOT NULL,
      beginn TEXT,
      ende TEXT,
      anwesenheitszeitMinuten INTEGER NOT NULL,
      arbeitszeitMinuten INTEGER NOT NULL,
      arbeitszeitOhneNachtbereitschaftMinuten INTEGER NOT NULL,
      nachtbereitschaftMinuten INTEGER NOT NULL,
      nachtarbeitMinuten INTEGER NOT NULL,
      UNIQUE (dienstplantagId, teamMemberId)
    )
  `)
}

export function getPlaneintraegeFuerDienstplan(dienstplanId: number, database: Db): Planeintrag[] {
  return database
    .prepare(
      `SELECT p.id, p.dienstplantagId, p.teamMemberId, p.eintragsdefinitionId, p.kuerzel,
              p.beginn, p.ende, p.anwesenheitszeitMinuten, p.arbeitszeitMinuten,
              p.arbeitszeitOhneNachtbereitschaftMinuten, p.nachtbereitschaftMinuten,
              p.nachtarbeitMinuten
       FROM planeintraege p
       JOIN dienstplantage d ON d.id = p.dienstplantagId
       WHERE d.dienstplanId = @dienstplanId
       ORDER BY p.id`
    )
    .all({ dienstplanId }) as Planeintrag[]
}
