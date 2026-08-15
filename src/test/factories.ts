import type { Eintragsdefinition, PlaneintragSnapshot, TeamMember } from '../shared/types'

// Testdaten-Fabriken: sinnvoller Standardfall plus punktuelle Overrides. Ein Test
// nennt damit nur die Felder, um die es ihm geht — kommt ein Pflichtfeld zur Entität
// hinzu, ist genau eine Stelle anzupassen statt jeder Testdatei.
// Muster übernommen aus src/main/db/teamRepository.test.ts.

export function neuerMitarbeiter(
  overrides: Partial<Omit<TeamMember, 'id'>> = {}
): Omit<TeamMember, 'id'> {
  return {
    vorname: 'Nina',
    name: 'Krause',
    rolle: 'Erzieher',
    wochenarbeitszeitMinuten: 2340, // 39:00
    farbe: '#3A8DFF',
    ...overrides
  }
}

export function neueEintragsdefinition(
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

export function neuerPlaneintragSnapshot(
  overrides: Partial<PlaneintragSnapshot> = {}
): PlaneintragSnapshot {
  return {
    eintragsdefinitionId: 1,
    kuerzel: 'F',
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
