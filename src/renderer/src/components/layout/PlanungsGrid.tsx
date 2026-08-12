import { Fragment } from 'react'
import type { Kalendertag } from '@/lib/kalendertage'
import { cn } from '@/lib/utils'
import type { TeamMember } from '../../../../shared/types'

const FEIERTAG_FARBE = 'bg-[color-mix(in_oklch,var(--destructive)_12%,var(--card))]'
const WOCHENENDE_FARBE = 'bg-muted'

const DATUM_SPALTE_BREITE = '8.5rem'
const UNTERSPALTE_BREITE = '4.5rem'
const RUFBEREITSCHAFT_SPALTE_BREITE = '9rem'
const BEMERKUNG_SPALTE_MINDESTBREITE = '12rem'

interface PlanungsGridProps {
  members: TeamMember[]
  tage: Kalendertag[]
}

function formatTagNummer(datum: string): string {
  return datum.slice(8, 10)
}

function PlanungsGrid({ members, tage }: PlanungsGridProps): React.JSX.Element {
  return (
    <div className="bg-card min-h-0 w-full flex-1 overflow-hidden rounded-lg border">
      <div className="h-full w-full overflow-auto">
        <table className="w-full table-fixed border-separate border-spacing-0 text-sm">
          <colgroup>
            <col style={{ width: DATUM_SPALTE_BREITE }} />
            {members.map((member) => (
              <Fragment key={member.id}>
                <col style={{ width: UNTERSPALTE_BREITE }} />
                <col style={{ width: UNTERSPALTE_BREITE }} />
                <col style={{ width: UNTERSPALTE_BREITE }} />
              </Fragment>
            ))}
            <col style={{ width: RUFBEREITSCHAFT_SPALTE_BREITE }} />
            <col style={{ minWidth: BEMERKUNG_SPALTE_MINDESTBREITE }} />
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="bg-card sticky top-0 left-0 z-30 h-16 border-r border-b px-4 text-left align-middle text-xs font-medium tracking-wide uppercase"
              >
                Datum
              </th>
              {members.map((member) => (
                <th
                  key={member.id}
                  colSpan={3}
                  className="sticky top-0 z-20 h-8 border-b border-l px-2 align-middle text-sm font-semibold text-white"
                  style={{ backgroundColor: member.farbe }}
                >
                  {member.vorname} {member.name}
                </th>
              ))}
              <th
                rowSpan={2}
                className="bg-card sticky top-0 z-20 h-16 border-b border-l px-2 align-middle text-xs font-medium tracking-wide"
              >
                Rufbereitschaft
              </th>
              <th
                rowSpan={2}
                className="bg-card sticky top-0 z-20 h-16 border-b border-l px-2 align-middle text-xs font-medium tracking-wide"
              >
                Bemerkung
              </th>
            </tr>
            <tr>
              {members.map((member) => (
                <Fragment key={member.id}>
                  <th className="bg-muted text-muted-foreground sticky top-8 z-20 h-8 border-b border-l px-2 text-center text-xs font-medium">
                    Eintrag
                  </th>
                  <th className="bg-muted text-muted-foreground sticky top-8 z-20 h-8 border-b px-2 text-center text-xs font-medium">
                    Beginn
                  </th>
                  <th className="bg-muted text-muted-foreground sticky top-8 z-20 h-8 border-b px-2 text-center text-xs font-medium">
                    Ende
                  </th>
                </Fragment>
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
              return (
                <tr key={tag.datum} className={cn(zeilenFarbe)}>
                  <td
                    className={cn(
                      'sticky left-0 z-10 border-r border-b px-4 py-2',
                      zeilenFarbe ?? 'bg-card'
                    )}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">{formatTagNummer(tag.datum)}.</span>
                      <span className="text-muted-foreground text-xs">{tag.wochentag}</span>
                    </div>
                    {tag.istFeiertag && (
                      <div className="text-muted-foreground mt-0.5 text-[11px] leading-tight">
                        {tag.feiertagsname}
                      </div>
                    )}
                  </td>
                  {members.map((member) => (
                    <Fragment key={member.id}>
                      <td className="text-muted-foreground border-b border-l px-2 py-2 text-center">
                        –
                      </td>
                      <td className="text-muted-foreground border-b px-2 py-2 text-center">–</td>
                      <td className="text-muted-foreground border-b px-2 py-2 text-center">–</td>
                    </Fragment>
                  ))}
                  <td className="border-b border-l px-2 py-2" />
                  <td className="border-b border-l px-2 py-2" />
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export { PlanungsGrid }
