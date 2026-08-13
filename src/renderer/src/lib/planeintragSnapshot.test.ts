import { describe, expect, it } from 'vitest'
import { erzeugePlaneintragSnapshot, planeintraegeAlsEntwurf } from './planeintragSnapshot'
import type { Eintragsdefinition, Planeintrag, TeamMember } from '../../../shared/types'

const teamMember: TeamMember = {
  id: 1,
  vorname: 'Erika',
  name: 'Musterfrau',
  rolle: 'Erzieher',
  wochenarbeitszeitMinuten: 2340,
  farbe: '#3A8DFF'
}

const festeEintragsdefinition: Eintragsdefinition = {
  id: 1,
  kuerzel: 'F',
  name: 'Frühdienst',
  berechnungsart: 'fest',
  beginn: '06:00',
  ende: '14:00',
  anwesenheitszeitMinuten: 480,
  arbeitszeitMinuten: 450,
  arbeitszeitOhneNachtbereitschaftMinuten: 450,
  nachtbereitschaftMinuten: 0,
  nachtarbeitMinuten: 0
}

const mitarbeiterabhaengigeEintragsdefinition: Eintragsdefinition = {
  id: 2,
  kuerzel: 'U',
  name: 'Urlaub',
  berechnungsart: 'mitarbeiterabhaengig',
  beginn: null,
  ende: null,
  anwesenheitszeitMinuten: 0,
  arbeitszeitMinuten: 0,
  arbeitszeitOhneNachtbereitschaftMinuten: 0,
  nachtbereitschaftMinuten: 0,
  nachtarbeitMinuten: 0
}

describe('erzeugePlaneintragSnapshot', () => {
  it('übernimmt bei einer festen Eintragsdefinition alle Werte als Snapshot', () => {
    expect(erzeugePlaneintragSnapshot(festeEintragsdefinition, teamMember)).toEqual({
      eintragsdefinitionId: 1,
      kuerzel: 'F',
      beginn: '06:00',
      ende: '14:00',
      anwesenheitszeitMinuten: 480,
      arbeitszeitMinuten: 450,
      arbeitszeitOhneNachtbereitschaftMinuten: 450,
      nachtbereitschaftMinuten: 0,
      nachtarbeitMinuten: 0
    })
  })

  it('berechnet bei einer mitarbeiterabhängigen Eintragsdefinition arbeitszeitMinuten aus der Wochenarbeitszeit', () => {
    expect(erzeugePlaneintragSnapshot(mitarbeiterabhaengigeEintragsdefinition, teamMember)).toEqual(
      {
        eintragsdefinitionId: 2,
        kuerzel: 'U',
        beginn: null,
        ende: null,
        anwesenheitszeitMinuten: 0,
        arbeitszeitMinuten: 468,
        arbeitszeitOhneNachtbereitschaftMinuten: 0,
        nachtbereitschaftMinuten: 0,
        nachtarbeitMinuten: 0
      }
    )
  })
})

describe('planeintraegeAlsEntwurf', () => {
  it('gibt ein leeres Objekt für eine leere Liste zurück', () => {
    expect(planeintraegeAlsEntwurf([])).toEqual({})
  })

  it('indiziert jeden Planeintrag über dienstplantagId und teamMemberId, ohne id-Feld', () => {
    const planeintrag: Planeintrag = {
      id: 42,
      dienstplantagId: 5,
      teamMemberId: 1,
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

    expect(planeintraegeAlsEntwurf([planeintrag])).toEqual({
      '5:1': {
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
    })
  })
})
