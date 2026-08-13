import { useEffect, useState } from 'react'
import type { Eintragsdefinition } from '../../../shared/types'

function formatZeitpunkt(value: string | null): string {
  return value ?? '–'
}

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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground text-xs">
            <th className="px-2 py-1 text-left font-medium">Kürzel</th>
            <th className="px-2 py-1 text-left font-medium">Beginn</th>
            <th className="px-2 py-1 text-left font-medium">Ende</th>
          </tr>
        </thead>
        <tbody>
          <tr
            className="hover:bg-accent/60 cursor-pointer rounded-sm"
            onClick={() => onSelect(null)}
          >
            <td colSpan={3} className="text-muted-foreground px-2 py-1.5 italic">
              Kein Eintrag
            </td>
          </tr>
          {eintraege.map((eintrag) => (
            <tr
              key={eintrag.id}
              className="hover:bg-accent/60 cursor-pointer rounded-sm"
              onClick={() => onSelect(eintrag)}
            >
              <td className="px-2 py-1.5 font-medium">{eintrag.kuerzel}</td>
              <td className="px-2 py-1.5">{formatZeitpunkt(eintrag.beginn)}</td>
              <td className="px-2 py-1.5">{formatZeitpunkt(eintrag.ende)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { EintragsdefinitionAuswahl }
