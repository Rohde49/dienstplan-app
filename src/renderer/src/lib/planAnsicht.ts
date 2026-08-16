import type { CSSProperties } from 'react'

// Gemeinsame Darstellungskonstanten von PlanungsGrid und VerkuerzteAnsicht.
// Vor Schritt 17 zusammengeführt, damit der Umbau zur Druckansicht keine dritte
// Kopie erzeugt (siehe docs/style/design-system.md).

export const FEIERTAG_FARBE = 'bg-[color-mix(in_oklch,var(--destructive)_10%,var(--card))]'
export const WOCHENENDE_FARBE = 'bg-muted'

export const DATUM_SPALTE_BREITE = '8.5rem'
export const RUFBEREITSCHAFT_SPALTE_BREITE = '9rem'

export function formatTagUndMonat(datum: string): string {
  return `${datum.slice(8, 10)}.${datum.slice(5, 7)}.`
}

// Mitarbeiterspalten tragen die Personenfarbe als Oberkante plus helle Tönung,
// nicht als gesättigte Vollfläche mit weißer Schrift: von den zehn Farben aus
// TEAM_MEMBER_COLORS erreichte nur eine mit Weiß das AA-Kontrastminimum.
export function mitarbeiterSpaltenStil(farbe: string): CSSProperties {
  return {
    backgroundColor: `color-mix(in oklch, ${farbe} 16%, white)`,
    color: `color-mix(in oklch, ${farbe} 55%, black)`,
    borderTopColor: farbe
  }
}
