import Database from 'better-sqlite3'
import { bereiteDatenbankVor } from '../main/db/schema'

type Db = InstanceType<typeof Database>

// Frische In-Memory-Datenbank mit vollständigem Schema. Die Vorbereitung läuft über
// dieselbe Funktion, die auch der Main-Prozess beim App-Start auf die Datei des Nutzers
// anwendet — die Tests können deshalb weder gegen ein abweichendes Schema noch gegen
// abweichende Pragmas laufen. Insbesondere `foreign_keys = ON` gilt hier genauso wie in
// der Produktion; ohne das würden Fremdschlüsselverletzungen im Test unbemerkt bleiben.
export function erzeugeTestDatenbank(): Db {
  const datenbank = new Database(':memory:')
  bereiteDatenbankVor(datenbank)
  return datenbank
}
