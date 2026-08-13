import type { Rufbereitschaft } from '../../../shared/types'

export function rufbereitschaftenAlsEntwurf(
  rufbereitschaften: Rufbereitschaft[]
): Record<string, number> {
  const entwurf: Record<string, number> = {}

  for (const rufbereitschaft of rufbereitschaften) {
    entwurf[String(rufbereitschaft.dienstplantagId)] = rufbereitschaft.teamMemberId
  }

  return entwurf
}
