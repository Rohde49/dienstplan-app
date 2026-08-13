import Database from 'better-sqlite3'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  createDienstplan,
  ensureDienstplanTabellen,
  getDienstplaene,
  getDienstplanMitTagen,
  speicherePlanungsstand,
  updateDienstplanTitel
} from './dienstplanRepository'
import { ensurePlaneintraegeTabelle, getPlaneintraegeFuerDienstplan } from './planeintragRepository'
import type { PlaneintragSnapshot } from '../../shared/types'

let testDb: InstanceType<typeof Database>

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

const mitarbeiterabhaengigerSnapshot: PlaneintragSnapshot = {
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

beforeEach(() => {
  testDb = new Database(':memory:')
  ensureDienstplanTabellen(testDb)
  ensurePlaneintraegeTabelle(testDb)
})

describe('createDienstplan', () => {
  it('legt einen Dienstplan mit den Eingabedaten an', () => {
    const { dienstplan } = createDienstplan({ monat: 8, jahr: 2026, titel: 'August 2026' }, testDb)

    expect(dienstplan.id).toBeTypeOf('number')
    expect(dienstplan).toMatchObject({ monat: 8, jahr: 2026, titel: 'August 2026' })
    expect(dienstplan.erstelltAm).toBe(dienstplan.geaendertAm)
  })

  it('legt genau eine Dienstplantag-Zeile je Kalendertag des Monats an (31 Tage im August)', () => {
    const { tage } = createDienstplan({ monat: 8, jahr: 2026, titel: '' }, testDb)
    expect(tage).toHaveLength(31)
  })

  it('legt 29 Tage für Februar im Schaltjahr an', () => {
    const { tage } = createDienstplan({ monat: 2, jahr: 2024, titel: '' }, testDb)
    expect(tage).toHaveLength(29)
  })

  it('legt 28 Tage für Februar im Nicht-Schaltjahr an', () => {
    const { tage } = createDienstplan({ monat: 2, jahr: 2023, titel: '' }, testDb)
    expect(tage).toHaveLength(28)
  })

  it('verknüpft jede Dienstplantag-Zeile mit der id des angelegten Dienstplans', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 4, jahr: 2023, titel: '' }, testDb)
    expect(tage.every((tag) => tag.dienstplanId === dienstplan.id)).toBe(true)
  })

  it('setzt bemerkung bei jeder neu angelegten Dienstplantag-Zeile auf null', () => {
    const { tage } = createDienstplan({ monat: 4, jahr: 2023, titel: '' }, testDb)
    expect(tage.every((tag) => tag.bemerkung === null)).toBe(true)
  })

  it('erlaubt mehrere Dienstpläne mit identischem Monat/Jahr, jeweils mit eigenen Tagen', () => {
    const erster = createDienstplan({ monat: 8, jahr: 2026, titel: 'Entwurf 1' }, testDb)
    const zweiter = createDienstplan({ monat: 8, jahr: 2026, titel: 'Entwurf 2' }, testDb)

    expect(zweiter.dienstplan.id).toBeGreaterThan(erster.dienstplan.id)
    expect(zweiter.tage).toHaveLength(31)
    expect(zweiter.tage.every((tag) => tag.dienstplanId === zweiter.dienstplan.id)).toBe(true)
  })
})

describe('getDienstplaene', () => {
  it('gibt eine leere Liste zurück, wenn noch kein Dienstplan angelegt wurde', () => {
    expect(getDienstplaene(testDb)).toEqual([])
  })

  it('gibt alle angelegten Dienstpläne ohne Tage zurück', () => {
    createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    createDienstplan({ monat: 9, jahr: 2026, titel: 'B' }, testDb)

    const dienstplaene = getDienstplaene(testDb)
    expect(dienstplaene.map((d) => d.titel)).toEqual(['A', 'B'])
  })
})

describe('getDienstplanMitTagen', () => {
  it('gibt null zurück, wenn kein Dienstplan mit der id existiert', () => {
    expect(getDienstplanMitTagen(999, testDb)).toBeNull()
  })

  it('gibt den Dienstplan mit allen zugehörigen Tagen zurück', () => {
    const { dienstplan } = createDienstplan({ monat: 4, jahr: 2023, titel: 'April' }, testDb)

    const geladen = getDienstplanMitTagen(dienstplan.id, testDb)
    expect(geladen?.dienstplan).toEqual(dienstplan)
    expect(geladen?.tage).toHaveLength(30)
  })

  it('gibt nur die Tage des angefragten Dienstplans zurück, nicht die eines anderen', () => {
    const erster = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    const zweiter = createDienstplan({ monat: 9, jahr: 2026, titel: 'B' }, testDb)

    const geladen = getDienstplanMitTagen(erster.dienstplan.id, testDb)
    expect(geladen?.tage).toHaveLength(31)
    expect(geladen?.tage.every((tag) => tag.dienstplanId === erster.dienstplan.id)).toBe(true)
    expect(zweiter.tage).toHaveLength(30)
  })
})

