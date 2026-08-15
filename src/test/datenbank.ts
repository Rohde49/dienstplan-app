import Database from 'better-sqlite3'
import { ensureDienstplanTabellen } from '../main/db/dienstplanRepository'
import { ensureEintragsdefinitionenTable } from '../main/db/eintragsdefinitionRepository'
import { ensurePlaneintraegeTabelle } from '../main/db/planeintragRepository'
import { ensureRufbereitschaftenTabelle } from '../main/db/rufbereitschaftRepository'
import { ensureTeamMembersTable } from '../main/db/teamRepository'

type Db = InstanceType<typeof Database>

// Frische In-Memory-Datenbank mit vollständigem Schema. Das Schema entsteht dabei
// über dieselben ensure…-Funktionen, die auch die IPC-Handler beim App-Start
// aufrufen — die Tests können deshalb nicht gegen ein abweichendes Schema laufen.
export function erzeugeTestDatenbank(): Db {
  const datenbank = new Database(':memory:')
  ensureTeamMembersTable(datenbank)
  ensureEintragsdefinitionenTable(datenbank)
  ensureDienstplanTabellen(datenbank)
  ensurePlaneintraegeTabelle(datenbank)
  ensureRufbereitschaftenTabelle(datenbank)
  return datenbank
}
