import { describe, expect, it } from 'vitest'
import {
  berechneArbeitstageFuerMonat,
  berechneKennzahlenFuerMitarbeiter,
  formatiereSollIstDifferenz
} from './auswertung'
import { getKalendertageFuerMonat, type Kalendertag } from './kalendertage'
import { planeintragSchluessel } from './planeintragSchluessel'
import type { Dienstplantag, PlaneintragSnapshot } from './types'

describe('berechneArbeitstageFuerMonat', () => {
  it('zählt Montag bis Freitag ohne Feiertage im Monat', () => {
    // September 2026: 30 Tage, keine gesetzlichen Feiertage in Brandenburg.
    const tage = getKalendertageFuerMonat(2026, 9)
    expect(berechneArbeitstageFuerMonat(tage)).toBe(22)
  })

  it('zieht einen Feiertag auf einem Werktag ab', () => {
    // Januar 2025: Neujahr (01.01., Mittwoch) ist der einzige Feiertag auf einem Werktag.
    const tage = getKalendertageFuerMonat(2025, 1)
    expect(berechneArbeitstageFuerMonat(tage)).toBe(22)
  })

  it('zieht mehrere Feiertage auf Werktagen ab', () => {
    // April 2023: Karfreitag (Fr) und Ostermontag (Mo) fallen beide auf Werktage.
    const tage = getKalendertageFuerMonat(2023, 4)
    expect(berechneArbeitstageFuerMonat(tage)).toBe(18)
  })

  it('liefert 0 für eine leere Tagesliste', () => {
    expect(berechneArbeitstageFuerMonat([])).toBe(0)
  })
})

