import { describe, expect, it } from 'vitest'
import { formatMinutesToHHMM, parseHHMMToMinutes } from './time'

describe('parseHHMMToMinutes', () => {
  it('parst 0 Minuten', () => {
    expect(parseHHMMToMinutes('00:00')).toBe(0)
  })

  it('parst einstellige Stunden', () => {
    expect(parseHHMMToMinutes('5:30')).toBe(330)
  })

  it('parst mehrstellige Stunden', () => {
    expect(parseHHMMToMinutes('120:15')).toBe(7215)
  })

  it('ignoriert umgebende Leerzeichen', () => {
    expect(parseHHMMToMinutes('  39:00  ')).toBe(2340)
  })

  it('wirft bei fehlendem Doppelpunkt', () => {
    expect(() => parseHHMMToMinutes('3930')).toThrow()
  })

  it('wirft bei Minuten über 59', () => {
    expect(() => parseHHMMToMinutes('12:60')).toThrow()
  })

  it('wirft bei nicht-numerischer Eingabe', () => {
    expect(() => parseHHMMToMinutes('ab:cd')).toThrow()
  })

  it('wirft bei leerer Eingabe', () => {
    expect(() => parseHHMMToMinutes('')).toThrow()
  })
})

describe('formatMinutesToHHMM', () => {
  it('formatiert 0 Minuten', () => {
    expect(formatMinutesToHHMM(0)).toBe('00:00')
  })

  it('formatiert einstellige Stunden mit führender Null', () => {
    expect(formatMinutesToHHMM(330)).toBe('05:30')
  })

  it('formatiert mehrstellige Stunden', () => {
    expect(formatMinutesToHHMM(7215)).toBe('120:15')
  })

  it('formatiert die 39h-Woche aus dem Datenmodell-Beispiel', () => {
    expect(formatMinutesToHHMM(2340)).toBe('39:00')
  })

  it('wirft bei negativen Werten', () => {
    expect(() => formatMinutesToHHMM(-5)).toThrow()
  })

  it('wirft bei Nicht-Ganzzahlen', () => {
    expect(() => formatMinutesToHHMM(1.5)).toThrow()
  })
})

describe('Rundtrip', () => {
  it('parst und formatiert konsistent', () => {
    expect(formatMinutesToHHMM(parseHHMMToMinutes('39:00'))).toBe('39:00')
  })
})
