import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

const dbPath = join(app.getPath('userData'), 'dienstplan.db')

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

export function runDbSmokeTest(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS smoke_test (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL
    )
  `)

  db.prepare('INSERT INTO smoke_test (created_at) VALUES (?)').run(new Date().toISOString())

  const row = db.prepare('SELECT COUNT(*) AS count FROM smoke_test').get() as { count: number }

  console.log(`[db] better-sqlite3 ok, Datei: ${dbPath}, smoke_test rows: ${row.count}`)
}
