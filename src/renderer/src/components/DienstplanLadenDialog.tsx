import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
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
  aktiverDienstplanId: number | null
  onAktiverDienstplanGeloescht: () => void
}

function DienstplanLadenDialog({
  open,
  onOpenChange,
  onSelect,
  aktiverDienstplanId,
  onAktiverDienstplanGeloescht
}: DienstplanLadenDialogProps): React.JSX.Element {
  const [dienstplaene, setDienstplaene] = useState<Dienstplan[]>([])
  const [loeschenDienstplan, setLoeschenDienstplan] = useState<Dienstplan | null>(null)

  const ladeListe = (): void => {
    window.api.dienstplan.list().then(setDienstplaene)
  }

  useEffect(() => {
    if (open) ladeListe()
  }, [open])

  const sortiert = [...dienstplaene].sort((a, b) => b.geaendertAm.localeCompare(a.geaendertAm))

  function handleLoeschenKlick(event: React.MouseEvent, plan: Dienstplan): void {
    event.stopPropagation()
    setLoeschenDienstplan(plan)
  }

  function handleLoeschenBestaetigen(): void {
    if (loeschenDienstplan === null) return
    const geloeschteId = loeschenDienstplan.id
    window.api.dienstplan.delete(geloeschteId).then(() => {
      ladeListe()
      setLoeschenDienstplan(null)
      if (geloeschteId === aktiverDienstplanId) {
        onAktiverDienstplanGeloescht()
      }
    })
  }

  return (
    <>
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
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortiert.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground text-center">
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
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Dienstplan löschen"
                      className="text-muted-foreground hover:text-destructive size-8"
                      onClick={(event) => handleLoeschenKlick(event, plan)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={loeschenDienstplan !== null}
        onOpenChange={(open) => {
          if (!open) setLoeschenDienstplan(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dienstplan löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Soll der Dienstplan „{loeschenDienstplan?.titel || 'Ohne Titel'}“ (
              {loeschenDienstplan ? MONATE_KURZ[loeschenDienstplan.monat - 1] : ''}{' '}
              {loeschenDienstplan?.jahr}) wirklich gelöscht werden? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={handleLoeschenBestaetigen}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { DienstplanLadenDialog }
