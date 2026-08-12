import { TEAM_MEMBER_COLORS, type TeamMember } from '../../../shared/types'

const ALLOWED_ROLLEN: readonly TeamMember['rolle'][] = [
  'Erzieher',
  'Praktikant',
  'Wirtschaftskraft'
]

export interface TeamMemberInput {
  vorname: string
  name: string
  rolle: string
  wochenarbeitszeitMinuten: number
  farbe: string
}

export function validateTeamMemberInput(data: TeamMemberInput): string[] {
  const errors: string[] = []

  if (!data.vorname.trim()) {
    errors.push('Vorname darf nicht leer sein.')
  }

  if (!data.name.trim()) {
    errors.push('Name darf nicht leer sein.')
  }

  if (!ALLOWED_ROLLEN.includes(data.rolle as TeamMember['rolle'])) {
    errors.push(`Rolle muss eine der folgenden sein: ${ALLOWED_ROLLEN.join(', ')}.`)
  }

  if (!Number.isFinite(data.wochenarbeitszeitMinuten) || data.wochenarbeitszeitMinuten <= 0) {
    errors.push('Wochenarbeitszeit muss größer als 0 sein.')
  }

  if (!TEAM_MEMBER_COLORS.includes(data.farbe as (typeof TEAM_MEMBER_COLORS)[number])) {
    errors.push('Farbe muss aus der vorgegebenen Palette stammen.')
  }

  return errors
}
