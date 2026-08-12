export interface Kalendertag {
  datum: string // "JJJJ-MM-TT", Konvention aus datenmodell.md
  wochentag: 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'
  istWochenende: boolean
  istFeiertag: boolean
  feiertagsname: string | null
}

const WOCHENTAGE: Kalendertag['wochentag'][] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

function formatDatum(jahr: number, monat: number, tag: number): string {
  return `${String(jahr).padStart(4, '0')}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`
}

// Gaußsche Osterformel (Anonymous Gregorian algorithm), liefert den Ostersonntag im Gregorianischen Kalender.
function berechneOstersonntag(jahr: number): Date {
  const a = jahr % 19
  const b = Math.floor(jahr / 100)
  const c = jahr % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const monatIndex = Math.floor((h + l - 7 * m + 114) / 31) - 1 // 0-basiert für Date()
  const tag = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(Date.UTC(jahr, monatIndex, tag))
}

function addTage(datum: Date, anzahl: number): Date {
  const ergebnis = new Date(datum.getTime())
  ergebnis.setUTCDate(ergebnis.getUTCDate() + anzahl)
  return ergebnis
}

function toDatumString(datum: Date): string {
  return formatDatum(datum.getUTCFullYear(), datum.getUTCMonth() + 1, datum.getUTCDate())
}

// Gesetzliche Feiertage nach § 2 Absatz 1 des Gesetzes über die Sonn- und Feiertage im Land
// Brandenburg (FTG), Stand geprüft gegen bravors.brandenburg.de/gesetze/ftg_2003/6.
function berechneFeiertage(jahr: number): Map<string, string> {
  const ostersonntag = berechneOstersonntag(jahr)
  const feiertage = new Map<string, string>()

  feiertage.set(formatDatum(jahr, 1, 1), 'Neujahr')
  feiertage.set(toDatumString(addTage(ostersonntag, -2)), 'Karfreitag')
  feiertage.set(toDatumString(ostersonntag), 'Ostersonntag')
  feiertage.set(toDatumString(addTage(ostersonntag, 1)), 'Ostermontag')
  feiertage.set(formatDatum(jahr, 5, 1), 'Tag der Arbeit')
  feiertage.set(toDatumString(addTage(ostersonntag, 39)), 'Christi Himmelfahrt')
  feiertage.set(toDatumString(addTage(ostersonntag, 49)), 'Pfingstsonntag')
  feiertage.set(toDatumString(addTage(ostersonntag, 50)), 'Pfingstmontag')
  feiertage.set(formatDatum(jahr, 10, 3), 'Tag der Deutschen Einheit')
  feiertage.set(formatDatum(jahr, 10, 31), 'Reformationstag')
  feiertage.set(formatDatum(jahr, 12, 25), '1. Weihnachtsfeiertag')
  feiertage.set(formatDatum(jahr, 12, 26), '2. Weihnachtsfeiertag')

  return feiertage
}

export function getKalendertageFuerMonat(jahr: number, monat: number): Kalendertag[] {
  const feiertageDesJahres = berechneFeiertage(jahr)
  const anzahlTage = new Date(Date.UTC(jahr, monat, 0)).getUTCDate()

  const tage: Kalendertag[] = []
  for (let tag = 1; tag <= anzahlTage; tag++) {
    const datum = formatDatum(jahr, monat, tag)
    const wochentagIndex = new Date(Date.UTC(jahr, monat - 1, tag)).getUTCDay()
    const wochentag = WOCHENTAGE[wochentagIndex]
    const istWochenende = wochentag === 'Sa' || wochentag === 'So'
    const feiertagsname = feiertageDesJahres.get(datum) ?? null

    tage.push({
      datum,
      wochentag,
      istWochenende,
      istFeiertag: feiertagsname !== null,
      feiertagsname
    })
  }

  return tage
}
