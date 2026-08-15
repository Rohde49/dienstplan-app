import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Kalendertag } from '../../../../shared/kalendertage'
import { planeintragSchluessel } from '../../../../shared/planeintragSchluessel'
import { berechneKennzahlenFuerMitarbeiter, type Kennzahlen } from '../../../../shared/auswertung'
import { formatMinutesToHHMM } from '../../../../shared/time'
import {
  DATUM_SPALTE_BREITE,
  FEIERTAG_FARBE,
  RUFBEREITSCHAFT_SPALTE_BREITE,
  WOCHENENDE_FARBE,
  formatTagUndMonat,
  mitarbeiterSpaltenStil
} from '@/lib/planAnsicht'
import type { Dienstplantag, PlaneintragSnapshot, TeamMember } from '../../../../shared/types'

const MITARBEITER_SPALTE_BREITE = '8rem'
const BEMERKUNG_SPALTE_MINDESTBREITE = '12rem'

interface VerkuerzteAnsichtProps {
  members: TeamMember[]
  tage: Kalendertag[]
  dienstplantage?: Dienstplantag[]
  planeintraegeEntwurf?: Record<string, PlaneintragSnapshot>
  rufbereitschaftEntwurf?: Record<string, number>
  bemerkungEntwurf?: Record<string, string>
}

function formatPlaneintragZelle(eintrag: PlaneintragSnapshot | undefined): string {
  if (!eintrag) return ''
  if (eintrag.beginn && eintrag.ende) return `${eintrag.kuerzel} ${eintrag.beginn}–${eintrag.ende}`
  return eintrag.kuerzel
}

function VerkuerzteAnsicht({
  members,
  tage,
  dienstplantage = [],
  planeintraegeEntwurf = {},
  rufbereitschaftEntwurf = {},
  bemerkungEntwurf = {}
}: VerkuerzteAnsichtProps): React.JSX.Element {
  const dienstplantagIdProDatum = new Map(dienstplantage.map((tag) => [tag.datum, tag.id]))

  const kennzahlenProMitarbeiter = useMemo(() => {
    const ergebnis = new Map<number, Kennzahlen>()
    members.forEach((member) => {
      if (member.rolle !== 'Erzieher') return
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

  return (
    <div className="bg-card relative min-h-0 w-full flex-1 overflow-hidden rounded-lg border">
      <div className="h-full w-full overflow-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <colgroup>
            <col style={{ width: DATUM_SPALTE_BREITE }} />
            {members.map((member) => (
              <col key={member.id} style={{ width: MITARBEITER_SPALTE_BREITE }} />
            ))}
            <col style={{ width: RUFBEREITSCHAFT_SPALTE_BREITE }} />
            <col style={{ minWidth: BEMERKUNG_SPALTE_MINDESTBREITE }} />
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="bg-card sticky top-0 left-0 z-30 h-20 border-r border-b px-4 text-center align-middle text-xs font-medium tracking-wide uppercase"
              >
                Datum
              </th>
              {members.map((member) => (
                <th
                  key={member.id}
                  className="bg-muted sticky top-0 z-20 h-12 border-b border-l px-1 py-1 text-center align-middle"
                >
                  <span className="text-xs font-semibold">
                    {formatMinutesToHHMM(member.wochenarbeitszeitMinuten)}
                  </span>
                </th>
              ))}
              <th
                rowSpan={2}
                className="bg-card sticky top-0 z-20 h-20 border-b border-l px-2 align-middle text-xs font-medium tracking-wide"
              >
                Rufbereitschaft
              </th>
              <th
                rowSpan={2}
                className="bg-card sticky top-0 z-20 h-20 border-b border-l px-2 align-middle text-xs font-medium tracking-wide"
              >
                Bemerkung
              </th>
            </tr>
            <tr>
              {members.map((member) => (
                <th
                  key={member.id}
                  scope="col"
                  className="sticky top-12 z-20 h-8 border-b border-l border-t-[3px] px-2 align-middle text-sm font-semibold"
                  style={mitarbeiterSpaltenStil(member.farbe)}
                >
                  {member.vorname} {member.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tage.map((tag) => {
              const zeilenFarbe = tag.istFeiertag
                ? FEIERTAG_FARBE
                : tag.istWochenende
                  ? WOCHENENDE_FARBE
                  : undefined
              const dienstplantagId = dienstplantagIdProDatum.get(tag.datum)
              return (
                <tr
                  key={tag.datum}
                  data-dienstplantag-id={dienstplantagId ?? ''}
                  className={cn(zeilenFarbe)}
                >
                  <td
                    className={cn(
                      'sticky left-0 z-10 border-r border-b px-4 py-2 text-center',
                      zeilenFarbe ?? 'bg-card'
                    )}
                  >
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="font-semibold">{formatTagUndMonat(tag.datum)}</span>
                      <span className="text-muted-foreground text-xs">{tag.wochentag}</span>
                    </div>
                    {tag.istFeiertag && (
                      <div className="text-muted-foreground mt-0.5 text-[11px] leading-tight">
                        {tag.feiertagsname}
                      </div>
                    )}
                  </td>
                  {members.map((member) => {
                    const schluessel =
                      dienstplantagId !== undefined
                        ? planeintragSchluessel(dienstplantagId, member.id)
                        : null
                    const eintrag = schluessel ? planeintraegeEntwurf[schluessel] : undefined
                    return (
                      <td
                        key={member.id}
                        className="text-muted-foreground border-b border-l px-2 py-2 text-center"
                      >
                        {formatPlaneintragZelle(eintrag)}
                      </td>
                    )
                  })}
                  <td className="text-muted-foreground border-b border-l px-2 py-2 text-center">
                    {dienstplantagId !== undefined
                      ? (members.find(
                          (member) => member.id === rufbereitschaftEntwurf[String(dienstplantagId)]
                        )?.name ?? '')
                      : ''}
                  </td>
                  <td className="border-b border-l px-2 py-2">
                    {dienstplantagId !== undefined
                      ? (bemerkungEntwurf[String(dienstplantagId)] ?? '')
                      : ''}
                  </td>
                </tr>
              )
            })}
            <tr className="bg-secondary">
              <td className="bg-secondary sticky left-0 z-10 border-t-2 border-r border-b px-4 py-2 font-semibold">
                Ist
              </td>
              {members.map((member) => {
                const kennzahlen = kennzahlenProMitarbeiter.get(member.id)
                return (
                  <td
                    key={member.id}
                    className="text-muted-foreground border-t-2 border-b border-l px-2 py-2 text-center"
                  >
                    {kennzahlen ? formatMinutesToHHMM(kennzahlen.istArbeitszeitMinuten) : ''}
                  </td>
                )
              })}
              <td className="border-t-2 border-b border-l px-2 py-2" />
              <td className="border-t-2 border-b border-l px-2 py-2" />
            </tr>
            <tr className="bg-secondary">
              <td className="bg-secondary sticky left-0 z-10 border-b px-4 py-2 font-semibold">
                Soll
              </td>
              {members.map((member) => {
                const kennzahlen = kennzahlenProMitarbeiter.get(member.id)
                return (
                  <td
                    key={member.id}
                    className="text-muted-foreground border-b border-l px-2 py-2 text-center"
                  >
                    {kennzahlen ? formatMinutesToHHMM(kennzahlen.sollArbeitszeitMinuten) : ''}
                  </td>
                )
              })}
              <td className="border-b border-l px-2 py-2" />
              <td className="border-b border-l px-2 py-2" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { VerkuerzteAnsicht }
