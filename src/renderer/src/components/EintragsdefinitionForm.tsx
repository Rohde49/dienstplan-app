import { useState, type FormEvent } from 'react'
import { ChevronDown } from 'lucide-react'
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
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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

interface EintragsdefinitionFormValues {
  kuerzel: string
  name: string
  berechnungsart: string
  beginn: string
  ende: string
  anwesenheitszeit: string
  arbeitszeit: string
  arbeitszeitOhneNachtbereitschaft: string
  nachtbereitschaft: string
  nachtarbeit: string
}

interface EintragsdefinitionFormProps {
  mode: 'create' | 'edit'
  open: boolean
  onOpenChange: (open: boolean) => void
  values: EintragsdefinitionFormValues
  errors: string[]
  onChange: (patch: Partial<EintragsdefinitionFormValues>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onDelete: () => void
}

function EintragsdefinitionForm({
  mode,
  open,
  onOpenChange,
  values,
  errors,
  onChange,
  onSubmit,
  onCancel,
  onDelete
}: EintragsdefinitionFormProps): React.JSX.Element {
  const istMitarbeiterabhaengig = values.berechnungsart === 'mitarbeiterabhaengig'
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  return (
    <Card>
      <Collapsible open={open} onOpenChange={onOpenChange}>
        <CollapsibleTrigger asChild>
          <button type="button" className="flex w-full items-center justify-between gap-4 p-6">
            <CardTitle>
              {mode === 'create'
                ? 'Neue Eintragsdefinition anlegen'
                : 'Eintragsdefinition bearbeiten'}
            </CardTitle>
            <ChevronDown
              className={cn(
                'text-muted-foreground size-5 shrink-0 transition-transform',
                open && 'rotate-180'
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="kuerzel">Kürzel</Label>
                  <Input
                    id="kuerzel"
                    value={values.kuerzel}
                    onChange={(e) => onChange({ kuerzel: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={values.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="berechnungsart">Berechnungsart</Label>
                <Select
                  value={values.berechnungsart}
                  onValueChange={(v) => onChange({ berechnungsart: v })}
                >
                  <SelectTrigger id="berechnungsart">
                    <SelectValue placeholder="Berechnungsart wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fest">Fest</SelectItem>
                    <SelectItem value="mitarbeiterabhaengig">Mitarbeiterabhängig</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="beginn">Beginn</Label>
                  <Input
                    id="beginn"
                    placeholder="HH:MM"
                    value={values.beginn}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ beginn: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ende">Ende</Label>
                  <Input
                    id="ende"
                    placeholder="HH:MM"
                    value={values.ende}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ ende: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="anwesenheitszeit">Anwesenheitszeit</Label>
                  <Input
                    id="anwesenheitszeit"
                    placeholder="HH:MM"
                    value={values.anwesenheitszeit}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ anwesenheitszeit: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="arbeitszeit">Arbeitszeit</Label>
                  <Input
                    id="arbeitszeit"
                    placeholder="HH:MM"
                    value={values.arbeitszeit}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ arbeitszeit: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="arbeitszeitOhneNachtbereitschaft">
                    Arbeitszeit ohne Nachtbereitschaft
                  </Label>
                  <Input
                    id="arbeitszeitOhneNachtbereitschaft"
                    placeholder="HH:MM"
                    value={values.arbeitszeitOhneNachtbereitschaft}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ arbeitszeitOhneNachtbereitschaft: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nachtbereitschaft">Nachtbereitschaft</Label>
                  <Input
                    id="nachtbereitschaft"
                    placeholder="HH:MM"
                    value={values.nachtbereitschaft}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ nachtbereitschaft: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nachtarbeit">Nachtarbeit</Label>
                  <Input
                    id="nachtarbeit"
                    placeholder="HH:MM"
                    value={values.nachtarbeit}
                    disabled={istMitarbeiterabhaengig}
                    onChange={(e) => onChange({ nachtarbeit: e.target.value })}
                  />
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
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eintragsdefinition löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Soll die Eintragsdefinition „{values.kuerzel} – {values.name}&rdquo; wirklich gelöscht
              werden? Diese Aktion kann nicht rückgängig gemacht werden.
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

export { EintragsdefinitionForm, type EintragsdefinitionFormValues }