describe('updateDienstplanTitel', () => {
  it('aktualisiert den Titel und gibt den aktualisierten Dienstplan zurück', () => {
    const { dienstplan } = createDienstplan({ monat: 8, jahr: 2026, titel: 'Alt' }, testDb)

    const aktualisiert = updateDienstplanTitel(dienstplan.id, 'Neu', testDb)
    expect(aktualisiert.titel).toBe('Neu')
    expect(aktualisiert.id).toBe(dienstplan.id)
  })

  it('persistiert die Änderung, sichtbar über getDienstplaene', () => {
    const { dienstplan } = createDienstplan({ monat: 8, jahr: 2026, titel: 'Alt' }, testDb)
    updateDienstplanTitel(dienstplan.id, 'Neu', testDb)

    const dienstplaene = getDienstplaene(testDb)
    expect(dienstplaene.find((d) => d.id === dienstplan.id)?.titel).toBe('Neu')
  })

  it('ändert nur den Datensatz mit passender id, andere bleiben unverändert', () => {
    const erster = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    const zweiter = createDienstplan({ monat: 9, jahr: 2026, titel: 'B' }, testDb)

    updateDienstplanTitel(erster.dienstplan.id, 'A-Updated', testDb)

    const dienstplaene = getDienstplaene(testDb)
    expect(dienstplaene.find((d) => d.id === erster.dienstplan.id)?.titel).toBe('A-Updated')
    expect(dienstplaene.find((d) => d.id === zweiter.dienstplan.id)?.titel).toBe('B')
  })
})

describe('speicherePlanungsstand', () => {
  it('legt einen neuen Planeintrag an', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)

    const { planeintraege } = speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ dienstplantagId: tage[0].id, teamMemberId: 1, eintrag: festerSnapshot }],
      testDb
    )

    expect(planeintraege).toHaveLength(1)
    expect(planeintraege[0]).toMatchObject({
      dienstplantagId: tage[0].id,
      teamMemberId: 1,
      ...festerSnapshot
    })
  })

  it('ersetzt eine bestehende Zelle: alte Zeile weg, neue Zeile mit neuen Werten da', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    const aenderung = { dienstplantagId: tage[0].id, teamMemberId: 1 }

    const erstesSpeichern = speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ ...aenderung, eintrag: festerSnapshot }],
      testDb
    )
    const alteId = erstesSpeichern.planeintraege[0].id

    const { planeintraege } = speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ ...aenderung, eintrag: mitarbeiterabhaengigerSnapshot }],
      testDb
    )

    expect(planeintraege).toHaveLength(1)
    expect(planeintraege[0].id).not.toBe(alteId)
    expect(planeintraege[0]).toMatchObject({
      dienstplantagId: tage[0].id,
      teamMemberId: 1,
      ...mitarbeiterabhaengigerSnapshot
    })
  })

  it('entfernt eine Zelle ohne Ersatz, wenn eintrag null ist', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    const aenderung = { dienstplantagId: tage[0].id, teamMemberId: 1 }

    speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ ...aenderung, eintrag: festerSnapshot }],
      testDb
    )
    const { planeintraege } = speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ ...aenderung, eintrag: null }],
      testDb
    )

    expect(planeintraege).toHaveLength(0)
  })

  it('speichert Titel- und Planeintrag-Änderungen gemeinsam in einem Aufruf', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'Alt' }, testDb)

    const { dienstplan: aktualisiert, planeintraege } = speicherePlanungsstand(
      dienstplan.id,
      'Neu',
      [{ dienstplantagId: tage[0].id, teamMemberId: 1, eintrag: festerSnapshot }],
      testDb
    )

    expect(aktualisiert.titel).toBe('Neu')
    expect(planeintraege).toHaveLength(1)
  })

  it('speichert arbeitszeitMinuten eines mitarbeiterabhängigen Eintrags unverändert', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)

    const { planeintraege } = speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ dienstplantagId: tage[0].id, teamMemberId: 1, eintrag: mitarbeiterabhaengigerSnapshot }],
      testDb
    )

    expect(planeintraege[0].arbeitszeitMinuten).toBe(468)
    expect(planeintraege[0].beginn).toBeNull()
    expect(planeintraege[0].ende).toBeNull()
  })

  it('lässt Planeinträge anderer Tage/Mitarbeitenden unangetastet', () => {
    const { dienstplan, tage } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)

    speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [
        { dienstplantagId: tage[0].id, teamMemberId: 1, eintrag: festerSnapshot },
        { dienstplantagId: tage[1].id, teamMemberId: 2, eintrag: mitarbeiterabhaengigerSnapshot }
      ],
      testDb
    )

    const { planeintraege } = speicherePlanungsstand(
      dienstplan.id,
      dienstplan.titel,
      [{ dienstplantagId: tage[0].id, teamMemberId: 1, eintrag: null }],
      testDb
    )

    expect(planeintraege).toHaveLength(1)
    expect(planeintraege[0]).toMatchObject({ dienstplantagId: tage[1].id, teamMemberId: 2 })
  })
})

describe('getPlaneintraegeFuerDienstplan (über speicherePlanungsstand)', () => {
  it('gibt eine leere Liste zurück, wenn noch kein Planeintrag existiert', () => {
    const { dienstplan } = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    expect(getPlaneintraegeFuerDienstplan(dienstplan.id, testDb)).toEqual([])
  })

  it('gibt nur die Planeintraege des angefragten Dienstplans zurück, nicht die eines anderen', () => {
    const ersterPlan = createDienstplan({ monat: 8, jahr: 2026, titel: 'A' }, testDb)
    const zweiterPlan = createDienstplan({ monat: 9, jahr: 2026, titel: 'B' }, testDb)

    speicherePlanungsstand(
      ersterPlan.dienstplan.id,
      ersterPlan.dienstplan.titel,
      [{ dienstplantagId: ersterPlan.tage[0].id, teamMemberId: 1, eintrag: festerSnapshot }],
      testDb
    )

    expect(getPlaneintraegeFuerDienstplan(ersterPlan.dienstplan.id, testDb)).toHaveLength(1)
    expect(getPlaneintraegeFuerDienstplan(zweiterPlan.dienstplan.id, testDb)).toHaveLength(0)
  })
})
