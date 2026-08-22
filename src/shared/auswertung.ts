import type { Kalendertag } from './kalendertage'
import { planeintragSchluessel } from './planeintragSchluessel'
import { rundeAufVolleMinute } from './rundeAufVolleMinute'
import { formatMinutesToHHMM } from './time'
import type { Dienstplantag, PlaneintragSnapshot } from './types'

const NACHTZUSCHLAG_SATZ = 0.2
const NACHTBEREITSCHAFTSZUSCHLAG_SATZ = 0.25

// Zeile 12 aus auswertung.md: Montag bis Freitag im Monat, abzüglich der gesetzlichen
// Feiertage in Brandenburg, die auf diese Wochentage fallen.
export function berechneArbeitstageFuerMonat(tage: Kalendertag[]): number {
  return tage.filter((tag) => !tag.istWochenende && !tag.istFeiertag).length
}

export interface Kennzahlen {
  anzahlSnfDienste: number // Zeile 1
  anzahlFreieTage: number // Grid-eigene Definition, siehe auswertung.md, kein Bestandteil der 15 Zeilen
  anzahlFreieSamstage: number // Zeile 2
  anzahlFreieSonntage: number // Zeile 3
  gearbeiteteStundenSonntageUndFeiertageMinuten: number // Zeile 4
  arbeitszeitGesamtMinuten: number // Zeile 5
  nachtbereitschaftGesamtMinuten: number // Zeile 6
  arbeitszeitOhneNachtbereitschaftGesamtMinuten: number // Zeile 7
  nachtarbeitGesamtMinuten: number // Zeile 8
  nachtzuschlagMinuten: number // Zeile 9
  nachtbereitschaftszuschlagMinuten: number // Zeile 10
  anzahlRufbereitschaften: number // Zeile 11
  anzahlArbeitstage: number // Zeile 12
  istArbeitszeitMinuten: number // Zeile 13
  sollArbeitszeitMinuten: number // Zeile 14
  differenzSollIstMinuten: number // Zeile 15
}

export function berechneKennzahlenFuerMitarbeiter(
  teamMemberId: number,
  wochenarbeitszeitMinuten: number,
  tage: Kalendertag[],
  dienstplantage: Dienstplantag[],
  planeintraege: Record<string, PlaneintragSnapshot>,
  rufbereitschaften: Record<string, number>
): Kennzahlen {
  const dienstplantagIdProDatum = new Map(dienstplantage.map((tag) => [tag.datum, tag.id]))

  let anzahlSnfDienste = 0
  let anzahlFreieTage = 0
  let anzahlFreieSamstage = 0
  let anzahlFreieSonntage = 0
  let gearbeiteteStundenSonntageUndFeiertageMinuten = 0
  let arbeitszeitGesamtMinuten = 0
  let nachtbereitschaftGesamtMinuten = 0
  let arbeitszeitOhneNachtbereitschaftGesamtMinuten = 0
  let nachtarbeitGesamtMinuten = 0
  let anzahlRufbereitschaften = 0

  for (const tag of tage) {
    const dienstplantagId = dienstplantagIdProDatum.get(tag.datum)
    if (dienstplantagId === undefined) continue

    const istSonntagOderFeiertag = tag.wochentag === 'So' || tag.istFeiertag

    const eintrag = planeintraege[planeintragSchluessel(dienstplantagId, teamMemberId)]
    if (eintrag) {
      if (eintrag.kuerzel === 'SN/F' || eintrag.kuerzel === 'SN') anzahlSnfDienste++
      if (eintrag.kuerzel === '/') {
        anzahlFreieTage++
        if (tag.wochentag === 'Sa') anzahlFreieSamstage++
        if (tag.wochentag === 'So') anzahlFreieSonntage++
      }
      if (istSonntagOderFeiertag) {
        gearbeiteteStundenSonntageUndFeiertageMinuten +=
          eintrag.arbeitszeitOhneNachtbereitschaftMinuten
      }
      arbeitszeitGesamtMinuten +=
        eintrag.arbeitszeitOhneNachtbereitschaftMinuten + eintrag.nachtbereitschaftMinuten
      nachtbereitschaftGesamtMinuten += eintrag.nachtbereitschaftMinuten
      arbeitszeitOhneNachtbereitschaftGesamtMinuten +=
        eintrag.arbeitszeitOhneNachtbereitschaftMinuten
      nachtarbeitGesamtMinuten += eintrag.nachtarbeitMinuten
    }

    if (rufbereitschaften[String(dienstplantagId)] === teamMemberId) anzahlRufbereitschaften++
  }

  const anzahlArbeitstage = berechneArbeitstageFuerMonat(tage)
  const nachtbereitschaftszuschlagMinuten = rundeAufVolleMinute(
    nachtbereitschaftGesamtMinuten * NACHTBEREITSCHAFTSZUSCHLAG_SATZ
  )
  const istArbeitszeitMinuten =
    arbeitszeitOhneNachtbereitschaftGesamtMinuten + nachtbereitschaftszuschlagMinuten
  const sollArbeitszeitMinuten = rundeAufVolleMinute(
    (anzahlArbeitstage * wochenarbeitszeitMinuten) / 5
  )

  return {
    anzahlSnfDienste,
    anzahlFreieTage,
    anzahlFreieSamstage,
    anzahlFreieSonntage,
    gearbeiteteStundenSonntageUndFeiertageMinuten,
    arbeitszeitGesamtMinuten,
    nachtbereitschaftGesamtMinuten,
    arbeitszeitOhneNachtbereitschaftGesamtMinuten,
    nachtarbeitGesamtMinuten,
    nachtzuschlagMinuten: rundeAufVolleMinute(nachtarbeitGesamtMinuten * NACHTZUSCHLAG_SATZ),
    nachtbereitschaftszuschlagMinuten,
    anzahlRufbereitschaften,
    anzahlArbeitstage,
    istArbeitszeitMinuten,
    sollArbeitszeitMinuten,
    differenzSollIstMinuten: istArbeitszeitMinuten - sollArbeitszeitMinuten
  }
}

// Zeile 15 aus auswertung.md: positiv mit „+", „0:00" bei exaktem Ausgleich, negativ mit „−".
export function formatiereSollIstDifferenz(differenzMinuten: number): string {
  if (differenzMinuten === 0) return '0:00'
  const vorzeichen = differenzMinuten > 0 ? '+' : '−'
  return `${vorzeichen}${formatMinutesToHHMM(Math.abs(differenzMinuten))}`
}
