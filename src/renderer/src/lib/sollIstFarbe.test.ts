import { describe, expect, it } from 'vitest'
import { sollIstFarbe } from './sollIstFarbe'

describe('sollIstFarbe', () => {
  it('liefert die Ausgeglichen-Farbe bei exakt 0', () => {
    expect(sollIstFarbe(0)).toBe('text-primary')
  })

  it('liefert die Abweichung-Farbe bei einer positiven Differenz', () => {
    expect(sollIstFarbe(45)).not.toBe('text-primary')
  })

  it('liefert die Abweichung-Farbe bei einer negativen Differenz', () => {
    expect(sollIstFarbe(-45)).not.toBe('text-primary')
  })

  it('liefert für positive und negative Differenz dieselbe Abweichung-Farbe', () => {
    expect(sollIstFarbe(45)).toBe(sollIstFarbe(-45))
  })
})
