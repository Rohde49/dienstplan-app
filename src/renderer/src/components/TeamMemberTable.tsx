import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { formatMinutesToHHMM } from '@/lib/time'
import { cn } from '@/lib/utils'
import type { TeamMember } from '../../../shared/types'

interface TeamMemberTableProps {
  members: TeamMember[]
  selectedId: number | null
  onEdit: (member: TeamMember) => void
}

function TeamMemberTable({ members, selectedId, onEdit }: TeamMemberTableProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vorhandene Mitarbeiter</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Farbe</TableHead>
              <TableHead>Mitarbeiter</TableHead>
              <TableHead>Rolle</TableHead>
              <TableHead>Wochenarbeitszeit</TableHead>
              <TableHead>Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground text-center">
                  Noch keine Mitarbeiter angelegt.
                </TableCell>
              </TableRow>
            )}
            {members.map((member) => (
              <TableRow
                key={member.id}
                className={cn(
                  member.id === selectedId && 'border-l-primary bg-accent/40 border-l-2'
                )}
              >
                <TableCell>
                  <span
                    className="inline-block size-4 rounded-full"
                    style={{ backgroundColor: member.farbe }}
                    aria-hidden="true"
                  />
                </TableCell>
                <TableCell>
                  {member.vorname} {member.name}
                </TableCell>
                <TableCell>{member.rolle}</TableCell>
                <TableCell>{formatMinutesToHHMM(member.wochenarbeitszeitMinuten)}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => onEdit(member)}>
                    Bearbeiten
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export { TeamMemberTable }
