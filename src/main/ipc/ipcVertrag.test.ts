import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ALLE_IPC_KANAELE } from '../../shared/ipcKanaele'

// Gesammelte Kanalnamen aller ipcMain.handle-Aufrufe. Das Modul 'electron' existiert
// im Testlauf nicht als echtes Modul, deshalb hier ein Doppel, das nur mitschreibt.
const registrierteKanaele: string[] = []

vi.mock('electron', () => ({
  ipcMain: {
    handle: (kanal: string) => {
      registrierteKanaele.push(kanal)
    }
  }
}))

// Die Handler bekommen die Datenbank als Parameter und öffnen selbst keine. Für die
// reine Registrierung wird sie nie berührt — die Aufrufe stecken in Callbacks, die
// dieser Test nicht auslöst —, deshalb genügt hier ein leeres Doppel.
const datenbankDoppel = {} as Parameters<typeof import('./teamHandlers').registerTeamHandlers>[0]

async function registriereAlleHandler(): Promise<void> {
  const [team, eintragsdefinition, dienstplan, planeintrag, rufbereitschaft] = await Promise.all([
    import('./teamHandlers'),
    import('./eintragsdefinitionHandlers'),
    import('./dienstplanHandlers'),
    import('./planeintragHandlers'),
    import('./rufbereitschaftHandlers')
  ])

  team.registerTeamHandlers(datenbankDoppel)
  eintragsdefinition.registerEintragsdefinitionHandlers(datenbankDoppel)
  dienstplan.registerDienstplanHandlers(datenbankDoppel)
  planeintrag.registerPlaneintragHandlers(datenbankDoppel)
  rufbereitschaft.registerRufbereitschaftHandlers(datenbankDoppel)
}

beforeEach(async () => {
  registrierteKanaele.length = 0
  await registriereAlleHandler()
})

// Renderer und Main sind nur über Kanalnamen verbunden — eine Verbindung, die weder
// der TypeScript-Compiler noch ein Fachtest prüfen kann. Diese Datei schließt die
// Lücke: Sie vergleicht die in src/shared/ipcKanaele.ts deklarierten Kanäle mit denen,
// die beim Start tatsächlich registriert werden, in beide Richtungen.
//
// Was der Test nachweislich erkennt (beide Fälle gegengeprüft):
//   - ein Kanal ist deklariert und im Preload benutzt, aber kein Handler registriert
//   - ein Handler ist registriert, den niemand deklariert hat (verwaist)
//   - ein Kanal wird versehentlich doppelt registriert
//
// Was er bewusst NICHT erkennt: eine Umbenennung in IPC_KANAELE. Preload und Handler
// lesen dieselbe Konstante, eine Umbenennung bewegt beide Seiten gleichzeitig — genau
// deshalb wurde die Konstante eingeführt. Diese Fehlerklasse existiert nicht mehr,
// statt vom Test abgefangen zu werden.
describe('IPC-Vertrag zwischen Preload und Main', () => {
  it('registriert für jeden deklarierten Kanal einen Handler', () => {
    const fehlend = ALLE_IPC_KANAELE.filter((kanal) => !registrierteKanaele.includes(kanal))
    expect(fehlend).toEqual([])
  })

  it('registriert keinen Handler, der nicht deklariert ist', () => {
    const ueberzaehlig = registrierteKanaele.filter((kanal) => !ALLE_IPC_KANAELE.includes(kanal))
    expect(ueberzaehlig).toEqual([])
  })

  it('registriert jeden Kanal genau einmal', () => {
    const doppelte = registrierteKanaele.filter(
      (kanal, index) => registrierteKanaele.indexOf(kanal) !== index
    )
    expect(doppelte).toEqual([])
  })
})
