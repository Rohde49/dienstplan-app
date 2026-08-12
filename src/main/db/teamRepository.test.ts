import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addTeamMember,
  ensureTeamMembersTable,
  getTeamMembers,
  updateTeamMember
} from './teamRepository'
import type { TeamMember } from '../../shared/types'

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

beforeEach(() => {
  testDb = new Database(':memory:')
  ensureTeamMembersTable(testDb)
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
