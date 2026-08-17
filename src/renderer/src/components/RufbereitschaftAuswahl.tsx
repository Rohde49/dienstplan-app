import { useEffect, useState } from 'react'
import { fehlerMelder } from '@/lib/fehlermeldung'
import type { TeamMember } from '../../../shared/types'

const ZEILEN_BASIS =
  'hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring w-full cursor-pointer rounded-sm px-2 py-1.5 text-left outline-none focus-visible:ring-2'

interface RufbereitschaftAuswahlProps {
  onSelect: (teamMember: TeamMember | null) => void
}

function RufbereitschaftAuswahl({ onSelect }: RufbereitschaftAuswahlProps): React.JSX.Element {
  const [erzieher, setErzieher] = useState<TeamMember[]>([])

  useEffect(() => {
    window.api.team
      .list()
      .then((members) => setErzieher(members.filter((member) => member.rolle === 'Erzieher')))
      .catch(fehlerMelder('Die Mitarbeiterliste konnte nicht geladen werden.'))
  }, [])

  return (
    <div className="max-h-80 overflow-y-auto">
      <div role="group" aria-label="Rufbereitschaft auswählen" className="flex flex-col text-sm">
        <button type="button" className={ZEILEN_BASIS} onClick={() => onSelect(null)}>
          <span className="text-muted-foreground italic">Keine Rufbereitschaft</span>
        </button>
        {erzieher.map((member) => (
          <button
            key={member.id}
            type="button"
            className={`${ZEILEN_BASIS} font-medium`}
            onClick={() => onSelect(member)}
          >
            {member.vorname} {member.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export { RufbereitschaftAuswahl }
