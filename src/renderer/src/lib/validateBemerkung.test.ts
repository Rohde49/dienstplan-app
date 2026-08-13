import { describe, expect, it } from 'vitest'
import { MAX_BEMERKUNG_LAENGE, validateBemerkungLaenge } from './validateBemerkung'

describe('validateBemerkungLaenge', () => {
  it('akzeptiert eine leere Bemerkung', () => {
    expect(validateBemerkungLaenge('')).toBeNull()
  })

  it('akzeptiert eine Bemerkung mit genau der maximalen Länge', () => {
    const wert = 'a'.repeat(MAX_BEMERKUNG_LAENGE)
    expect(validateBemerkungLaenge(wert)).toBeNull()
  })

  it('lehnt eine Bemerkung ab, die ein Zeichen zu lang ist', () => {
    const wert = 'a'.repeat(MAX_BEMERKUNG_LAENGE + 1)
    expect(validateBemerkungLaenge(wert)).toBe(
      `Bemerkung darf höchstens ${MAX_BEMERKUNG_LAENGE} Zeichen lang sein.`
    )
  })

  it('akzeptiert eine gewöhnliche, kurze Bemerkung', () => {
    expect(validateBemerkungLaenge('Urlaub')).toBeNull()
  })
})
