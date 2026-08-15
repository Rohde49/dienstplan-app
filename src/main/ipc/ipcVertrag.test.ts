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

// Verhindert, dass der Import der Handler die echte Datenbank öffnet: db.ts ruft beim
// Laden app.getPath('userData') auf, was ohne laufendes Electron fehlschlägt.
vi.mock('../db', () => ({ db: {} }))

// Die ensure…-Aufrufe der Handler laufen gegen das db-Doppel und müssen ins Leere gehen.
vi.mock('../db/teamRepository', () => ({ ensureTeamMembersTable: () => {} }))
vi.mock('../db/eintragsdefinitionRepository', () => ({ ensureEintragsdefinitionenTable: () => {} }))
vi.mock('../db/dienstplanRepository', () => ({ ensureDienstplanTabellen: () => {} }))
vi.mock('../db/planeintragRepository', () => ({ ensurePlaneintraegeTabelle: () => {} }))
vi.mock('../db/rufbereitschaftRepository', () => ({ ensureRufbereitschaftenTabelle: () => {} }))

async function registriereAlleHandler(): Promise<void> {
  const [team, eintragsdefinition, dienstplan, planeintrag, rufbereitschaft] = await Promise.all([
    import('./teamHandlers'),
    import('./eintragsdefinitionHandlers'),
    import('./dienstplanHandlers'),
    import('./planeintragHandlers'),
    import('./rufbereitschaftHandlers')
  ])

  team.registerTeamHandlers()
  eintragsdefinition.registerEintragsdefinitionHandlers()
  dienstplan.registerDienstplanHandlers()
  planeintrag.registerPlaneintragHandlers()
  rufbereitschaft.registerRufbereitschaftHandlers()
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
