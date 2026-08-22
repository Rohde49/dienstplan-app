import { Fragment, useMemo, useState } from 'react'
import type { Kalendertag } from '../../../../shared/kalendertage'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EintragsdefinitionAuswahl } from '@/components/EintragsdefinitionAuswahl'
import { RufbereitschaftAuswahl } from '@/components/RufbereitschaftAuswahl'
import { sollIstFarbe } from '@/lib/sollIstFarbe'
import {
  DATUM_SPALTE_BREITE,
  FEIERTAG_FARBE,
  RUFBEREITSCHAFT_SPALTE_BREITE,
  WOCHENENDE_FARBE,
  formatTagUndMonat,
  mitarbeiterSpaltenStil
} from '@/lib/planAnsicht'
import { planeintragSchluessel } from '../../../../shared/planeintragSchluessel'
import {
  berechneKennzahlenFuerMitarbeiter,
  formatiereSollIstDifferenz,
  type Kennzahlen
} from '../../../../shared/auswertung'
import { formatMinutesToHHMM } from '../../../../shared/time'
import { MAX_BEMERKUNG_LAENGE } from '@/lib/validateBemerkung'
import type {
  Dienstplantag,
  Eintragsdefinition,
  PlaneintragSnapshot,
  TeamMember
} from '../../../../shared/types'

const UNTERSPALTE_BREITE = '5.5rem'
const BEMERKUNG_SPALTE_BREITE = '9rem'

const ZEITZELLE_BUTTON =
  'hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring h-full w-full px-2 py-2 text-center outline-none focus-visible:ring-2 focus-visible:ring-inset'

interface PlanungsGridProps {
  members: TeamMember[]
  tage: Kalendertag[]
  dienstplantage?: Dienstplantag[]
  planeintraegeEntwurf?: Record<string, PlaneintragSnapshot>
  veraenderteZellen?: Set<string>
  onEintragChange?: (
    dienstplantagId: number,
    teamMemberId: number,
    eintragsdefinition: Eintragsdefinition | null
  ) => void
  rufbereitschaftEntwurf?: Record<string, number>
  veraenderteRufbereitschaftZellen?: Set<string>
  onRufbereitschaftChange?: (dienstplantagId: number, teamMember: TeamMember | null) => void
  bemerkungEntwurf?: Record<string, string>
  veraenderteBemerkungZellen?: Set<string>
  onBemerkungChange?: (dienstplantagId: number, wert: string) => void
}

interface PlaneintragZellengruppeProps {
  istInteraktiv: boolean
  eintrag: PlaneintragSnapshot | undefined
  hatAbweichung: boolean
  onSelect: (eintragsdefinition: Eintragsdefinition | null) => void
}

