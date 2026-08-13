import { describe, expect, it } from 'vitest'
import { berechneMitarbeiterabhaengigeArbeitszeitMinuten } from './mitarbeiterabhaengigeArbeitszeit'

describe('berechneMitarbeiterabhaengigeArbeitszeitMinuten', () => {
  it('berechnet ein Fünftel der 39h-Woche aus dem Datenmodell-Beispiel', () => {
    expect(berechneMitarbeiterabhaengigeArbeitszeitMinuten(2340)).toBe(468)
  })

  it('rundet auf die nächstgelegene volle Minute ab', () => {
    expect(berechneMitarbeiterabhaengigeArbeitszeitMinuten(2341)).toBe(468)
  })

  it('rundet auf die nächstgelegene volle Minute auf', () => {
    expect(berechneMitarbeiterabhaengigeArbeitszeitMinuten(2343)).toBe(469)
  })

  it('rundet eine exakte halbe Minute auf', () => {
    expect(berechneMitarbeiterabhaengigeArbeitszeitMinuten(12.5)).toBe(3)
  })

  it('berechnet 0 bei einer Wochenarbeitszeit von 0', () => {
    expect(berechneMitarbeiterabhaengigeArbeitszeitMinuten(0)).toBe(0)
  })
})
