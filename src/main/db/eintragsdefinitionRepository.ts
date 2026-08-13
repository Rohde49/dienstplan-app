import type Database from 'better-sqlite3'
import type { Eintragsdefinition } from '../../shared/types'

type Db = InstanceType<typeof Database>

export function ensureEintragsdefinitionenTable(database: Db): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS eintragsdefinitionen (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kuerzel TEXT NOT NULL,
      name TEXT NOT NULL,
      berechnungsart TEXT NOT NULL,
      beginn TEXT,
      ende TEXT,
      anwesenheitszeitMinuten INTEGER NOT NULL,
      arbeitszeitMinuten INTEGER NOT NULL,
      arbeitszeitOhneNachtbereitschaftMinuten INTEGER NOT NULL,
      nachtbereitschaftMinuten INTEGER NOT NULL,
      nachtarbeitMinuten INTEGER NOT NULL
    )
  `)
}

export function getEintragsdefinitionen(database: Db): Eintragsdefinition[] {
  return database
    .prepare(
      `SELECT id, kuerzel, name, berechnungsart, beginn, ende,
              anwesenheitszeitMinuten, arbeitszeitMinuten,
              arbeitszeitOhneNachtbereitschaftMinuten, nachtbereitschaftMinuten, nachtarbeitMinuten
       FROM eintragsdefinitionen ORDER BY id`
    )
    .all() as Eintragsdefinition[]
}

export function addEintragsdefinition(
  data: Omit<Eintragsdefinition, 'id'>,
  database: Db
): Eintragsdefinition {
  const result = database
    .prepare(
      `INSERT INTO eintragsdefinitionen
         (kuerzel, name, berechnungsart, beginn, ende,
          anwesenheitszeitMinuten, arbeitszeitMinuten,
          arbeitszeitOhneNachtbereitschaftMinuten, nachtbereitschaftMinuten, nachtarbeitMinuten)
       VALUES
         (@kuerzel, @name, @berechnungsart, @beginn, @ende,
          @anwesenheitszeitMinuten, @arbeitszeitMinuten,
          @arbeitszeitOhneNachtbereitschaftMinuten, @nachtbereitschaftMinuten, @nachtarbeitMinuten)`
    )
    .run(data)

  return { id: Number(result.lastInsertRowid), ...data }
}

// id stammt stets aus zuvor geladenen Daten, kein Not-Found-Handling nötig
export function updateEintragsdefinition(
  id: number,
  data: Omit<Eintragsdefinition, 'id'>,
  database: Db
): Eintragsdefinition {
  database
    .prepare(
      `UPDATE eintragsdefinitionen
       SET kuerzel = @kuerzel, name = @name, berechnungsart = @berechnungsart,
           beginn = @beginn, ende = @ende,
           anwesenheitszeitMinuten = @anwesenheitszeitMinuten,
           arbeitszeitMinuten = @arbeitszeitMinuten,
           arbeitszeitOhneNachtbereitschaftMinuten = @arbeitszeitOhneNachtbereitschaftMinuten,
           nachtbereitschaftMinuten = @nachtbereitschaftMinuten,
           nachtarbeitMinuten = @nachtarbeitMinuten
       WHERE id = @id`
    )
    .run({ ...data, id })

  return { id, ...data }
}

export function deleteEintragsdefinition(id: number, database: Db): void {
  database.prepare('DELETE FROM eintragsdefinitionen WHERE id = ?').run(id)
}
