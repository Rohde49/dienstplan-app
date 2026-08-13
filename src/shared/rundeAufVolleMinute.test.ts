import { describe, expect, it } from 'vitest'
import { rundeAufVolleMinute } from './rundeAufVolleMinute'

describe('rundeAufVolleMinute', () => {
  it('rundet auf die nächstgelegene volle Minute ab', () => {
    expect(rundeAufVolleMinute(468.2)).toBe(468)
  })

  it('rundet auf die nächstgelegene volle Minute auf', () => {
    expect(rundeAufVolleMinute(468.6)).toBe(469)
  })

  it('rundet eine exakte halbe Minute auf', () => {
    expect(rundeAufVolleMinute(2.5)).toBe(3)
  })

  it('lässt eine ganze Minute unverändert', () => {
    expect(rundeAufVolleMinute(120)).toBe(120)
  })

  it('rundet 0 auf 0', () => {
    expect(rundeAufVolleMinute(0)).toBe(0)
  })
})
