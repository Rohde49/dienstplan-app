import { useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { sollIstFarbe } from '@/lib/sollIstFarbe'
import type { Kalendertag } from '../../../shared/kalendertage'
import {
  berechneArbeitstageFuerMonat,
  berechneKennzahlenFuerMitarbeiter,
  formatiereSollIstDifferenz,
  type Kennzahlen
} from '../../../shared/auswertung'
import { formatMinutesToHHMM } from '../../../shared/time'
import type { Dienstplantag, PlaneintragSnapshot, TeamMember } from '../../../shared/types'

type KennzahlenFeld = Exclude<keyof Kennzahlen, 'anzahlFreieTage' | 'anzahlArbeitstage'>

interface KennzahlenZeile {
  label: string
  art: 'anzahl' | 'zeit' | 'arbeitstage' | 'differenz'
  feld?: KennzahlenFeld
}

const KENNZAHLEN_ZEILEN: KennzahlenZeile[] = [
  { label: 'Anzahl SN/F-Dienste', art: 'anzahl', feld: 'anzahlSnfDienste' },
  { label: 'Anzahl freier Samstage', art: 'anzahl', feld: 'anzahlFreieSamstage' },
  {
    label: 'Anzahl freier Sonntage und Feiertage',
    art: 'anzahl',
    feld: 'anzahlFreieSonntageUndFeiertage'
  },
  {
    label: 'Gearbeitete Stunden an Sonntagen und Feiertagen',
    art: 'zeit',
    feld: 'gearbeiteteStundenSonntageUndFeiertageMinuten'
  },
  { label: 'Arbeitszeit gesamt im Monat', art: 'zeit', feld: 'arbeitszeitGesamtMinuten' },
  {
    label: 'Nachtbereitschaft gesamt im Monat',
    art: 'zeit',
    feld: 'nachtbereitschaftGesamtMinuten'
  },
  {
    label: 'Arbeitszeit ohne Nachtbereitschaft gesamt im Monat',
    art: 'zeit',
    feld: 'arbeitszeitOhneNachtbereitschaftGesamtMinuten'
  },
  { label: 'Nachtarbeit gesamt im Monat', art: 'zeit', feld: 'nachtarbeitGesamtMinuten' },
  { label: 'Nachtzuschlag von 20 Prozent in Stunden', art: 'zeit', feld: 'nachtzuschlagMinuten' },
  {
    label: 'Nachtbereitschaftszuschlag von 25 Prozent in Stunden',
    art: 'zeit',
    feld: 'nachtbereitschaftszuschlagMinuten'
  },
  { label: 'Anzahl Rufbereitschaften', art: 'anzahl', feld: 'anzahlRufbereitschaften' },
  { label: 'Anzahl Arbeitstage', art: 'arbeitstage' },
  { label: 'Ist-Arbeitszeit', art: 'zeit', feld: 'istArbeitszeitMinuten' },
  { label: 'Soll-Arbeitszeit', art: 'zeit', feld: 'sollArbeitszeitMinuten' },
  { label: 'Differenz Soll/Ist', art: 'differenz' }
]

const ZEILEN_SPALTE_BREITE = '20rem'
const WERT_SPALTE_BREITE = '9rem'

interface AuswertungDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: TeamMember[]
  tage: Kalendertag[]
  dienstplantage: Dienstplantag[]
  planeintraegeEntwurf: Record<string, PlaneintragSnapshot>
  rufbereitschaftEntwurf: Record<string, number>
}

function AuswertungDialog({
  open,
  onOpenChange,
  members,
  tage,
  dienstplantage,
  planeintraegeEntwurf,
  rufbereitschaftEntwurf
}: AuswertungDialogProps): React.JSX.Element {
  const erzieher = members.filter((member) => member.rolle === 'Erzieher')

  const anzahlArbeitstage = useMemo(() => berechneArbeitstageFuerMonat(tage), [tage])

  const kennzahlenProMitarbeiter = useMemo(() => {
    const ergebnis = new Map<number, Kennzahlen>()
    members
      .filter((member) => member.rolle === 'Erzieher')
      .forEach((member) => {
        ergebnis.set(
          member.id,
          berechneKennzahlenFuerMitarbeiter(
            member.id,
            member.wochenarbeitszeitMinuten,
            tage,
            dienstplantage,
            planeintraegeEntwurf,
            rufbereitschaftEntwurf
          )
        )
      })
    return ergebnis
  }, [members, tage, dienstplantage, planeintraegeEntwurf, rufbereitschaftEntwurf])

  function formatiereZelle(zeile: KennzahlenZeile, kennzahlen: Kennzahlen): React.ReactNode {
    if (zeile.art === 'arbeitstage') return anzahlArbeitstage
    if (zeile.art === 'anzahl') return kennzahlen[zeile.feld as KennzahlenFeld]
    if (zeile.art === 'zeit') {
      return formatMinutesToHHMM(kennzahlen[zeile.feld as KennzahlenFeld] as number)
    }
    return formatiereSollIstDifferenz(kennzahlen.differenzSollIstMinuten)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[70vh] w-full max-w-[70vw] flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Auswertung</DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-auto rounded-md border">
          <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
            <colgroup>
              <col style={{ width: ZEILEN_SPALTE_BREITE }} />
              {erzieher.map((member) => (
                <col key={member.id} style={{ width: WERT_SPALTE_BREITE }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="bg-card sticky top-0 left-0 z-20 h-10 border-r border-b px-3 text-left align-middle text-xs font-medium tracking-wide uppercase">
                  Kennzahl
                </th>
                {erzieher.map((member) => (
                  <th
                    key={member.id}
                    className="sticky top-0 z-10 h-10 border-b border-l px-2 text-center align-middle text-sm font-semibold text-white"
                    style={{ backgroundColor: member.farbe }}
                  >
                    {member.vorname} {member.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {KENNZAHLEN_ZEILEN.map((zeile) => (
                <tr key={zeile.label}>
                  <td className="bg-card sticky left-0 z-10 border-r border-b px-3 py-2 text-left font-medium">
                    {zeile.label}
                  </td>
                  {erzieher.map((member) => {
                    const kennzahlen = kennzahlenProMitarbeiter.get(member.id)
                    if (!kennzahlen) return <td key={member.id} className="border-b border-l" />
                    return (
                      <td
                        key={member.id}
                        className={cn(
                          'border-b border-l px-2 py-2 text-center',
                          zeile.art === 'differenz' &&
                            sollIstFarbe(kennzahlen.differenzSollIstMinuten)
                        )}
                      >
                        {formatiereZelle(zeile, kennzahlen)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export { AuswertungDialog }
