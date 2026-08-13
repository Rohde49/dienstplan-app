import { berechneMitarbeiterabhaengigeArbeitszeitMinuten } from './mitarbeiterabhaengigeArbeitszeit'
import { planeintragSchluessel } from '../../../shared/planeintragSchluessel'
import type {
  Eintragsdefinition,
  Planeintrag,
  PlaneintragSnapshot,
  TeamMember
} from '../../../shared/types'

export function erzeugePlaneintragSnapshot(
  eintragsdefinition: Eintragsdefinition,
  teamMember: TeamMember
): PlaneintragSnapshot {
  if (eintragsdefinition.berechnungsart === 'mitarbeiterabhaengig') {
    return {
      eintragsdefinitionId: eintragsdefinition.id,
      kuerzel: eintragsdefinition.kuerzel,
      beginn: null,
      ende: null,
      anwesenheitszeitMinuten: 0,
      arbeitszeitMinuten: berechneMitarbeiterabhaengigeArbeitszeitMinuten(
        teamMember.wochenarbeitszeitMinuten
      ),
      arbeitszeitOhneNachtbereitschaftMinuten: 0,
      nachtbereitschaftMinuten: 0,
      nachtarbeitMinuten: 0
    }
  }

  return {
    eintragsdefinitionId: eintragsdefinition.id,
    kuerzel: eintragsdefinition.kuerzel,
    beginn: eintragsdefinition.beginn,
    ende: eintragsdefinition.ende,
    anwesenheitszeitMinuten: eintragsdefinition.anwesenheitszeitMinuten,
    arbeitszeitMinuten: eintragsdefinition.arbeitszeitMinuten,
    arbeitszeitOhneNachtbereitschaftMinuten:
      eintragsdefinition.arbeitszeitOhneNachtbereitschaftMinuten,
    nachtbereitschaftMinuten: eintragsdefinition.nachtbereitschaftMinuten,
    nachtarbeitMinuten: eintragsdefinition.nachtarbeitMinuten
  }
}

export function planeintraegeAlsEntwurf(
  planeintraege: Planeintrag[]
): Record<string, PlaneintragSnapshot> {
  const entwurf: Record<string, PlaneintragSnapshot> = {}

  for (const planeintrag of planeintraege) {
    entwurf[planeintragSchluessel(planeintrag.dienstplantagId, planeintrag.teamMemberId)] = {
      eintragsdefinitionId: planeintrag.eintragsdefinitionId,
      kuerzel: planeintrag.kuerzel,
      beginn: planeintrag.beginn,
      ende: planeintrag.ende,
      anwesenheitszeitMinuten: planeintrag.anwesenheitszeitMinuten,
      arbeitszeitMinuten: planeintrag.arbeitszeitMinuten,
      arbeitszeitOhneNachtbereitschaftMinuten: planeintrag.arbeitszeitOhneNachtbereitschaftMinuten,
      nachtbereitschaftMinuten: planeintrag.nachtbereitschaftMinuten,
      nachtarbeitMinuten: planeintrag.nachtarbeitMinuten
    }
  }

  return entwurf
}
