import { describe, expect, it } from 'vitest'
import {
  validateEintragsdefinitionInput,
  type EintragsdefinitionInput
} from './validateEintragsdefinition'

function gueltigeFesteEingabe(): EintragsdefinitionInput {
  return {
    kuerzel: 'F',
    name: 'Frühdienst',
    berechnungsart: 'fest',
    beginn: '06:00',
    ende: '14:00',
    anwesenheitszeitMinuten: 480,
    arbeitszeitMinuten: 450,
    arbeitszeitOhneNachtbereitschaftMinuten: 450,
    nachtbereitschaftMinuten: 0,
    nachtarbeitMinuten: 0
  }
}

function gueltigeMitarbeiterabhaengigeEingabe(): EintragsdefinitionInput {
  return {
    kuerzel: 'U',
    name: 'Urlaub',
    berechnungsart: 'mitarbeiterabhaengig',
    beginn: null,
    ende: null,
    anwesenheitszeitMinuten: 0,
    arbeitszeitMinuten: 0,
    arbeitszeitOhneNachtbereitschaftMinuten: 0,
    nachtbereitschaftMinuten: 0,
    nachtarbeitMinuten: 0
  }
}

describe('validateEintragsdefinitionInput', () => {
  it('akzeptiert eine gültige feste Eingabe', () => {
    expect(validateEintragsdefinitionInput(gueltigeFesteEingabe())).toEqual([])
  })

  it('akzeptiert eine gültige mitarbeiterabhängige Eingabe', () => {
    expect(validateEintragsdefinitionInput(gueltigeMitarbeiterabhaengigeEingabe())).toEqual([])
  })

  it('meldet fehlendes Kürzel', () => {
    const errors = validateEintragsdefinitionInput({ ...gueltigeFesteEingabe(), kuerzel: '  ' })
    expect(errors).toContain('Kürzel darf nicht leer sein.')
  })

  it('meldet fehlenden Namen', () => {
    const errors = validateEintragsdefinitionInput({ ...gueltigeFesteEingabe(), name: '' })
    expect(errors).toContain('Name darf nicht leer sein.')
  })

  it('meldet ungültige Berechnungsart', () => {
    const errors = validateEintragsdefinitionInput({
      ...gueltigeFesteEingabe(),
      berechnungsart: 'variabel'
    })
    expect(errors.some((e) => e.startsWith('Berechnungsart muss eine der folgenden sein'))).toBe(
      true
    )
  })

  it('meldet ungültigen Beginn', () => {
    const errors = validateEintragsdefinitionInput({ ...gueltigeFesteEingabe(), beginn: '24:00' })
    expect(errors).toContain(
      'Beginn muss eine gültige Uhrzeit im Format HH:MM sein oder leer bleiben.'
    )
  })

  it('meldet ungültiges Ende', () => {
    const errors = validateEintragsdefinitionInput({ ...gueltigeFesteEingabe(), ende: '12:60' })
    expect(errors).toContain(
      'Ende muss eine gültige Uhrzeit im Format HH:MM sein oder leer bleiben.'
    )
  })

  it('akzeptiert beginn/ende als null bei fester Berechnungsart', () => {
    const errors = validateEintragsdefinitionInput({
      ...gueltigeFesteEingabe(),
      beginn: null,
      ende: null
    })
    expect(errors).toEqual([])
  })

  it('meldet negative Zeitdauer-Werte', () => {
    const errors = validateEintragsdefinitionInput({
      ...gueltigeFesteEingabe(),
      nachtarbeitMinuten: -5
    })
    expect(errors).toContain('Nachtarbeit muss eine nichtnegative ganze Minutenzahl sein.')
  })

  it('meldet nicht-ganzzahlige Zeitdauer-Werte', () => {
    const errors = validateEintragsdefinitionInput({
      ...gueltigeFesteEingabe(),
      arbeitszeitMinuten: 12.5
    })
    expect(errors).toContain('Arbeitszeit muss eine nichtnegative ganze Minutenzahl sein.')
  })

  it('meldet Verletzung der mitarbeiterabhängigen Nullregel für alle fünf Zeitwerte', () => {
    const errors = validateEintragsdefinitionInput({
      ...gueltigeMitarbeiterabhaengigeEingabe(),
      anwesenheitszeitMinuten: 10,
      arbeitszeitMinuten: 10,
      arbeitszeitOhneNachtbereitschaftMinuten: 10,
      nachtbereitschaftMinuten: 10,
      nachtarbeitMinuten: 10
    })
    expect(errors).toContain(
      'Bei mitarbeiterabhängiger Berechnungsart muss die Anwesenheitszeit 0 sein.'
    )
    expect(errors).toContain(
      'Bei mitarbeiterabhängiger Berechnungsart muss die Arbeitszeit 0 sein.'
    )
    expect(errors).toContain(
      'Bei mitarbeiterabhängiger Berechnungsart muss die Arbeitszeit ohne Nachtbereitschaft 0 sein.'
    )
    expect(errors).toContain(
      'Bei mitarbeiterabhängiger Berechnungsart muss die Nachtbereitschaft 0 sein.'
    )
    expect(errors).toContain(
      'Bei mitarbeiterabhängiger Berechnungsart muss die Nachtarbeit 0 sein.'
    )
  })

  it('meldet gesetzten Beginn/Ende bei mitarbeiterabhängiger Berechnungsart', () => {
    const errors = validateEintragsdefinitionInput({
      ...gueltigeMitarbeiterabhaengigeEingabe(),
      beginn: '08:00',
      ende: '16:00'
    })
    expect(errors).toContain('Bei mitarbeiterabhängiger Berechnungsart muss Beginn leer sein.')
    expect(errors).toContain('Bei mitarbeiterabhängiger Berechnungsart muss Ende leer sein.')
  })

  it('sammelt mehrere Fehler gleichzeitig', () => {
    const errors = validateEintragsdefinitionInput({
      kuerzel: '',
      name: '',
      berechnungsart: 'unbekannt',
      beginn: '24:00',
      ende: '12:60',
      anwesenheitszeitMinuten: -1,
      arbeitszeitMinuten: -1,
      arbeitszeitOhneNachtbereitschaftMinuten: -1,
      nachtbereitschaftMinuten: -1,
      nachtarbeitMinuten: -1
    })
    expect(errors.length).toBeGreaterThan(1)
  })
})
