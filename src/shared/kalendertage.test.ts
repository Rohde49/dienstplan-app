import { describe, expect, it } from 'vitest'
import { getKalendertageFuerMonat } from './kalendertage'

describe('getKalendertageFuerMonat', () => {
  it('liefert die korrekte Anzahl Tage für einen gewöhnlichen Monat', () => {
    const tage = getKalendertageFuerMonat(2023, 4)
    expect(tage).toHaveLength(30)
  })

  it('liefert 29 Tage für Februar im Schaltjahr', () => {
    const tage = getKalendertageFuerMonat(2024, 2)
    expect(tage).toHaveLength(29)
  })

  it('liefert 28 Tage für Februar im Nicht-Schaltjahr', () => {
    const tage = getKalendertageFuerMonat(2023, 2)
    expect(tage).toHaveLength(28)
  })

  it('ordnet den Wochentag korrekt zu', () => {
    const tage = getKalendertageFuerMonat(2023, 4)
    // 2023-04-09 ist ein Sonntag (Ostersonntag), bekannter Referenzpunkt.
    expect(tage[8]).toMatchObject({ datum: '2023-04-09', wochentag: 'So' })
    expect(tage[6]).toMatchObject({ datum: '2023-04-07', wochentag: 'Fr' })
  })

  it('erkennt feste Feiertage im Dezember (bekannter Monat)', () => {
    const tage = getKalendertageFuerMonat(2023, 12)
    const heiligabend = tage.find((t) => t.datum === '2023-12-24')
    const ersterFeiertag = tage.find((t) => t.datum === '2023-12-25')
    const zweiterFeiertag = tage.find((t) => t.datum === '2023-12-26')

    expect(heiligabend?.istFeiertag).toBe(false)
    expect(ersterFeiertag).toMatchObject({
      wochentag: 'Mo',
      istFeiertag: true,
      feiertagsname: '1. Weihnachtsfeiertag'
    })
    expect(zweiterFeiertag).toMatchObject({
      wochentag: 'Di',
      istFeiertag: true,
      feiertagsname: '2. Weihnachtsfeiertag'
    })
  })

  it('erkennt Neujahr als festen Feiertag', () => {
    const tage = getKalendertageFuerMonat(2023, 1)
    expect(tage[0]).toMatchObject({
      datum: '2023-01-01',
      istFeiertag: true,
      feiertagsname: 'Neujahr'
    })
  })

  it('berechnet die beweglichen Osterfeiertage für ein bekanntes Jahr (2023: Ostersonntag 9. April)', () => {
    const tage = getKalendertageFuerMonat(2023, 4)
    const karfreitag = tage.find((t) => t.datum === '2023-04-07')
    const ostersonntag = tage.find((t) => t.datum === '2023-04-09')
    const ostermontag = tage.find((t) => t.datum === '2023-04-10')

    expect(karfreitag).toMatchObject({ istFeiertag: true, feiertagsname: 'Karfreitag' })
    expect(ostersonntag).toMatchObject({ istFeiertag: true, feiertagsname: 'Ostersonntag' })
    expect(ostermontag).toMatchObject({ istFeiertag: true, feiertagsname: 'Ostermontag' })
  })

  it('berechnet die beweglichen Pfingstfeiertage für dasselbe bekannte Jahr', () => {
    const tage = getKalendertageFuerMonat(2023, 5)
    const himmelfahrt = tage.find((t) => t.datum === '2023-05-18')
    const pfingstsonntag = tage.find((t) => t.datum === '2023-05-28')
    const pfingstmontag = tage.find((t) => t.datum === '2023-05-29')

    expect(himmelfahrt).toMatchObject({ istFeiertag: true, feiertagsname: 'Christi Himmelfahrt' })
    expect(pfingstsonntag).toMatchObject({ istFeiertag: true, feiertagsname: 'Pfingstsonntag' })
    expect(pfingstmontag).toMatchObject({ istFeiertag: true, feiertagsname: 'Pfingstmontag' })
  })

  it('zählt einen Tag, der zugleich Sonntag und Feiertag ist, nur einmal (kein doppelter Eintrag)', () => {
    const tage = getKalendertageFuerMonat(2023, 4)
    const ostersonntag = tage.find((t) => t.datum === '2023-04-09')

    expect(ostersonntag).toMatchObject({
      wochentag: 'So',
      istWochenende: true,
      istFeiertag: true,
      feiertagsname: 'Ostersonntag'
    })
  })

  it('markiert gewöhnliche Wochenendtage als Wochenende, aber nicht als Feiertag', () => {
    const tage = getKalendertageFuerMonat(2023, 4)
    const samstag = tage.find((t) => t.datum === '2023-04-01')

    expect(samstag).toMatchObject({ wochentag: 'Sa', istWochenende: true, istFeiertag: false })
  })

  it('markiert gewöhnliche Werktage weder als Wochenende noch als Feiertag', () => {
    const tage = getKalendertageFuerMonat(2023, 4)
    const werktag = tage.find((t) => t.datum === '2023-04-11')

    expect(werktag).toMatchObject({ wochentag: 'Di', istWochenende: false, istFeiertag: false })
  })
})
