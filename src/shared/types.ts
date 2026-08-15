export interface TeamMember {
  id: number
  vorname: string
  name: string
  rolle: 'Erzieher' | 'Praktikant' | 'Wirtschaftskraft'
  wochenarbeitszeitMinuten: number
  farbe: string
}

// Farbname gehört zur Datenstruktur, nicht in einen Kommentar: die Farbauswahl
// muss ihn als Beschriftung ausgeben können, sonst sagt der Screenreader den
// Hex-Code an und die Auswahl ist rein farblich erkennbar.
export const TEAM_MEMBER_FARBEN = [
  { wert: '#3A8DFF', name: 'Blau' },
  { wert: '#34B37A', name: 'Grün' },
  { wert: '#F2994A', name: 'Orange' },
  { wert: '#9B6BDE', name: 'Violett' },
  { wert: '#2FB6C4', name: 'Türkis' },
  { wert: '#E15A97', name: 'Pink' },
  { wert: '#C9A227', name: 'Oliv-Gelb' },
  { wert: '#5C6BC0', name: 'Indigo' },
  { wert: '#C1662F', name: 'Terrakotta' },
  { wert: '#7FB236', name: 'Lindgrün' }
] as const

export const TEAM_MEMBER_COLORS = TEAM_MEMBER_FARBEN.map((farbe) => farbe.wert)

export function teamMemberFarbName(wert: string): string {
  return TEAM_MEMBER_FARBEN.find((farbe) => farbe.wert === wert)?.name ?? wert
}

export interface Eintragsdefinition {
  id: number
  kuerzel: string
  name: string
  berechnungsart: 'fest' | 'mitarbeiterabhaengig'
  beginn: string | null
  ende: string | null
  anwesenheitszeitMinuten: number
  arbeitszeitMinuten: number
  arbeitszeitOhneNachtbereitschaftMinuten: number
  nachtbereitschaftMinuten: number
  nachtarbeitMinuten: number
}

export interface Dienstplan {
  id: number
  monat: number // 1-12
  jahr: number
  titel: string
  erstelltAm: string // ISO-Zeitstempel
  geaendertAm: string // ISO-Zeitstempel
}

export interface Dienstplantag {
  id: number
  dienstplanId: number // FK auf Dienstplan.id
  datum: string // ISO-Datum, z. B. "2026-09-01"
  bemerkung: string | null
}

export interface Planeintrag {
  id: number
  dienstplantagId: number // FK auf Dienstplantag.id
  teamMemberId: number // FK auf TeamMember.id
  eintragsdefinitionId: number // FK auf Eintragsdefinition.id, Herkunft des Snapshots
  kuerzel: string // Snapshot aus Eintragsdefinition.kuerzel zum Zeitpunkt des Setzens
  beginn: string | null // Uhrzeit "HH:MM", Snapshot, rein darstellend
  ende: string | null // Uhrzeit "HH:MM", Snapshot, rein darstellend
  anwesenheitszeitMinuten: number
  arbeitszeitMinuten: number
  arbeitszeitOhneNachtbereitschaftMinuten: number
  nachtbereitschaftMinuten: number
  nachtarbeitMinuten: number
}

export type PlaneintragSnapshot = Omit<Planeintrag, 'id' | 'dienstplantagId' | 'teamMemberId'>

export interface PlaneintragAenderung {
  dienstplantagId: number
  teamMemberId: number
  eintrag: PlaneintragSnapshot | null // null = Eintrag entfernen
}

export interface Rufbereitschaft {
  id: number
  dienstplantagId: number // FK auf Dienstplantag.id
  teamMemberId: number // FK auf TeamMember.id, muss rolle: 'Erzieher' sein
}

export interface RufbereitschaftAenderung {
  dienstplantagId: number
  teamMemberId: number | null // null = Rufbereitschaft entfernen
}

export interface BemerkungAenderung {
  dienstplantagId: number
  bemerkung: string | null
}
