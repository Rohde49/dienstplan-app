import { afterEach, describe, expect, it } from 'vitest'
import { beendeApp, starteApp, type GestarteteApp } from './appStart'
import { lesePdf } from './pdf'
import type { API } from '../src/preload/index.d'

type RendererFenster = Window & { api: API }

// Der native Windows-Druckdialog lässt sich nicht automatisieren — das Druckergebnis
// sehr wohl. printToPDF im Main-Prozess erzeugt exakt die Ausgabe, die auch bei
// „Microsoft Print to PDF" entsteht, und ist damit ein echtes Prüfsignal für die
// Zusage aus Schritt 17: „der Dienstplan passt vollständig auf eine A4-Seite".

let laufend: GestarteteApp | null = null

afterEach(async () => {
  if (laufend) {
    await beendeApp(laufend)
    laufend = null
  }
})

const MITARBEITER = [
  { vorname: 'Nina', name: 'Krause', farbe: '#3A8DFF' },
  { vorname: 'Tom', name: 'Weber', farbe: '#34B37A' },
  { vorname: 'Lea', name: 'Sommer', farbe: '#F2994A' }
]

// September hat 30 Tage — eine feste, vom Testdatum unabhängige Erwartung. Das Jahr
// muss dagegen aus dem aktuellen stammen, weil die Jahresauswahl nur ±2 Jahre anbietet.
const JAHR = new Date().getFullYear()
const TAGE_IM_SEPTEMBER = 30
const PLAN_TITEL = `Dienstplan September ${JAHR}`

// Die Mitarbeiter kommen über die API-Brücke, weil ihr Anlegen über die UI in der
// Team-Verwaltung bereits auf Ebene 3 geprüft wird. Der Dienstplan selbst wird
// dagegen über die Oberfläche erstellt — genau der Weg, den auch der Nutzer geht.
async function bereiteMitarbeiterVor(gestartet: GestarteteApp): Promise<void> {
  await gestartet.fenster.evaluate(async (mitarbeiter) => {
    const api = (window as unknown as RendererFenster).api
    for (const person of mitarbeiter) {
      await api.team.add({ ...person, rolle: 'Erzieher', wochenarbeitszeitMinuten: 2340 })
    }
  }, MITARBEITER)
}

async function druckeAlsPdf(gestartet: GestarteteApp): Promise<Buffer> {
  const base64 = await gestartet.app.evaluate(async ({ BrowserWindow }) => {
    const fenster = BrowserWindow.getAllWindows()[0]
    const puffer = await fenster.webContents.printToPDF({
      pageSize: 'A4',
      landscape: false,
      printBackground: true
    })
    return puffer.toString('base64')
  })
  return Buffer.from(base64, 'base64')
}

async function oeffneDruckvorschauMitPlan(gestartet: GestarteteApp): Promise<string> {
  await bereiteMitarbeiterVor(gestartet)

  const { fenster } = gestartet
  await fenster.getByText('Dienstplan erstellen').click()

  // Monat und Jahr fest setzen — sonst hinge das erwartete Ergebnis am Testdatum.
  await fenster.getByLabel('Monat').click()
  await fenster.getByRole('option', { name: 'September' }).click()
  await fenster.getByLabel('Jahr').click()
  await fenster.getByRole('option', { name: String(JAHR) }).click()

  await fenster.getByPlaceholder('Titel (optional)').fill(PLAN_TITEL)
  await fenster.getByRole('button', { name: 'Erstellen' }).click()
  await fenster.getByRole('button', { name: 'Druckvorschau' }).click()

  const { text, seiten } = await lesePdf(await druckeAlsPdf(gestartet))
  expect(seiten).toBe(1)
  return text
}

function fehlendeTage(text: string): string[] {
  // Die Datumsspalte zeigt die Tage als "01.09." bis "30.09.".
  return Array.from(
    { length: TAGE_IM_SEPTEMBER },
    (_, index) => `${String(index + 1).padStart(2, '0')}.09.`
  ).filter((tag) => !text.includes(tag))
}

describe('Druckausgabe', () => {
  it('erzeugt aus der Druckvorschau ein einseitiges PDF mit allen Mitarbeiterspalten', async () => {
    laufend = await starteApp()
    const text = await oeffneDruckvorschauMitPlan(laufend)

    for (const person of MITARBEITER) {
      expect(text).toContain(person.vorname)
    }
  })

  // BEKANNTER MANGEL, wird vom PDF-Export behoben (registriert in
  // docs/test/offene-maengel.md).
  //
  // Der Druck liefert heute zwar eine Seite, aber der letzte Tag des Monats fehlt
  // darauf: die Ansicht aus Schritt 16 ist ein Scrollcontainer, gedruckt wird nur der
  // sichtbare Ausschnitt. Genau diese Zusage — "alles passt vollständig auf eine
  // A4-Seite" — löst der PDF-Export über die feste A4-Fläche mit Live-Skalierung ein.
  //
  // `it.fails` hält den Mangel fest, ohne die Suite rot zu färben, und schlägt fehl,
  // sobald der Test bestehen WÜRDE. Nach Abschluss des PDF-Exports ist daher `.fails`
  // zu entfernen — der Test kann nicht stillschweigend veralten.
  it.fails('legt alle Tage des Monats auf die Seite — offen bis Schritt 17', async () => {
    laufend = await starteApp()
    const text = await oeffneDruckvorschauMitPlan(laufend)

    expect(fehlendeTage(text)).toEqual([])
  })
})

describe('Seitenzählung im PDF', () => {
  it('erkennt die Seitenanzahl eines von Chromium erzeugten PDFs', async () => {
    laufend = await starteApp()
    const { seiten } = await lesePdf(await druckeAlsPdf(laufend))

    // Die Startseite ist kurz — ein Blatt. Sichert zugleich lesePdf() selbst ab:
    // ohne diesen Fall wäre bei einem stillen Parser-Fehler nicht unterscheidbar,
    // ob das PDF einseitig ist oder die Auswertung nichts gefunden hat.
    expect(seiten).toBe(1)
  })
})
