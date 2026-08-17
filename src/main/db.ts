import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { bereiteDatenbankVor } from './db/schema'

type Db = InstanceType<typeof Database>

export function datenbankPfad(): string {
  return join(app.getPath('userData'), 'dienstplan.db')
}

// Öffnet die Datenbank und bringt sie auf den aktuellen Schemastand.
//
// Bewusst eine Funktion und keine Modul-Nebenwirkung mehr: Zuvor lief `new Database(…)`
// beim Import und damit während der Import-Kette von index.ts — vor jedem try/catch und
// vor dem ersten Fenster. Eine gesperrte, defekte oder nicht beschreibbare Datei beendete
// den Main-Prozess, ohne dass der Nutzer irgendetwas zu sehen bekam. Der Aufrufer in
// src/main/index.ts fängt den Fehler jetzt ab und zeigt ihn an.
export function oeffneDatenbank(pfad: string = datenbankPfad()): Db {
  const datenbank = new Database(pfad)
  bereiteDatenbankVor(datenbank)
  return datenbank
}

export function runDbSmokeTest(datenbank: Db, pfad: string = datenbankPfad()): void {
  datenbank.exec(`
    CREATE TABLE IF NOT EXISTS smoke_test (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL
    )
  `)

  datenbank.prepare('INSERT INTO smoke_test (created_at) VALUES (?)').run(new Date().toISOString())

  const row = datenbank.prepare('SELECT COUNT(*) AS count FROM smoke_test').get() as {
    count: number
  }

  console.log(`[db] better-sqlite3 ok, Datei: ${pfad}, smoke_test rows: ${row.count}`)
}
