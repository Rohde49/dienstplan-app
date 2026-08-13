// Rundungsregel für berechnete Zeitdauern (siehe datenmodell.md, Abschnitt „Konventionen"):
// nächstgelegene volle Minute, eine exakte halbe Minute wird aufgerundet.
export function rundeAufVolleMinute(minuten: number): number {
  return Math.round(minuten)
}
