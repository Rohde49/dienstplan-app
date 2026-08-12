import { describe, expect, it } from 'vitest'
import { TEAM_MEMBER_COLORS } from '../../../shared/types'
import { validateTeamMemberInput, type TeamMemberInput } from './validateTeamMember'

function gueltigeEingabe(): TeamMemberInput {
  return {
    vorname: 'Max',
    name: 'Mustermann',
    rolle: 'Erzieher',
    wochenarbeitszeitMinuten: 2340,
    farbe: TEAM_MEMBER_COLORS[0]
  }
}

describe('validateTeamMemberInput', () => {
  it('akzeptiert eine vollständig gültige Eingabe', () => {
    expect(validateTeamMemberInput(gueltigeEingabe())).toEqual([])
  })

  it('meldet fehlenden Vornamen', () => {
    const errors = validateTeamMemberInput({ ...gueltigeEingabe(), vorname: '  ' })
    expect(errors).toContain('Vorname darf nicht leer sein.')
  })

  it('meldet fehlenden Namen', () => {
    const errors = validateTeamMemberInput({ ...gueltigeEingabe(), name: '' })
    expect(errors).toContain('Name darf nicht leer sein.')
  })

  it('meldet ungültige Rolle', () => {
    const errors = validateTeamMemberInput({ ...gueltigeEingabe(), rolle: 'Manager' })
    expect(errors.some((e) => e.startsWith('Rolle muss eine der folgenden sein'))).toBe(true)
  })

  it('akzeptiert jede der drei erlaubten Rollen', () => {
    for (const rolle of ['Erzieher', 'Praktikant', 'Wirtschaftskraft']) {
      expect(validateTeamMemberInput({ ...gueltigeEingabe(), rolle })).toEqual([])
    }
  })

  it('meldet nicht-positive Wochenarbeitszeit', () => {
    expect(
      validateTeamMemberInput({ ...gueltigeEingabe(), wochenarbeitszeitMinuten: 0 })
    ).toContain('Wochenarbeitszeit muss größer als 0 sein.')
    expect(
      validateTeamMemberInput({ ...gueltigeEingabe(), wochenarbeitszeitMinuten: -10 })
    ).toContain('Wochenarbeitszeit muss größer als 0 sein.')
  })

  it('meldet nicht-endliche Wochenarbeitszeit', () => {
    expect(
      validateTeamMemberInput({ ...gueltigeEingabe(), wochenarbeitszeitMinuten: NaN })
    ).toContain('Wochenarbeitszeit muss größer als 0 sein.')
  })

  it('meldet Farbe außerhalb der Palette', () => {
    const errors = validateTeamMemberInput({ ...gueltigeEingabe(), farbe: '#000000' })
    expect(errors).toContain('Farbe muss aus der vorgegebenen Palette stammen.')
  })

  it('akzeptiert jede Farbe aus der Palette', () => {
    for (const farbe of TEAM_MEMBER_COLORS) {
      expect(validateTeamMemberInput({ ...gueltigeEingabe(), farbe })).toEqual([])
    }
  })

  it('sammelt mehrere Fehler gleichzeitig', () => {
    const errors = validateTeamMemberInput({
      vorname: '',
      name: '',
      rolle: 'Manager',
      wochenarbeitszeitMinuten: -1,
      farbe: '#000000'
    })
    expect(errors).toHaveLength(5)
  })
})
