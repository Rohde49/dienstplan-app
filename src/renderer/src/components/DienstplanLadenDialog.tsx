import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import type { Dienstplan } from '../../../shared/types'

const MONATE_KURZ = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez'
]

function formatZeitstempel(iso: string): string {
  return new Date(iso).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })
}

interface DienstplanLadenDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (id: number) => void
}

function DienstplanLadenDialog({
  open,
  onOpenChange,
  onSelect
}: DienstplanLadenDialogProps): React.JSX.Element {
  const [dienstplaene, setDienstplaene] = useState<Dienstplan[]>([])

  useEffect(() => {
    if (open) {
      window.api.dienstplan.list().then(setDienstplaene)
    }
  }, [open])

  const sortiert = [...dienstplaene].sort((a, b) => b.geaendertAm.localeCompare(a.geaendertAm))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Dienstplan laden</DialogTitle>
          <DialogDescription>Vorhandenen Dienstplan auswählen und öffnen.</DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Titel</TableHead>
              <TableHead>Monat</TableHead>
              <TableHead>Jahr</TableHead>
              <TableHead>Erstellt am</TableHead>
              <TableHead>Geändert am</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortiert.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-center">
                  Noch keine Dienstpläne vorhanden.
                </TableCell>
              </TableRow>
            )}
            {sortiert.map((plan) => (
              <TableRow
                key={plan.id}
                className="hover:bg-accent/40 cursor-pointer"
                onClick={() => onSelect(plan.id)}
              >
                <TableCell>{plan.id}</TableCell>
                <TableCell>{plan.titel || 'Ohne Titel'}</TableCell>
                <TableCell>{MONATE_KURZ[plan.monat - 1]}</TableCell>
                <TableCell>{plan.jahr}</TableCell>
                <TableCell>{formatZeitstempel(plan.erstelltAm)}</TableCell>
                <TableCell>{formatZeitstempel(plan.geaendertAm)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  )
}

export { DienstplanLadenDialog }
