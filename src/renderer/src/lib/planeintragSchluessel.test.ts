import { describe, expect, it } from 'vitest'
import { parsePlaneintragSchluessel, planeintragSchluessel } from './planeintragSchluessel'

describe('planeintragSchluessel', () => {
  it('kombiniert dienstplantagId und teamMemberId zu einem eindeutigen Schlüssel', () => {
    expect(planeintragSchluessel(5, 1)).toBe('5:1')
  })
})

describe('parsePlaneintragSchluessel', () => {
  it('zerlegt einen Schlüssel wieder in dienstplantagId und teamMemberId', () => {
    expect(parsePlaneintragSchluessel('5:1')).toEqual({ dienstplantagId: 5, teamMemberId: 1 })
  })

  it('ist zu planeintragSchluessel invers', () => {
    const schluessel = planeintragSchluessel(93, 7)
    expect(parsePlaneintragSchluessel(schluessel)).toEqual({
      dienstplantagId: 93,
      teamMemberId: 7
    })
  })
})
