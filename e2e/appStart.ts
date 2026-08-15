import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { _electron as electron, type ElectronApplication, type Page } from 'playwright'

export interface GestarteteApp {
  app: ElectronApplication
  fenster: Page
  benutzerdatenVerzeichnis: string
}

/**
 * Startet die gebaute App (out/main/index.js) mit einem eigenen, leeren
 * Benutzerdatenverzeichnis. Ohne `--user-data-dir` würde db.ts über
 * app.getPath('userData') die echte Datenbank des Nutzers öffnen — ein Test darf
 * niemals die Produktivdaten anfassen.
 *
 * Das Verzeichnis kann über `benutzerdatenVerzeichnis` an einen zweiten Start
 * übergeben werden, um Persistenz über einen Neustart hinweg zu prüfen.
 */
export async function starteApp(benutzerdatenVerzeichnis?: string): Promise<GestarteteApp> {
  const verzeichnis = benutzerdatenVerzeichnis ?? mkdtempSync(join(tmpdir(), 'dienstplan-e2e-'))

  const app = await electron.launch({
    args: ['out/main/index.js', `--user-data-dir=${verzeichnis}`],
    // Verhindert, dass der Testlauf auf die Konfiguration des Entwicklerrechners reagiert.
    env: { ...process.env, NODE_ENV: 'production' }
  })

  const fenster = await app.firstWindow()
  await fenster.waitForLoadState('domcontentloaded')

  return { app, fenster, benutzerdatenVerzeichnis: verzeichnis }
}

export async function beendeApp(
  gestartet: GestarteteApp,
  { verzeichnisLoeschen = true } = {}
): Promise<void> {
  await gestartet.app.close()
  if (verzeichnisLoeschen) {
    rmSync(gestartet.benutzerdatenVerzeichnis, { recursive: true, force: true })
  }
}
