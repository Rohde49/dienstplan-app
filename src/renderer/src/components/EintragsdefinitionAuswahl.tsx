import { useEffect, useState } from 'react'
import type { Eintragsdefinition } from '../../../shared/types'

function formatZeitpunkt(value: string | null): string {
  return value ?? '–'
}

const ZEILEN_RASTER = 'grid grid-cols-[1fr_auto_auto] items-center gap-2'
const ZEILEN_BASIS =
  'hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring w-full cursor-pointer rounded-sm px-2 py-1.5 text-left outline-none focus-visible:ring-2'

interface EintragsdefinitionAuswahlProps {
  onSelect: (eintragsdefinition: Eintragsdefinition | null) => void
}

function EintragsdefinitionAuswahl({
  onSelect
}: EintragsdefinitionAuswahlProps): React.JSX.Element {
  const [eintraege, setEintraege] = useState<Eintragsdefinition[]>([])

  useEffect(() => {
    window.api.eintragsdefinition.list().then(setEintraege)
  }, [])

  return (
    <div className="max-h-80 overflow-y-auto">
      <div className={`${ZEILEN_RASTER} text-muted-foreground px-2 py-1 text-xs font-medium`}>
        <span>Kürzel</span>
        <span>Beginn</span>
        <span>Ende</span>
      </div>
      <div role="group" aria-label="Eintrag auswählen" className="flex flex-col text-sm">
        <button type="button" className={ZEILEN_BASIS} onClick={() => onSelect(null)}>
          <span className="text-muted-foreground italic">Kein Eintrag</span>
        </button>
        {eintraege.map((eintrag) => (
          <button
            key={eintrag.id}
            type="button"
            className={`${ZEILEN_BASIS} ${ZEILEN_RASTER}`}
            onClick={() => onSelect(eintrag)}
          >
            <span className="font-medium">{eintrag.kuerzel}</span>
            <span>{formatZeitpunkt(eintrag.beginn)}</span>
            <span>{formatZeitpunkt(eintrag.ende)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { EintragsdefinitionAuswahl }
