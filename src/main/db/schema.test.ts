import Database from 'better-sqlite3'
import { describe, expect, it } from 'vitest'
import { SCHEMA_VERSION, bereiteDatenbankVor, leseVersion } from './schema'

type Db = InstanceType<typeof Database>

function frischeDatenbank(): Db {
  return new Database(':memory:')
}

// Diese Datei prüft nicht das Fachschema, sondern die Zusagen, die `bereiteDatenbankVor`
// über den Zustand einer geöffneten Datenbank macht. Beides ist bis zur Auslieferung des
// ersten Installers billig zu ändern und danach nicht mehr.
describe('Datenbank-Vorbereitung', () => {
  describe('Schemaversion', () => {
    it('stempelt eine frische Datenbank auf die aktuelle Version', () => {
      const datenbank = frischeDatenbank()

      bereiteDatenbankVor(datenbank)

      expect(leseVersion(datenbank)).toBe(SCHEMA_VERSION)
    })

    it('lässt die Version bei einem zweiten Aufruf unverändert', () => {
      const datenbank = frischeDatenbank()

      bereiteDatenbankVor(datenbank)
      bereiteDatenbankVor(datenbank)

      expect(leseVersion(datenbank)).toBe(SCHEMA_VERSION)
    })

    // Datenbanken, die vor der Einführung der Versionierung entstanden sind, tragen 0,
    // haben aber bereits das vollständige Schema. Sie dürfen nicht wie eine frische
    // Datenbank behandelt werden, sonst würden künftige Migrationen an ihnen vorbeilaufen.
    it('erkennt eine bestehende Datenbank ohne Versionsstempel als Version 1', () => {
      const datenbank = frischeDatenbank()
      bereiteDatenbankVor(datenbank)
      datenbank.pragma('user_version = 0')

      bereiteDatenbankVor(datenbank)

      expect(leseVersion(datenbank)).toBe(SCHEMA_VERSION)
    })
  })

  describe('Pragmas', () => {
    it('schaltet die Fremdschlüsselprüfung ein', () => {
      const datenbank = frischeDatenbank()

      bereiteDatenbankVor(datenbank)

      expect(datenbank.pragma('foreign_keys', { simple: true })).toBe(1)
    })

    // Die REFERENCES-Klauseln der Repositories sind ohne das Pragma reine Dekoration:
    // SQLite prüft Fremdschlüssel per Voreinstellung nicht. Dieser Fall belegt, dass die
    // Prüfung tatsächlich greift und nicht nur das Pragma gesetzt ist.
    it('weist einen Planeintrag ohne zugehörigen Dienstplantag zurück', () => {
      const datenbank = frischeDatenbank()
      bereiteDatenbankVor(datenbank)

      const einfuegen = (): void => {
        datenbank
          .prepare(
            `INSERT INTO planeintraege (
               dienstplantagId, teamMemberId, eintragsdefinitionId, kuerzel,
               anwesenheitszeitMinuten, arbeitszeitMinuten,
               arbeitszeitOhneNachtbereitschaftMinuten, nachtbereitschaftMinuten,
               nachtarbeitMinuten
             ) VALUES (999, 1, 1, 'F', 480, 480, 480, 0, 0)`
          )
          .run()
      }

      expect(einfuegen).toThrow(/FOREIGN KEY/i)
    })
  })
})
