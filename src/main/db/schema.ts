import type Database from 'better-sqlite3'
import { ensureDienstplanTabellen } from './dienstplanRepository'
import { ensureEintragsdefinitionenTable } from './eintragsdefinitionRepository'
import { ensurePlaneintraegeTabelle } from './planeintragRepository'
import { ensureRufbereitschaftenTabelle } from './rufbereitschaftRepository'
import { ensureTeamMembersTable } from './teamRepository'

type Db = InstanceType<typeof Database>

// Bewusst ohne Electron-Import: Dieses Modul beschreibt, wie eine Datenbank auszusehen
// hat, nicht wo sie liegt. Dadurch können die Tests dieselbe Vorbereitung auf eine
// In-Memory-Datenbank anwenden wie der Main-Prozess auf die Datei des Nutzers — siehe
// src/test/datenbank.ts. Der Pfad und das Öffnen stehen in src/main/db.ts.

// Schemaänderungen an einer Datenbank, die beim Nutzer bereits existiert. Index 0 führt
// von Version 1 auf 2, Index 1 von 2 auf 3 und so fort.
//
// Zwei Regeln, die nicht verhandelbar sind, sobald ein Installer ausgeliefert wurde:
//   - Ein veröffentlichter Eintrag wird nie mehr geändert. Er ist auf fremden Rechnern
//     bereits gelaufen; eine nachträgliche Korrektur erreicht diese Datenbanken nicht.
//   - Jede neue Tabelle oder Spalte gehört zusätzlich in die ensure…-Funktion ihres
//     Repositories. Die Migration versorgt bestehende Datenbanken, die ensure…-Funktion
//     frische — beide Wege müssen zum selben Schema führen.
const MIGRATIONEN: ((datenbank: Db) => void)[] = []

export const SCHEMA_VERSION = 1 + MIGRATIONEN.length

export function setzePragmas(datenbank: Db): void {
  // Nebenläufige Leser blockieren den Schreiber nicht.
  datenbank.pragma('journal_mode = WAL')
  // Ohne dieses Pragma sind die REFERENCES-Klauseln der Repositories wirkungslos —
  // SQLite prüft Fremdschlüssel per Voreinstellung nicht.
  datenbank.pragma('foreign_keys = ON')
  // Eine zweite Verbindung wartet auf den Schreiblock, statt sofort SQLITE_BUSY zu
  // werfen. Zweiter Riegel hinter der Einzelinstanz-Sperre in src/main/index.ts.
  datenbank.pragma('busy_timeout = 5000')
}

// Setzt Pragmas, legt fehlende Tabellen an und bringt das Schema auf SCHEMA_VERSION.
// Mehrfach aufrufbar: Der zweite Aufruf auf derselben Datenbank ändert nichts mehr.
export function bereiteDatenbankVor(datenbank: Db): void {
  setzePragmas(datenbank)

  // Vor dem Anlegen der Tabellen bestimmen, sonst sind hinterher alle Datenbanken gleich
  // aufgebaut und eine frische wäre von einer bestehenden nicht mehr zu unterscheiden.
  const istNeu = istOhneTabellen(datenbank)

  erzeugeSchema(datenbank)

  if (istNeu) {
    // Die ensure…-Funktionen legen bereits den aktuellen Stand an, es gibt nichts zu
    // migrieren.
    setzeVersion(datenbank, SCHEMA_VERSION)
    return
  }

  fuehreMigrationenAus(datenbank)
}

function erzeugeSchema(datenbank: Db): void {
  ensureTeamMembersTable(datenbank)
  ensureEintragsdefinitionenTable(datenbank)
  ensureDienstplanTabellen(datenbank)
  ensurePlaneintraegeTabelle(datenbank)
  ensureRufbereitschaftenTabelle(datenbank)
}

function fuehreMigrationenAus(datenbank: Db): void {
  // Datenbanken aus der Zeit vor der Versionierung tragen 0 und entsprechen Version 1.
  const start = Math.max(leseVersion(datenbank), 1)

  for (let version = start; version < SCHEMA_VERSION; version++) {
    const migration = MIGRATIONEN[version - 1]

    // Je Migration eine Transaktion: Bricht eine ab, steht die Datenbank auf der letzten
    // vollständig angewandten Version statt auf halbem Weg.
    datenbank.transaction(() => {
      migration(datenbank)
      setzeVersion(datenbank, version + 1)
    })()
  }

  // Auch dann nötig, wenn die Schleife nichts zu tun hatte: Eine Datenbank aus der Zeit
  // vor der Versionierung trägt 0 und bekommt hier ihren ersten Stempel.
  setzeVersion(datenbank, SCHEMA_VERSION)
}

function istOhneTabellen(datenbank: Db): boolean {
  const zeile = datenbank
    .prepare(
      `SELECT COUNT(*) AS anzahl FROM sqlite_master
       WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
    )
    .get() as { anzahl: number }

  return zeile.anzahl === 0
}

export function leseVersion(datenbank: Db): number {
  return datenbank.pragma('user_version', { simple: true }) as number
}

function setzeVersion(datenbank: Db, version: number): void {
  // Pragmas nehmen keine Parameterbindung entgegen; die Zahl stammt ausschließlich aus
  // SCHEMA_VERSION und der Schleife darüber, nie aus einer Eingabe.
  datenbank.pragma(`user_version = ${version}`)
}
