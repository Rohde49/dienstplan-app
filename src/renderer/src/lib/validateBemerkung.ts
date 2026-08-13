export const MAX_BEMERKUNG_LAENGE = 40

export function validateBemerkungLaenge(value: string): string | null {
  if (value.length > MAX_BEMERKUNG_LAENGE) {
    return `Bemerkung darf höchstens ${MAX_BEMERKUNG_LAENGE} Zeichen lang sein.`
  }
  return null
}
