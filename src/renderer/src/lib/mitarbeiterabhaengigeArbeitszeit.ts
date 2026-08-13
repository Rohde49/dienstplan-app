export function berechneMitarbeiterabhaengigeArbeitszeitMinuten(
  wochenarbeitszeitMinuten: number
): number {
  return Math.round(wochenarbeitszeitMinuten / 5)
}
