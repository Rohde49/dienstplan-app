import { describe, expect, it } from 'vitest'
import { isValidTimeOfDay } from './timeOfDay'

describe('isValidTimeOfDay', () => {
  it('akzeptiert die früheste zulässige Uhrzeit', () => {
    expect(isValidTimeOfDay('00:00')).toBe(true)
  })

  it('akzeptiert die späteste zulässige Uhrzeit', () => {
    expect(isValidTimeOfDay('23:59')).toBe(true)
  })

  it('akzeptiert eine gewöhnliche Uhrzeit', () => {
    expect(isValidTimeOfDay('14:30')).toBe(true)
  })

  it('lehnt Stunde 24 ab', () => {
    expect(isValidTimeOfDay('24:00')).toBe(false)
  })

  it('lehnt Minute 60 ab', () => {
    expect(isValidTimeOfDay('12:60')).toBe(false)
  })

  it('lehnt einstellige Stunden ab (kein HH-Format)', () => {
    expect(isValidTimeOfDay('9:30')).toBe(false)
  })

  it('lehnt dreistellige Stunden ab, anders als bei Zeitdauern', () => {
    expect(isValidTimeOfDay('120:15')).toBe(false)
  })

  it('lehnt fehlenden Doppelpunkt ab', () => {
    expect(isValidTimeOfDay('1230')).toBe(false)
  })

  it('lehnt nicht-numerische Eingabe ab', () => {
    expect(isValidTimeOfDay('ab:cd')).toBe(false)
  })

  it('lehnt leere Eingabe ab', () => {
    expect(isValidTimeOfDay('')).toBe(false)
  })
})
