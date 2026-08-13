import { rundeAufVolleMinute } from '../../../shared/rundeAufVolleMinute'

export function berechneMitarbeiterabhaengigeArbeitszeitMinuten(
  wochenarbeitszeitMinuten: number
): number {
  return rundeAufVolleMinute(wochenarbeitszeitMinuten / 5)
}
