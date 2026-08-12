import { isValidTimeOfDay } from './timeOfDay'
import type { Eintragsdefinition } from '../../../shared/types'

const ALLOWED_BERECHNUNGSARTEN: readonly Eintragsdefinition['berechnungsart'][] = [
  'fest',
  'mitarbeiterabhaengig'
]

export interface EintragsdefinitionInput {
  kuerzel: string
  name: string
  berechnungsart: string
  beginn: string | null
  ende: string | null
  anwesenheitszeitMinuten: number
  arbeitszeitMinuten: number
  arbeitszeitOhneNachtbereitschaftMinuten: number
  nachtbereitschaftMinuten: number
  nachtarbeitMinuten: number
}

function isNonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0
}

export function validateEintragsdefinitionInput(data: EintragsdefinitionInput): string[] {
  const errors: string[] = []

  if (!data.kuerzel.trim()) {
    errors.push('Kürzel darf nicht leer sein.')
  }

  if (!data.name.trim()) {
    errors.push('Name darf nicht leer sein.')
  }

  if (
    !ALLOWED_BERECHNUNGSARTEN.includes(data.berechnungsart as Eintragsdefinition['berechnungsart'])
  ) {
    errors.push(
      `Berechnungsart muss eine der folgenden sein: ${ALLOWED_BERECHNUNGSARTEN.join(', ')}.`
    )
  }

  if (data.beginn !== null && !isValidTimeOfDay(data.beginn)) {
    errors.push('Beginn muss eine gültige Uhrzeit im Format HH:MM sein oder leer bleiben.')
  }

  if (data.ende !== null && !isValidTimeOfDay(data.ende)) {
    errors.push('Ende muss eine gültige Uhrzeit im Format HH:MM sein oder leer bleiben.')
  }

  const dauerFelder: { label: string; value: number }[] = [
    { label: 'Anwesenheitszeit', value: data.anwesenheitszeitMinuten },
    { label: 'Arbeitszeit', value: data.arbeitszeitMinuten },
    {
      label: 'Arbeitszeit ohne Nachtbereitschaft',
      value: data.arbeitszeitOhneNachtbereitschaftMinuten
    },
    { label: 'Nachtbereitschaft', value: data.nachtbereitschaftMinuten },
    { label: 'Nachtarbeit', value: data.nachtarbeitMinuten }
  ]

  for (const feld of dauerFelder) {
    if (!isNonNegativeInteger(feld.value)) {
      errors.push(`${feld.label} muss eine nichtnegative ganze Minutenzahl sein.`)
    }
  }

  if (data.berechnungsart === 'mitarbeiterabhaengig') {
    if (data.anwesenheitszeitMinuten !== 0) {
      errors.push('Bei mitarbeiterabhängiger Berechnungsart muss die Anwesenheitszeit 0 sein.')
    }
    if (data.arbeitszeitMinuten !== 0) {
      errors.push('Bei mitarbeiterabhängiger Berechnungsart muss die Arbeitszeit 0 sein.')
    }
    if (data.arbeitszeitOhneNachtbereitschaftMinuten !== 0) {
      errors.push(
        'Bei mitarbeiterabhängiger Berechnungsart muss die Arbeitszeit ohne Nachtbereitschaft 0 sein.'
      )
    }
    if (data.nachtbereitschaftMinuten !== 0) {
      errors.push('Bei mitarbeiterabhängiger Berechnungsart muss die Nachtbereitschaft 0 sein.')
    }
    if (data.nachtarbeitMinuten !== 0) {
      errors.push('Bei mitarbeiterabhängiger Berechnungsart muss die Nachtarbeit 0 sein.')
    }
    if (data.beginn !== null) {
      errors.push('Bei mitarbeiterabhängiger Berechnungsart muss Beginn leer sein.')
    }
    if (data.ende !== null) {
      errors.push('Bei mitarbeiterabhängiger Berechnungsart muss Ende leer sein.')
    }
  }

  return errors
}
