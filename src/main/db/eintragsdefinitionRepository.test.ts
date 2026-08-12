import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addEintragsdefinition,
  ensureEintragsdefinitionenTable,
  getEintragsdefinitionen,
  updateEintragsdefinition
} from './eintragsdefinitionRepository'
import type { Eintragsdefinition } from '../../shared/types'

let testDb: InstanceType<typeof Database>

function neueFesteEintragsdefinition(
  overrides: Partial<Omit<Eintragsdefinition, 'id'>> = {}
): Omit<Eintragsdefinition, 'id'> {
  return {
    kuerzel: 'F',
    name: 'Frühdienst',
    berechnungsart: 'fest',
    beginn: '06:00',
    ende: '14:00',
    anwesenheitszeitMinuten: 480,
    arbeitszeitMinuten: 450,
    arbeitszeitOhneNachtbereitschaftMinuten: 450,
    nachtbereitschaftMinuten: 0,
    nachtarbeitMinuten: 0,
    ...overrides
  }
}

function neueMitarbeiterabhaengigeEintragsdefinition(
  overrides: Partial<Omit<Eintragsdefinition, 'id'>> = {}
): Omit<Eintragsdefinition, 'id'> {
  return {
    kuerzel: 'U',
    name: 'Urlaub',
    berechnungsart: 'mitarbeiterabhaengig',
    beginn: null,
    ende: null,
    anwesenheitszeitMinuten: 0,
    arbeitszeitMinuten: 0,
    arbeitszeitOhneNachtbereitschaftMinuten: 0,
    nachtbereitschaftMinuten: 0,
    nachtarbeitMinuten: 0,
    ...overrides
  }
}

beforeEach(() => {
  testDb = new Database(':memory:')
  ensureEintragsdefinitionenTable(testDb)
})

describe('getEintragsdefinitionen', () => {
  it('gibt eine leere Liste zurück, wenn noch keine Eintragsdefinition angelegt wurde', () => {
    expect(getEintragsdefinitionen(testDb)).toEqual([])
  })

  it('gibt alle angelegten Eintragsdefinitionen sortiert nach id zurück', () => {
    addEintragsdefinition(neueFesteEintragsdefinition({ kuerzel: 'F' }), testDb)
    addEintragsdefinition(neueMitarbeiterabhaengigeEintragsdefinition({ kuerzel: 'U' }), testDb)

    const eintraege = getEintragsdefinitionen(testDb)
    expect(eintraege.map((e) => e.kuerzel)).toEqual(['F', 'U'])
  })
})

describe('addEintragsdefinition', () => {
  it('vergibt eine numerische id und übernimmt die Eingabedaten (fest)', () => {
    const created = addEintragsdefinition(neueFesteEintragsdefinition(), testDb)

    expect(created.id).toBeTypeOf('number')
    expect(created).toMatchObject(neueFesteEintragsdefinition())
  })

  it('speichert beginn/ende korrekt als null bei mitarbeiterabhängigen Einträgen', () => {
    const created = addEintragsdefinition(neueMitarbeiterabhaengigeEintragsdefinition(), testDb)

    expect(created.beginn).toBeNull()
    expect(created.ende).toBeNull()
  })

  it('vergibt aufsteigende, eindeutige ids', () => {
    const first = addEintragsdefinition(neueFesteEintragsdefinition({ kuerzel: 'F' }), testDb)
    const second = addEintragsdefinition(
      neueMitarbeiterabhaengigeEintragsdefinition({ kuerzel: 'U' }),
      testDb
    )

    expect(second.id).toBeGreaterThan(first.id)
  })

  it('macht neu angelegte Eintragsdefinitionen über getEintragsdefinitionen sichtbar', () => {
    addEintragsdefinition(neueFesteEintragsdefinition(), testDb)

    expect(getEintragsdefinitionen(testDb)).toHaveLength(1)
  })
})

describe('updateEintragsdefinition', () => {
  it('aktualisiert eine bestehende Eintragsdefinition und gibt sie mit den neuen Werten zurück', () => {
    const created = addEintragsdefinition(neueFesteEintragsdefinition(), testDb)

    const updated = updateEintragsdefinition(
      created.id,
      neueFesteEintragsdefinition({ name: 'Frühdienst-Updated', ende: '13:30' }),
      testDb
    )

    expect(updated).toEqual({
      id: created.id,
      ...neueFesteEintragsdefinition({ name: 'Frühdienst-Updated', ende: '13:30' })
    })
  })

  it('persistiert die Änderung, sichtbar über getEintragsdefinitionen', () => {
    const created = addEintragsdefinition(neueFesteEintragsdefinition(), testDb)

    updateEintragsdefinition(
      created.id,
      neueFesteEintragsdefinition({ name: 'Frühdienst-Updated' }),
      testDb
    )

    const eintraege = getEintragsdefinitionen(testDb)
    expect(eintraege).toHaveLength(1)
    expect(eintraege[0].name).toBe('Frühdienst-Updated')
  })

  it('erlaubt den Wechsel von fest zu mitarbeiterabhängig inkl. beginn/ende auf null', () => {
    const created = addEintragsdefinition(neueFesteEintragsdefinition(), testDb)

    const updated = updateEintragsdefinition(
      created.id,
      neueMitarbeiterabhaengigeEintragsdefinition({ kuerzel: created.kuerzel }),
      testDb
    )

    expect(updated.beginn).toBeNull()
    expect(updated.ende).toBeNull()
    expect(updated.berechnungsart).toBe('mitarbeiterabhaengig')
  })

  it('ändert nur den Datensatz mit passender id, andere bleiben unverändert', () => {
    const first = addEintragsdefinition(neueFesteEintragsdefinition({ kuerzel: 'F' }), testDb)
    const second = addEintragsdefinition(
      neueMitarbeiterabhaengigeEintragsdefinition({ kuerzel: 'U' }),
      testDb
    )

    updateEintragsdefinition(
      first.id,
      neueFesteEintragsdefinition({ kuerzel: 'F', name: 'Frühdienst-Updated' }),
      testDb
    )

    const eintraege = getEintragsdefinitionen(testDb)
    expect(eintraege.find((e) => e.id === first.id)?.name).toBe('Frühdienst-Updated')
    expect(eintraege.find((e) => e.id === second.id)?.kuerzel).toBe('U')
  })
})