describe('berechneKennzahlenFuerMitarbeiter (tagesbezogene Zählungen)', () => {
  const MITARBEITER_ID = 1
  const ANDERER_MITARBEITER_ID = 2
  const WOCHENARBEITSZEIT_MINUTEN = 2340 // 39:00, Beispiel aus datenmodell.md

  function tag(overrides: Partial<Kalendertag> & { datum: string }): Kalendertag {
    return {
      wochentag: 'Mo',
      istWochenende: false,
      istFeiertag: false,
      feiertagsname: null,
      ...overrides
    }
  }

  function dienstplantag(id: number, datum: string): Dienstplantag {
    return { id, dienstplanId: 1, datum, bemerkung: null }
  }

  function eintrag(overrides: Partial<PlaneintragSnapshot>): PlaneintragSnapshot {
    return {
      eintragsdefinitionId: 1,
      kuerzel: 'F',
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

  it('zählt Planeinträge mit kuerzel SN/F oder SN (Zeile 1)', () => {
    const tage = [
      tag({ datum: '2026-01-05' }),
      tag({ datum: '2026-01-06' }),
      tag({ datum: '2026-01-07' }),
      tag({ datum: '2026-01-08' })
    ]
    const dienstplantage = [
      dienstplantag(1, '2026-01-05'),
      dienstplantag(2, '2026-01-06'),
      dienstplantag(3, '2026-01-07'),
      dienstplantag(4, '2026-01-08')
    ]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({ kuerzel: 'SN/F' }),
      [planeintragSchluessel(2, MITARBEITER_ID)]: eintrag({ kuerzel: 'SN/F' }),
      [planeintragSchluessel(3, MITARBEITER_ID)]: eintrag({ kuerzel: 'SN' }),
      [planeintragSchluessel(4, MITARBEITER_ID)]: eintrag({ kuerzel: 'F' })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.anzahlSnfDienste).toBe(3)
  })

  it('zählt Freie Tage unabhängig vom Wochentag (eigene Definition)', () => {
    const tage = [
      tag({ datum: '2026-01-10', wochentag: 'Sa', istWochenende: true }),
      tag({ datum: '2026-01-12', wochentag: 'Mo' })
    ]
    const dienstplantage = [dienstplantag(1, '2026-01-10'), dienstplantag(2, '2026-01-12')]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({ kuerzel: '/' }),
      [planeintragSchluessel(2, MITARBEITER_ID)]: eintrag({ kuerzel: '/' })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.anzahlFreieTage).toBe(2)
  })

  it('zählt Freie Samstage nur bei kuerzel / an einem Samstag (Zeile 2)', () => {
    const tage = [
      tag({ datum: '2026-01-10', wochentag: 'Sa', istWochenende: true }),
      tag({ datum: '2026-01-11', wochentag: 'So', istWochenende: true })
    ]
    const dienstplantage = [dienstplantag(1, '2026-01-10'), dienstplantag(2, '2026-01-11')]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({ kuerzel: '/' }),
      [planeintragSchluessel(2, MITARBEITER_ID)]: eintrag({ kuerzel: '/' })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.anzahlFreieSamstage).toBe(1)
  })

  it('zählt nur freie Sonntage, Feiertage an Werktagen zählen nicht mit (Zeile 3)', () => {
    const tage = [
      tag({ datum: '2026-01-11', wochentag: 'So', istWochenende: true }),
      tag({
        datum: '2026-04-05',
        wochentag: 'So',
        istWochenende: true,
        istFeiertag: true,
        feiertagsname: 'Ostersonntag'
      }),
      tag({
        datum: '2026-05-01',
        wochentag: 'Fr',
        istFeiertag: true,
        feiertagsname: 'Tag der Arbeit'
      })
    ]
    const dienstplantage = [
      dienstplantag(1, '2026-01-11'),
      dienstplantag(2, '2026-04-05'),
      dienstplantag(3, '2026-05-01')
    ]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({ kuerzel: '/' }),
      [planeintragSchluessel(2, MITARBEITER_ID)]: eintrag({ kuerzel: '/' }),
      [planeintragSchluessel(3, MITARBEITER_ID)]: eintrag({ kuerzel: '/' })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    // 3 freie Tage gesetzt, aber nur die zwei Sonntage zählen; der 1. Mai ist Feiertag an einem Freitag und zählt nicht mit.
    expect(ergebnis.anzahlFreieSonntage).toBe(2)
  })

  it('summiert arbeitszeitOhneNachtbereitschaftMinuten an Sonntagen/Feiertagen, ignoriert normale Werktage (Zeile 4)', () => {
    const tage = [
      tag({ datum: '2026-01-05', wochentag: 'Mo' }),
      tag({ datum: '2026-01-11', wochentag: 'So', istWochenende: true }),
      tag({
        datum: '2026-05-01',
        wochentag: 'Fr',
        istFeiertag: true,
        feiertagsname: 'Tag der Arbeit'
      })
    ]
    const dienstplantage = [
      dienstplantag(1, '2026-01-05'),
      dienstplantag(2, '2026-01-11'),
      dienstplantag(3, '2026-05-01')
    ]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({
        kuerzel: 'F',
        arbeitszeitOhneNachtbereitschaftMinuten: 480
      }),
      [planeintragSchluessel(2, MITARBEITER_ID)]: eintrag({
        kuerzel: 'F',
        arbeitszeitOhneNachtbereitschaftMinuten: 300,
        nachtbereitschaftMinuten: 60
      }),
      [planeintragSchluessel(3, MITARBEITER_ID)]: eintrag({
        kuerzel: 'F',
        arbeitszeitOhneNachtbereitschaftMinuten: 480
      })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    // Nachtbereitschaft (60 Min. am Sonntag) fließt hier bewusst nicht ein: 300 + 480 = 780, nicht 840.
    expect(ergebnis.gearbeiteteStundenSonntageUndFeiertageMinuten).toBe(780)
  })

  it('zählt Rufbereitschaften nur für den betreffenden Mitarbeiter (Zeile 11)', () => {
    const tage = [tag({ datum: '2026-01-05' }), tag({ datum: '2026-01-06' })]
    const dienstplantage = [dienstplantag(1, '2026-01-05'), dienstplantag(2, '2026-01-06')]
    const rufbereitschaften = { '1': MITARBEITER_ID, '2': ANDERER_MITARBEITER_ID }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      {},
      rufbereitschaften
    )

    expect(ergebnis.anzahlRufbereitschaften).toBe(1)
  })

  it('berücksichtigt nur Planeinträge des angefragten Mitarbeiters', () => {
    const tage = [tag({ datum: '2026-01-05' })]
    const dienstplantage = [dienstplantag(1, '2026-01-05')]
    const planeintraege = {
      [planeintragSchluessel(1, ANDERER_MITARBEITER_ID)]: eintrag({ kuerzel: 'SN/F' })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.anzahlSnfDienste).toBe(0)
  })

  it('überspringt Tage ohne zugehörigen Dienstplantag', () => {
    const tage = [tag({ datum: '2026-01-05' })]

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      [],
      {},
      {}
    )

    expect(ergebnis.anzahlSnfDienste).toBe(0)
    expect(ergebnis.anzahlFreieTage).toBe(0)
    expect(ergebnis.anzahlRufbereitschaften).toBe(0)
  })

  it('summiert die vier Zeitfelder über alle Planeinträge im Monat (Zeilen 5–8)', () => {
    const tage = [tag({ datum: '2026-01-05' }), tag({ datum: '2026-01-06' })]
    const dienstplantage = [dienstplantag(1, '2026-01-05'), dienstplantag(2, '2026-01-06')]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({
        arbeitszeitOhneNachtbereitschaftMinuten: 400,
        nachtbereitschaftMinuten: 80,
        nachtarbeitMinuten: 60
      }),
      [planeintragSchluessel(2, MITARBEITER_ID)]: eintrag({
        arbeitszeitOhneNachtbereitschaftMinuten: 300,
        nachtbereitschaftMinuten: 0,
        nachtarbeitMinuten: 30
      })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.arbeitszeitGesamtMinuten).toBe(780)
    expect(ergebnis.arbeitszeitOhneNachtbereitschaftGesamtMinuten).toBe(700)
    expect(ergebnis.nachtbereitschaftGesamtMinuten).toBe(80)
    expect(ergebnis.nachtarbeitGesamtMinuten).toBe(90)
  })

  it('berechnet Nachtzuschlag 20% und Nachtbereitschaftszuschlag 25% aus der vollen Monatssumme, erst danach gerundet (Zeilen 9–10)', () => {
    const tage = [tag({ datum: '2026-01-05' })]
    const dienstplantage = [dienstplantag(1, '2026-01-05')]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({
        nachtbereitschaftMinuten: 13,
        nachtarbeitMinuten: 13
      })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    // 13 * 0,20 = 2,6 -> gerundet 3; 13 * 0,25 = 3,25 -> gerundet 3
    expect(ergebnis.nachtzuschlagMinuten).toBe(3)
    expect(ergebnis.nachtbereitschaftszuschlagMinuten).toBe(3)
  })

  it('berechnet Ist-Arbeitszeit aus Arbeitszeit ohne Nachtbereitschaft plus Nachtbereitschaftszuschlag (Zeile 13)', () => {
    const tage = [tag({ datum: '2026-01-05' })]
    const dienstplantage = [dienstplantag(1, '2026-01-05')]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({
        arbeitszeitOhneNachtbereitschaftMinuten: 420,
        nachtbereitschaftMinuten: 40
      })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    // 420 + gerundet(40 * 0,25) = 420 + 10 = 430
    expect(ergebnis.nachtbereitschaftszuschlagMinuten).toBe(10)
    expect(ergebnis.istArbeitszeitMinuten).toBe(430)
  })

  it('berechnet Soll-Arbeitszeit und Differenz Soll/Ist gemäß Beispiel aus auswertung.md (21 × 39:00 / 5 = 163:48)', () => {
    // 21 Werktage, keine Feiertage, unabhängig vom konkreten Datum konstruiert.
    const tage = Array.from({ length: 21 }, (_, i) => tag({ datum: `2026-01-${String(i + 1)}` }))
    const dienstplantage = tage.map((t, i) => dienstplantag(i + 1, t.datum))
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({
        arbeitszeitMinuten: 9828,
        arbeitszeitOhneNachtbereitschaftMinuten: 9828
      })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.anzahlArbeitstage).toBe(21)
    expect(ergebnis.sollArbeitszeitMinuten).toBe(9828) // 163:48
    expect(ergebnis.differenzSollIstMinuten).toBe(0)
  })

  it('berechnet eine negative Differenz, wenn die Soll-Arbeitszeit noch nicht erreicht ist', () => {
    const tage = [tag({ datum: '2026-01-05' })]
    const dienstplantage = [dienstplantag(1, '2026-01-05')]
    const planeintraege = {
      [planeintragSchluessel(1, MITARBEITER_ID)]: eintrag({
        arbeitszeitMinuten: 100,
        arbeitszeitOhneNachtbereitschaftMinuten: 100
      })
    }

    const ergebnis = berechneKennzahlenFuerMitarbeiter(
      MITARBEITER_ID,
      WOCHENARBEITSZEIT_MINUTEN,
      tage,
      dienstplantage,
      planeintraege,
      {}
    )

    expect(ergebnis.differenzSollIstMinuten).toBe(100 - ergebnis.sollArbeitszeitMinuten)
    expect(ergebnis.differenzSollIstMinuten).toBeLessThan(0)
  })
})

describe('formatiereSollIstDifferenz', () => {
  it('formatiert eine positive Differenz mit +', () => {
    expect(formatiereSollIstDifferenz(90)).toBe('+01:30')
  })

  it('formatiert einen exakten Ausgleich als 0:00', () => {
    expect(formatiereSollIstDifferenz(0)).toBe('0:00')
  })

  it('formatiert eine negative Differenz mit −', () => {
    expect(formatiereSollIstDifferenz(-90)).toBe('−01:30')
  })
})
