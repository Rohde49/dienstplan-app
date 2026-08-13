import { useEffect, useState } from 'react'
import type { TeamMember } from '../../../shared/types'

interface RufbereitschaftAuswahlProps {
  onSelect: (teamMember: TeamMember | null) => void
}

function RufbereitschaftAuswahl({ onSelect }: RufbereitschaftAuswahlProps): React.JSX.Element {
  const [erzieher, setErzieher] = useState<TeamMember[]>([])

  useEffect(() => {
    window.api.team
      .list()
      .then((members) => setErzieher(members.filter((member) => member.rolle === 'Erzieher')))
  }, [])

  return (
    <div className="max-h-80 overflow-y-auto">
      <table className="w-full text-sm">
        <tbody>
          <tr
            className="hover:bg-accent/60 cursor-pointer rounded-sm"
            onClick={() => onSelect(null)}
          >
            <td className="text-muted-foreground px-2 py-1.5 italic">Keine Rufbereitschaft</td>
          </tr>
          {erzieher.map((member) => (
            <tr
              key={member.id}
              className="hover:bg-accent/60 cursor-pointer rounded-sm"
              onClick={() => onSelect(member)}
            >
              <td className="px-2 py-1.5 font-medium">
                {member.vorname} {member.name}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export { RufbereitschaftAuswahl }