function PlaneintragZellengruppe({
  istInteraktiv,
  eintrag,
  hatAbweichung,
  onSelect
}: PlaneintragZellengruppeProps): React.JSX.Element {
  const [offen, setOffen] = useState(false)

  if (!istInteraktiv) {
    return (
      <>
        <td className="text-muted-foreground border-b border-l px-2 py-2 text-center">–</td>
        <td className="text-muted-foreground border-b px-2 py-2 text-center">–</td>
        <td className="text-muted-foreground border-b px-2 py-2 text-center">–</td>
      </>
    )
  }

  return (
    <>
      <td className="relative border-b border-l p-0 text-center">
        <Popover open={offen} onOpenChange={setOffen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring flex h-full w-full items-center justify-center px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-inset"
            >
              {eintrag?.kuerzel ?? '–'}
              {hatAbweichung && (
                <span className="bg-primary absolute top-1 right-1 size-1.5 rounded-full" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <EintragsdefinitionAuswahl
              onSelect={(eintragsdefinition) => {
                onSelect(eintragsdefinition)
                setOffen(false)
              }}
            />
          </PopoverContent>
        </Popover>
      </td>
      <td className="text-muted-foreground border-b p-0 text-center">
        <button
          type="button"
          aria-label={`Beginn ${eintrag?.beginn ?? 'nicht gesetzt'}, Eintrag ändern`}
          className={ZEITZELLE_BUTTON}
          onClick={() => setOffen(true)}
        >
          {eintrag?.beginn ?? '–'}
        </button>
      </td>
      <td className="text-muted-foreground border-b p-0 text-center">
        <button
          type="button"
          aria-label={`Ende ${eintrag?.ende ?? 'nicht gesetzt'}, Eintrag ändern`}
          className={ZEITZELLE_BUTTON}
          onClick={() => setOffen(true)}
        >
          {eintrag?.ende ?? '–'}
        </button>
      </td>
    </>
  )
}

interface RufbereitschaftZelleProps {
  istInteraktiv: boolean
  teamMember: TeamMember | undefined
  hatAbweichung: boolean
  onSelect: (teamMember: TeamMember | null) => void
}

function RufbereitschaftZelle({
  istInteraktiv,
  teamMember,
  hatAbweichung,
  onSelect
}: RufbereitschaftZelleProps): React.JSX.Element {
  const [offen, setOffen] = useState(false)

  if (!istInteraktiv) {
    return <td className="text-muted-foreground border-b border-l px-2 py-2 text-center">–</td>
  }

  return (
    <td className="relative border-b border-l p-0 text-center">
      <Popover open={offen} onOpenChange={setOffen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring flex h-full w-full items-center justify-center px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            {teamMember?.name ?? '–'}
            {hatAbweichung && (
              <span className="bg-primary absolute top-1 right-1 size-1.5 rounded-full" />
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start">
          <RufbereitschaftAuswahl
            onSelect={(member) => {
              onSelect(member)
              setOffen(false)
            }}
          />
        </PopoverContent>
      </Popover>
    </td>
  )
}

interface BemerkungZelleProps {
  istInteraktiv: boolean
  wert: string
  hatAbweichung: boolean
  onChange: (wert: string) => void
}

function BemerkungZelle({
  istInteraktiv,
  wert,
  hatAbweichung,
  onChange
}: BemerkungZelleProps): React.JSX.Element {
  if (!istInteraktiv) {
    return <td className="border-b border-l px-2 py-2" />
  }

  return (
    <td className="relative border-b border-l p-0">
      <Input
        value={wert}
        onChange={(e) => onChange(e.target.value)}
        maxLength={MAX_BEMERKUNG_LAENGE}
        className="h-full w-full rounded-none border-none bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-1"
      />
      {hatAbweichung && (
        <span className="bg-primary absolute top-1 right-1 size-1.5 rounded-full" />
      )}
    </td>
  )
}

function PlanungsGrid({
  members,
  tage,
  dienstplantage = [],
  planeintraegeEntwurf = {},
  veraenderteZellen = new Set(),
  onEintragChange = () => {},
  rufbereitschaftEntwurf = {},
  veraenderteRufbereitschaftZellen = new Set(),
  onRufbereitschaftChange = () => {},
  bemerkungEntwurf = {},
  veraenderteBemerkungZellen = new Set(),
  onBemerkungChange = () => {}
}: PlanungsGridProps): React.JSX.Element {
  const dienstplantagIdProDatum = new Map(dienstplantage.map((tag) => [tag.datum, tag.id]))
  const istVorschau = dienstplantage.length === 0

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
      {istVorschau && (
        <span className="text-warning absolute top-2 right-3 z-40 text-xs">
          Vorschau · nicht gespeichert
        </span>
      )}
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
            <col style={{ width: BEMERKUNG_SPALTE_BREITE }} />
          </colgroup>
          <thead>
            <tr>
              <th
                rowSpan={3}
                className="bg-card sticky top-0 left-0 z-30 h-28 border-r border-b px-4 text-center align-middle text-xs font-medium tracking-wide uppercase"
              >
                Datum
              </th>
              {members.map((member) => {
                const kennzahlen = kennzahlenProMitarbeiter.get(member.id)
                return (
                  <Fragment key={member.id}>
                    <th className="bg-muted sticky top-0 z-20 h-12 border-b border-l px-1 py-1 text-center align-middle">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-muted-foreground text-[9px] leading-tight font-medium uppercase">
                          SN/F-Dienste
                        </span>
                        <span className="text-xs font-semibold">
                          {kennzahlen ? kennzahlen.anzahlSnfDienste : 'n/A'}
                        </span>
                      </div>
                    </th>
                    <th className="bg-muted sticky top-0 z-20 h-12 border-b px-1 py-1 text-center align-middle">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-muted-foreground text-[9px] leading-tight font-medium uppercase">
                          Freie Tage
                        </span>
                        <span className="text-xs font-semibold">
                          {kennzahlen ? kennzahlen.anzahlFreieTage : 'n/A'}
                        </span>
                      </div>
                    </th>
                    <th className="bg-muted sticky top-0 z-20 h-12 border-b px-1 py-1 text-center align-middle">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-muted-foreground text-[9px] leading-tight font-medium uppercase">
                          Δ Soll/Ist
                        </span>
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            kennzahlen && sollIstFarbe(kennzahlen.differenzSollIstMinuten)
                          )}
                        >
                          {kennzahlen
                            ? formatiereSollIstDifferenz(kennzahlen.differenzSollIstMinuten)
                            : 'n/A'}
                        </span>
                      </div>
                    </th>
                  </Fragment>
                )
              })}
              <th
                rowSpan={3}
                className="bg-card sticky top-0 z-20 h-28 border-b border-l px-2 align-middle text-xs font-medium tracking-wide"
              >
                Rufbereitschaft
              </th>
              <th
                rowSpan={3}
                className="bg-card sticky top-0 z-20 h-28 border-b border-l px-2 align-middle text-xs font-medium tracking-wide"
              >
                Bemerkung
              </th>
            </tr>
            <tr>
              {members.map((member) => (
                <th
                  key={member.id}
                  colSpan={3}
                  scope="colgroup"
                  className="sticky top-12 z-20 h-8 border-b border-l border-t-[3px] px-2 align-middle text-sm font-semibold"
                  style={mitarbeiterSpaltenStil(member.farbe)}
                >
                  {member.vorname} {member.name}
                </th>
              ))}
            </tr>
            <tr>
              {members.map((member) => (
                <Fragment key={member.id}>
                  <th className="bg-muted text-muted-foreground sticky top-20 z-20 h-8 border-b border-l px-2 text-center text-xs font-medium">
                    Eintrag
                  </th>
                  <th className="bg-muted text-muted-foreground sticky top-20 z-20 h-8 border-b px-2 text-center text-xs font-medium">
                    Beginn
                  </th>
                  <th className="bg-muted text-muted-foreground sticky top-20 z-20 h-8 border-b px-2 text-center text-xs font-medium">
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
                    return (
                      <Fragment key={member.id}>
                        <PlaneintragZellengruppe
                          istInteraktiv={dienstplantagId !== undefined}
                          eintrag={schluessel ? planeintraegeEntwurf[schluessel] : undefined}
                          hatAbweichung={schluessel ? veraenderteZellen.has(schluessel) : false}
                          onSelect={(eintragsdefinition) => {
                            if (dienstplantagId === undefined) return
                            onEintragChange(dienstplantagId, member.id, eintragsdefinition)
                          }}
                        />
                      </Fragment>
                    )
                  })}
                  <RufbereitschaftZelle
                    istInteraktiv={dienstplantagId !== undefined}
                    teamMember={
                      dienstplantagId !== undefined
                        ? members.find(
                            (member) =>
                              member.id === rufbereitschaftEntwurf[String(dienstplantagId)]
                          )
                        : undefined
                    }
                    hatAbweichung={
                      dienstplantagId !== undefined
                        ? veraenderteRufbereitschaftZellen.has(String(dienstplantagId))
                        : false
                    }
                    onSelect={(teamMember) => {
                      if (dienstplantagId === undefined) return
                      onRufbereitschaftChange(dienstplantagId, teamMember)
                    }}
                  />
                  <BemerkungZelle
                    istInteraktiv={dienstplantagId !== undefined}
                    wert={
                      dienstplantagId !== undefined
                        ? (bemerkungEntwurf[String(dienstplantagId)] ?? '')
                        : ''
                    }
                    hatAbweichung={
                      dienstplantagId !== undefined
                        ? veraenderteBemerkungZellen.has(String(dienstplantagId))
                        : false
                    }
                    onChange={(wert) => {
                      if (dienstplantagId === undefined) return
                      onBemerkungChange(dienstplantagId, wert)
                    }}
                  />
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
                    colSpan={3}
                    className="text-muted-foreground border-t-2 border-b border-l px-2 py-2 text-center"
                  >
                    {kennzahlen ? formatMinutesToHHMM(kennzahlen.istArbeitszeitMinuten) : 'n/A'}
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
                    colSpan={3}
                    className="text-muted-foreground border-b border-l px-2 py-2 text-center"
                  >
                    {kennzahlen ? formatMinutesToHHMM(kennzahlen.sollArbeitszeitMinuten) : 'n/A'}
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

export { PlanungsGrid }
