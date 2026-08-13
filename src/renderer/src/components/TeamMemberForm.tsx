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
import { TEAM_MEMBER_COLORS } from '../../../shared/types'

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
                value={values.vorname}
                onChange={(e) => onChange({ vorname: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Nachname</Label>
              <Input
                id="name"
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
              value={values.wochenarbeitszeit}
              onChange={(e) => onChange({ wochenarbeitszeit: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Farbe</Label>
            <div role="radiogroup" aria-label="Farbe" className="flex flex-wrap gap-2">
              {TEAM_MEMBER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={values.farbe === color}
                  aria-label={color}
                  onClick={() => onChange({ farbe: color })}
                  className={cn(
                    'size-7 rounded-full border transition-shadow',
                    values.farbe === color &&
                      'ring-ring ring-offset-background ring-2 ring-offset-2'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {errors.length > 0 && (
            <ul className="text-destructive list-inside list-disc text-sm">
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
              className="bg-destructive text-white hover:bg-destructive/90"
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
