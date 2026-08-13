import { describe, expect, it } from 'vitest'
import { rufbereitschaftenAlsEntwurf } from './rufbereitschaftEntwurf'
import type { Rufbereitschaft } from '../../../shared/types'

describe('rufbereitschaftenAlsEntwurf', () => {
  it('gibt ein leeres Objekt für eine leere Liste zurück', () => {
    expect(rufbereitschaftenAlsEntwurf([])).toEqual({})
  })

  it('indiziert jede Rufbereitschaft über dienstplantagId als String-Schlüssel', () => {
    const rufbereitschaft: Rufbereitschaft = { id: 7, dienstplantagId: 5, teamMemberId: 2 }

    expect(rufbereitschaftenAlsEntwurf([rufbereitschaft])).toEqual({ '5': 2 })
  })
})
