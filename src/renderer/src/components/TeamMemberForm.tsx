import { useState, type FormEvent } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { TEAM_MEMBER_FARBEN } from '../../../shared/types'

const FEHLER_ID = 'team-member-fehler'

interface TeamMemberFormValues {
  vorname: string
  name: string
  rolle: string
  wochenarbeitszeit: string
  farbe: string
}

interface TeamMemberFormProps {
  mode: 'create' | 'edit'
  values: TeamMemberFormValues
  errors: string[]
  onChange: (patch: Partial<TeamMemberFormValues>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onDelete: () => void
}

function TeamMemberForm({
  mode,
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
  onDelete
}: TeamMemberFormProps): React.JSX.Element {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const istFarbeGewaehlt = TEAM_MEMBER_FARBEN.some((farbe) => farbe.wert === values.farbe)
  const hatFehler = errors.length > 0

  // Radiogroup-Muster: Pfeiltasten wechseln die Auswahl, die Gruppe hat nur
  // einen Tabstopp (roving tabindex über das tabIndex-Attribut unten).
  function handleFarbeKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const richtung = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (richtung === undefined) return
    event.preventDefault()
    const aktuell = TEAM_MEMBER_FARBEN.findIndex((farbe) => farbe.wert === values.farbe)
    const basis = aktuell === -1 ? 0 : aktuell
    const naechste = (basis + richtung + TEAM_MEMBER_FARBEN.length) % TEAM_MEMBER_FARBEN.length
    onChange({ farbe: TEAM_MEMBER_FARBEN[naechste].wert })
    const gruppe = event.currentTarget
    ;(gruppe.children[naechste] as HTMLElement | undefined)?.focus()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === 'create' ? 'Neuen Mitarbeiter anlegen' : 'Mitarbeiter bearbeiten'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="vorname">Vorname</Label>
              <Input
                id="vorname"
                aria-invalid={hatFehler}
                aria-describedby={hatFehler ? FEHLER_ID : undefined}
                value={values.vorname}
                onChange={(e) => onChange({ vorname: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nachname</Label>
              <Input
                id="name"
                aria-invalid={hatFehler}
                aria-describedby={hatFehler ? FEHLER_ID : undefined}
                value={values.name}
                onChange={(e) => onChange({ name: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rolle">Rolle</Label>
            <Select value={values.rolle} onValueChange={(v) => onChange({ rolle: v })}>
              <SelectTrigger id="rolle">
                <SelectValue placeholder="Rolle wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Erzieher">Erzieher</SelectItem>
                <SelectItem value="Praktikant">Praktikant</SelectItem>
                <SelectItem value="Wirtschaftskraft">Wirtschaftskraft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wochenarbeitszeit">Wochenarbeitszeit</Label>
            <Input
              id="wochenarbeitszeit"
              placeholder="HH:MM"
              aria-invalid={hatFehler}
              aria-describedby={hatFehler ? FEHLER_ID : undefined}
              value={values.wochenarbeitszeit}
              onChange={(e) => onChange({ wochenarbeitszeit: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label id="farbe-label">Farbe</Label>
            <div
              role="radiogroup"
              aria-labelledby="farbe-label"
              className="flex flex-wrap gap-2"
              onKeyDown={handleFarbeKeyDown}
            >
              {TEAM_MEMBER_FARBEN.map((farbe, index) => {
                const gewaehlt = values.farbe === farbe.wert
                return (
                  <button
                    key={farbe.wert}
                    type="button"
                    role="radio"
                    aria-checked={gewaehlt}
                    aria-label={farbe.name}
                    tabIndex={gewaehlt || (!istFarbeGewaehlt && index === 0) ? 0 : -1}
                    onClick={() => onChange({ farbe: farbe.wert })}
                    className={cn(
                      'focus-visible:ring-ring size-7 rounded-full border outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-offset-2',
                      gewaehlt && 'ring-foreground ring-2 ring-offset-2'
                    )}
                    style={{ backgroundColor: farbe.wert }}
                  />
                )
              })}
            </div>
          </div>

          {errors.length > 0 && (
            <ul
              id={FEHLER_ID}
              role="alert"
              className="text-destructive list-inside list-disc text-sm"
            >
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            <Button type="submit">Speichern</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            {mode === 'edit' && (
              <Button
                type="button"
                variant="destructive"
                className="ml-auto"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Löschen
              </Button>
            )}
          </div>
        </form>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mitarbeiter löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Soll {values.vorname} {values.name} wirklich gelöscht werden? Diese Aktion kann nicht
              rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDeleteDialogOpen(false)
                onDelete()
              }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export { TeamMemberForm, type TeamMemberFormValues }
