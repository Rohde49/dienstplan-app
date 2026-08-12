import type Database from 'better-sqlite3'
import { getKalendertageFuerMonat } from '../../shared/kalendertage'
import type { Dienstplan, Dienstplantag } from '../../shared/types'

type Db = InstanceType<typeof Database>

export function ensureDienstplanTabellen(database: Db): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS dienstplaene (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monat INTEGER NOT NULL,
      jahr INTEGER NOT NULL,
      titel TEXT NOT NULL,
      erstelltAm TEXT NOT NULL,
      geaendertAm TEXT NOT NULL
    )
  `)

  database.exec(`
    CREATE TABLE IF NOT EXISTS dienstplantage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      dienstplanId INTEGER NOT NULL REFERENCES dienstplaene(id),
      datum TEXT NOT NULL,
      bemerkung TEXT
    )
  `)
}

export function getDienstplaene(database: Db): Dienstplan[] {
  return database
    .prepare('SELECT id, monat, jahr, titel, erstelltAm, geaendertAm FROM dienstplaene ORDER BY id')
    .all() as Dienstplan[]
}

export function getDienstplanMitTagen(
  id: number,
  database: Db
): { dienstplan: Dienstplan; tage: Dienstplantag[] } | null {
  const dienstplan = database
    .prepare(
      'SELECT id, monat, jahr, titel, erstelltAm, geaendertAm FROM dienstplaene WHERE id = ?'
    )
    .get(id) as Dienstplan | undefined

  if (!dienstplan) return null

  const tage = database
    .prepare(
      'SELECT id, dienstplanId, datum, bemerkung FROM dienstplantage WHERE dienstplanId = ? ORDER BY datum'
    )
    .all(id) as Dienstplantag[]

  return { dienstplan, tage }
}

export function createDienstplan(
  data: { monat: number; jahr: number; titel: string },
  database: Db
): { dienstplan: Dienstplan; tage: Dienstplantag[] } {
  const anlegen = database.transaction((input: { monat: number; jahr: number; titel: string }) => {
    const jetzt = new Date().toISOString()
    const result = database
      .prepare(
        `INSERT INTO dienstplaene (monat, jahr, titel, erstelltAm, geaendertAm)
           VALUES (@monat, @jahr, @titel, @erstelltAm, @geaendertAm)`
      )
      .run({ ...input, erstelltAm: jetzt, geaendertAm: jetzt })

    const dienstplanId = Number(result.lastInsertRowid)
    const dienstplan: Dienstplan = {
      id: dienstplanId,
      monat: input.monat,
      jahr: input.jahr,
      titel: input.titel,
      erstelltAm: jetzt,
      geaendertAm: jetzt
    }

    const insertTag = database.prepare(
      'INSERT INTO dienstplantage (dienstplanId, datum, bemerkung) VALUES (@dienstplanId, @datum, @bemerkung)'
    )

    const tage: Dienstplantag[] = getKalendertageFuerMonat(input.jahr, input.monat).map((tag) => {
      const tagResult = insertTag.run({ dienstplanId, datum: tag.datum, bemerkung: null })
      return {
        id: Number(tagResult.lastInsertRowid),
        dienstplanId,
        datum: tag.datum,
        bemerkung: null
      }
    })

    return { dienstplan, tage }
  })

  return anlegen(data)
}

// id stammt stets aus zuvor geladenen Daten, kein Not-Found-Handling nötig
export function updateDienstplanTitel(id: number, titel: string, database: Db): Dienstplan {
  const geaendertAm = new Date().toISOString()

  database
    .prepare('UPDATE dienstplaene SET titel = @titel, geaendertAm = @geaendertAm WHERE id = @id')
    .run({ id, titel, geaendertAm })

  return database
    .prepare(
      'SELECT id, monat, jahr, titel, erstelltAm, geaendertAm FROM dienstplaene WHERE id = ?'
    )
    .get(id) as Dienstplan
}
