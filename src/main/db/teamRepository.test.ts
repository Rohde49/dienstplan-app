import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDienstplan,
  ensureDienstplanTabellen,
  speicherePlanungsstand
} from './dienstplanRepository'
import { ensurePlaneintraegeTabelle } from './planeintragRepository'
import { ensureRufbereitschaftenTabelle } from './rufbereitschaftRepository'
import {
  addTeamMember,
  deleteTeamMember,
  ensureTeamMembersTable,
  getTeamMembers,
  updateTeamMember
} from './teamRepository'
import type { PlaneintragSnapshot, TeamMember } from '../../shared/types'

let testDb: InstanceType<typeof Database>

function neuerMitarbeiter(overrides: Partial<Omit<TeamMember, 'id'>> = {}): Omit<TeamMember, 'id'> {
  return {
    vorname: 'Nina',
    name: 'Krause',
    rolle: 'Erzieher',
    wochenarbeitszeitMinuten: 2340,
    farbe: '#3A8DFF',
    ...overrides
  }
}

const festerSnapshot: PlaneintragSnapshot = {
  eintragsdefinitionId: 1,
  kuerzel: 'F',
  beginn: '06:00',
  ende: '14:00',
  anwesenheitszeitMinuten: 480,
  arbeitszeitMinuten: 450,
  arbeitszeitOhneNachtbereitschaftMinuten: 450,
  nachtbereitschaftMinuten: 0,
  nachtarbeitMinuten: 0
}

beforeEach(() => {
  testDb = new Database(':memory:')
  ensureTeamMembersTable(testDb)
  ensureDienstplanTabellen(testDb)
  ensurePlaneintraegeTabelle(testDb)
  ensureRufbereitschaftenTabelle(testDb)
})

describe('getTeamMembers', () => {
  it('gibt eine leere Liste zurück, wenn noch kein Mitarbeiter angelegt wurde', () => {
    expect(getTeamMembers(testDb)).toEqual([])
  })

  it('gibt alle angelegten Mitarbeiter sortiert nach id zurück', () => {
    addTeamMember(neuerMitarbeiter({ vorname: 'Nina' }), testDb)
    addTeamMember(neuerMitarbeiter({ vorname: 'Tom' }), testDb)

    const members = getTeamMembers(testDb)
    expect(members.map((m) => m.vorname)).toEqual(['Nina', 'Tom'])
  })
})

describe('addTeamMember', () => {
  it('vergibt eine numerische id und übernimmt die Eingabedaten', () => {
    const created = addTeamMember(neuerMitarbeiter(), testDb)

    expect(created.id).toBeTypeOf('number')
    expect(created).toMatchObject(neuerMitarbeiter())
  })

  it('vergibt aufsteigende, eindeutige ids', () => {
    const first = addTeamMember(neuerMitarbeiter({ vorname: 'Nina' }), testDb)
    const second = addTeamMember(neuerMitarbeiter({ vorname: 'Tom' }), testDb)

    expect(second.id).toBeGreaterThan(first.id)
  })

  it('macht neu angelegte Mitarbeiter über getTeamMembers sichtbar', () => {
    addTeamMember(neuerMitarbeiter(), testDb)

    expect(getTeamMembers(testDb)).toHaveLength(1)
  })
})

describe('updateTeamMember', () => {
  it('aktualisiert einen bestehenden Mitarbeiter und gibt ihn mit den neuen Werten zurück', () => {
    const created = addTeamMember(neuerMitarbeiter(), testDb)

    const updated = updateTeamMember(
      created.id,
      neuerMitarbeiter({ vorname: 'Nina-Updated', wochenarbeitszeitMinuten: 1200 }),
      testDb
    )

    expect(updated).toEqual({
      id: created.id,
      vorname: 'Nina-Updated',
      name: 'Krause',
      rolle: 'Erzieher',
      wochenarbeitszeitMinuten: 1200,
      farbe: '#3A8DFF'
    })
  })

  it('persistiert die Änderung, sichtbar über getTeamMembers', () => {
    const created = addTeamMember(neuerMitarbeiter(), testDb)

    updateTeamMember(created.id, neuerMitarbeiter({ vorname: 'Nina-Updated' }), testDb)

    const members = getTeamMembers(testDb)
    expect(members).toHaveLength(1)
    expect(members[0].vorname).toBe('Nina-Updated')
  })

  it('ändert nur den Datensatz mit passender id, andere bleiben unverändert', () => {
    const first = addTeamMember(neuerMitarbeiter({ vorname: 'Nina' }), testDb)
    const second = addTeamMember(neuerMitarbeiter({ vorname: 'Tom' }), testDb)

    updateTeamMember(first.id, neuerMitarbeiter({ vorname: 'Nina-Updated' }), testDb)

    const members = getTeamMembers(testDb)
    expect(members.find((m) => m.id === first.id)?.vorname).toBe('Nina-Updated')
    expect(members.find((m) => m.id === second.id)?.vorname).toBe('Tom')
  })
})

describe('deleteTeamMember', () => {
  it('löscht einen unbenutzten Mitarbeiter', () => {
    const created = addTeamMember(neuerMitarbeiter(), testDb)

    const result = deleteTeamMember(created.id, testDb)

    expect(result).toEqual({ geloescht: true })
    expect(getTeamMembers(testDb)).toHaveLength(0)
  })

  it('blockiert das Löschen, wenn der Mitarbeiter in einem Planeintrag verwendet wird', () => {
    const created = addTeamMember(neuerMitarbeiter(), testDb)
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ dienstplantagId: tage[0].id, teamMemberId: created.id, eintrag: festerSnapshot }],
      [],
      [],
      testDb
    )

    const result = deleteTeamMember(created.id, testDb)

    expect(result.geloescht).toBe(false)
    expect(result.grund).toBeTruthy()
    expect(getTeamMembers(testDb)).toHaveLength(1)
  })

  it('blockiert das Löschen, wenn der Mitarbeiter in einer Rufbereitschaft verwendet wird', () => {
    const created = addTeamMember(neuerMitarbeiter(), testDb)
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [],
      [{ dienstplantagId: tage[0].id, teamMemberId: created.id }],
      [],
      testDb
    )

    const result = deleteTeamMember(created.id, testDb)

    expect(result.geloescht).toBe(false)
    expect(result.grund).toBeTruthy()
    expect(getTeamMembers(testDb)).toHaveLength(1)
  })
})
