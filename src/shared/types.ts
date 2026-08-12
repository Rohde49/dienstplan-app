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
