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
import { formatMinutesToHHMM } from '../../../shared/time'
import { cn } from '@/lib/utils'
import type { Eintragsdefinition } from '../../../shared/types'

const BERECHNUNGSART_LABELS: Record<Eintragsdefinition['berechnungsart'], string> = {
  fest: 'Fest',
  mitarbeiterabhaengig: 'Mitarbeiterabhängig'
}

function formatZeitpunkt(value: string | null): string {
  return value ?? '–'
}

interface EintragsdefinitionTableProps {
  eintraege: Eintragsdefinition[]
  selectedId: number | null
  onEdit: (eintrag: Eintragsdefinition) => void
}

function EintragsdefinitionTable({
  eintraege,
  selectedId,
  onEdit
}: EintragsdefinitionTableProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vorhandene Eintragsdefinitionen</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kürzel</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Berechnungsart</TableHead>
              <TableHead>Beginn</TableHead>
              <TableHead>Ende</TableHead>
              <TableHead>Anwesenheitszeit</TableHead>
              <TableHead>Arbeitszeit</TableHead>
              <TableHead>Arbeitszeit o. NB</TableHead>
              <TableHead>Nachtbereitschaft</TableHead>
              <TableHead>Nachtarbeit</TableHead>
              <TableHead>Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eintraege.length === 0 && (
              <TableRow>
                <TableCell colSpan={11} className="text-muted-foreground text-center">
                  Noch keine Eintragsdefinitionen angelegt.
                </TableCell>
              </TableRow>
            )}
            {eintraege.map((eintrag) => (
              <TableRow
                key={eintrag.id}
                className={cn(eintrag.id === selectedId && 'border-l-primary bg-accent border-l-2')}
              >
                <TableCell>{eintrag.kuerzel}</TableCell>
                <TableCell>{eintrag.name}</TableCell>
                <TableCell>{BERECHNUNGSART_LABELS[eintrag.berechnungsart]}</TableCell>
                <TableCell>{formatZeitpunkt(eintrag.beginn)}</TableCell>
                <TableCell>{formatZeitpunkt(eintrag.ende)}</TableCell>
                <TableCell>{formatMinutesToHHMM(eintrag.anwesenheitszeitMinuten)}</TableCell>
                <TableCell>{formatMinutesToHHMM(eintrag.arbeitszeitMinuten)}</TableCell>
                <TableCell>
                  {formatMinutesToHHMM(eintrag.arbeitszeitOhneNachtbereitschaftMinuten)}
                </TableCell>
                <TableCell>{formatMinutesToHHMM(eintrag.nachtbereitschaftMinuten)}</TableCell>
                <TableCell>{formatMinutesToHHMM(eintrag.nachtarbeitMinuten)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={`${eintrag.kuerzel} – ${eintrag.name} bearbeiten`}
                    onClick={() => onEdit(eintrag)}
                  >
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

export { EintragsdefinitionTable }
