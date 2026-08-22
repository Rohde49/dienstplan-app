const AUSGEGLICHEN_FARBE = 'text-primary'
const ABWEICHUNG_FARBE = 'text-warning'

// Zeile 15 aus auswertung.md: grün bei exaktem Ausgleich (0:00), sonst farblich
// abgesetzt, analog zum FEIERTAG_FARBE-Muster in PlanungsGrid.tsx.
export function sollIstFarbe(differenzMinuten: number): string {
  return differenzMinuten === 0 ? AUSGEGLICHEN_FARBE : ABWEICHUNG_FARBE
}
