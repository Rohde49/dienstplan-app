import { afterEach, describe, expect, it } from 'vitest'
import { beendeApp, starteApp, type GestarteteApp } from './appStart'
import type { API } from '../src/preload/index.d'

// Innerhalb von page.evaluate läuft der Code im Renderer. Die globale Window-
// Erweiterung aus src/preload/index.d.ts steht hier nicht zur Verfügung (Node-tsconfig
// ohne DOM-Lib), deshalb der Zugriff über diesen expliziten Typ.
type RendererFenster = Window & { api: API; require?: unknown; process?: unknown }

// Ebene 5 der Teststrategie: bewusst schmale Smoke-Suite gegen die gebaute App.
// Hier gehört nur hin, was sich ausschließlich im Zusammenspiel aller drei Prozesse
// zeigt — Fachregeln werden auf den Ebenen 1 und 2 geprüft, UI-Verhalten auf Ebene 3.

let laufend: GestarteteApp | null = null

afterEach(async () => {
  if (laufend) {
    await beendeApp(laufend)
    laufend = null
  }
})

describe('Anwendungsstart', () => {
  it('öffnet ein Fenster und zeigt die drei Navigations-Cards der Startseite', async () => {
    laufend = await starteApp()
    const { fenster } = laufend

    // Ohne @playwright/test gibt es keine web-first-Assertions — auf Sichtbarkeit
    // warten und danach mit Vitest prüfen.
    for (const beschriftung of ['Team-Verwaltung', 'Eintrag-Verwaltung', 'Dienstplan erstellen']) {
      const element = fenster.getByText(beschriftung)
      await element.waitFor({ state: 'visible' })
      expect(await element.isVisible()).toBe(true)
    }
  })
})

describe('Prozessgrenze zwischen Renderer und Main', () => {
  it('stellt dem Renderer weder Node-Require noch die Datenbank direkt bereit', async () => {
    laufend = await starteApp()
    const { fenster } = laufend

    const erreichbar = await fenster.evaluate(() => {
      const w = window as unknown as RendererFenster
      return { require: typeof w.require, process: typeof w.process, api: typeof w.api }
    })

    // Der Renderer darf better-sqlite3 nur über die Preload-Brücke erreichen.
    expect(erreichbar.require).toBe('undefined')
    expect(erreichbar.process).toBe('undefined')
    expect(erreichbar.api).toBe('object')
  })
})

describe('Durchstich Renderer → IPC → SQLite', () => {
  it('speichert einen Mitarbeiter dauerhaft und findet ihn nach einem Neustart wieder', async () => {
    laufend = await starteApp()
    const verzeichnis = laufend.benutzerdatenVerzeichnis

    await laufend.fenster.evaluate(async () => {
      await (window as unknown as RendererFenster).api.team.add({
        vorname: 'Nina',
        name: 'Krause',
        rolle: 'Erzieher',
        wochenarbeitszeitMinuten: 2340,
        farbe: '#3A8DFF'
      })
    })

    // Erster Lauf beenden, Verzeichnis behalten — die Datei auf Platte ist der Prüfgegenstand.
    await beendeApp(laufend, { verzeichnisLoeschen: false })

    laufend = await starteApp(verzeichnis)
    const nachNeustart = await laufend.fenster.evaluate(() =>
      (window as unknown as RendererFenster).api.team.list()
    )

    expect(nachNeustart).toHaveLength(1)
    expect(nachNeustart[0]).toMatchObject({ vorname: 'Nina', name: 'Krause', rolle: 'Erzieher' })
  })
})
