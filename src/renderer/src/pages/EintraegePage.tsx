import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StackedManagementLayout } from '@/components/layout/StackedManagementLayout'
import {
  EintragsdefinitionForm,
  type EintragsdefinitionFormValues
} from '@/components/EintragsdefinitionForm'
import { EintragsdefinitionTable } from '@/components/EintragsdefinitionTable'
import { formatMinutesToHHMM, parseHHMMToMinutes } from '../../../shared/time'
import { validateEintragsdefinitionInput } from '@/lib/validateEintragsdefinition'
import type { Eintragsdefinition } from '../../../shared/types'

const emptyFormValues: EintragsdefinitionFormValues = {
  kuerzel: '',
  name: '',
  berechnungsart: '',
  beginn: '',
  ende: '',
  anwesenheitszeit: '',
  arbeitszeit: '',
  arbeitszeitOhneNachtbereitschaft: '',
  nachtbereitschaft: '',
  nachtarbeit: ''
}

function EintraegePage(): React.JSX.Element {
  const [eintraege, setEintraege] = useState<Eintragsdefinition[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState<EintragsdefinitionFormValues>(emptyFormValues)
  const [errors, setErrors] = useState<string[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadEintraege = useCallback(() => {
    window.api.eintragsdefinition.list().then(setEintraege)
  }, [])

  useEffect(() => {
    loadEintraege()
  }, [loadEintraege])

  function handleNewEintrag(): void {
    setSelectedId(null)
    setFormValues(emptyFormValues)
    setErrors([])
  }

  function handleStartCreate(): void {
    handleNewEintrag()
    setIsFormOpen(true)
  }

  function handleCancel(): void {
    handleNewEintrag()
    setIsFormOpen(false)
  }

  function handleEdit(eintrag: Eintragsdefinition): void {
    setSelectedId(eintrag.id)
    setFormValues({
      kuerzel: eintrag.kuerzel,
      name: eintrag.name,
      berechnungsart: eintrag.berechnungsart,
      beginn: eintrag.beginn ?? '',
      ende: eintrag.ende ?? '',
      anwesenheitszeit: formatMinutesToHHMM(eintrag.anwesenheitszeitMinuten),
      arbeitszeit: formatMinutesToHHMM(eintrag.arbeitszeitMinuten),
      arbeitszeitOhneNachtbereitschaft: formatMinutesToHHMM(
        eintrag.arbeitszeitOhneNachtbereitschaftMinuten
      ),
      nachtbereitschaft: formatMinutesToHHMM(eintrag.nachtbereitschaftMinuten),
      nachtarbeit: formatMinutesToHHMM(eintrag.nachtarbeitMinuten)
    })
    setErrors([])
    setIsFormOpen(true)
  }

  function handleFormChange(patch: Partial<EintragsdefinitionFormValues>): void {
    setFormValues((prev) => {
      const next = { ...prev, ...patch }
      if (patch.berechnungsart === 'mitarbeiterabhaengig') {
        next.beginn = ''
        next.ende = ''
        next.anwesenheitszeit = '00:00'
        next.arbeitszeit = '00:00'
        next.arbeitszeitOhneNachtbereitschaft = '00:00'
        next.nachtbereitschaft = '00:00'
        next.nachtarbeit = '00:00'
      }
      return next
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    const parseErrors: string[] = []
    function parseMinuten(label: string, value: string): number {
      try {
        return parseHHMMToMinutes(value)
      } catch {
        parseErrors.push(`${label}: ungültiges Zeitformat, erwartet wird HH:MM.`)
        return 0
      }
    }

    const anwesenheitszeitMinuten = parseMinuten('Anwesenheitszeit', formValues.anwesenheitszeit)
    const arbeitszeitMinuten = parseMinuten('Arbeitszeit', formValues.arbeitszeit)
    const arbeitszeitOhneNachtbereitschaftMinuten = parseMinuten(
      'Arbeitszeit ohne Nachtbereitschaft',
      formValues.arbeitszeitOhneNachtbereitschaft
    )
    const nachtbereitschaftMinuten = parseMinuten('Nachtbereitschaft', formValues.nachtbereitschaft)
    const nachtarbeitMinuten = parseMinuten('Nachtarbeit', formValues.nachtarbeit)

    if (parseErrors.length > 0) {
      setErrors(parseErrors)
      return
    }

    const input = {
      kuerzel: formValues.kuerzel,
      name: formValues.name,
      berechnungsart: formValues.berechnungsart,
      beginn: formValues.beginn.trim() ? formValues.beginn.trim() : null,
      ende: formValues.ende.trim() ? formValues.ende.trim() : null,
      anwesenheitszeitMinuten,
      arbeitszeitMinuten,
      arbeitszeitOhneNachtbereitschaftMinuten,
      nachtbereitschaftMinuten,
      nachtarbeitMinuten
    }

    const validationErrors = validateEintragsdefinitionInput(input)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    const data = {
      ...input,
      berechnungsart: input.berechnungsart as Eintragsdefinition['berechnungsart']
    }

    const request =
      selectedId === null
        ? window.api.eintragsdefinition.add(data)
        : window.api.eintragsdefinition.update(selectedId, data)

    request.then(() => {
      handleNewEintrag()
      setIsFormOpen(false)
      loadEintraege()
    })
  }

  function handleDelete(): void {
    if (selectedId === null) return

    window.api.eintragsdefinition.delete(selectedId).then(() => {
      handleNewEintrag()
      setIsFormOpen(false)
      loadEintraege()
    })
  }

  return (
    <div className="p-6 pt-12">
      <StackedManagementLayout
        title="Eintrag-Verwaltung"
        description="Eintragsdefinitionen anlegen, bearbeiten und verwalten"
        backAction={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Zurück zur Startseite
            </Link>
          </Button>
        }
        primaryAction={
          <Button onClick={handleStartCreate}>
            <Plus className="size-4" />
            Neue Eintragsdefinition
          </Button>
        }
        detailPosition="top"
        list={
          <EintragsdefinitionTable
            eintraege={eintraege}
            selectedId={selectedId}
            onEdit={handleEdit}
          />
        }
        detail={
          <EintragsdefinitionForm
            mode={selectedId === null ? 'create' : 'edit'}
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            values={formValues}
            errors={errors}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={handleDelete}
          />
        }
      />
    </div>
  )
}

export default EintraegePage
