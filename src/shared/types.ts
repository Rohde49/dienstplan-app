export interface TeamMember {
  id: number
  vorname: string
  name: string
  rolle: 'Erzieher' | 'Praktikant' | 'Wirtschaftskraft'
  wochenarbeitszeitMinuten: number
  farbe: string
}

export const TEAM_MEMBER_COLORS = [
  '#3A8DFF', // Blau
  '#34B37A', // Grün
  '#F2994A', // Orange
  '#9B6BDE', // Violett
  '#2FB6C4', // Türkis
  '#E15A97', // Pink
  '#C9A227', // Oliv-Gelb
  '#5C6BC0', // Indigo
  '#C1662F', // Terrakotta
  '#7FB236' // Lindgrün
] as const

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
