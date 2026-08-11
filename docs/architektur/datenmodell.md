# Datenmodell

Entitäten liegen in `shared/types.ts`, siehe [`projektstruktur.md`](./projektstruktur.md). Dieses Dokument hält die inhaltlichen Entscheidungen zu den einzelnen Entitäten fest, nicht nur die Struktur.

## Geplante Entitäten

Die App bildet nur ein einzelnes Team ab, deshalb gibt es keine eigene `Team`-Entität. Geplant sind aktuell:

- `TeamMember` (entworfen, siehe unten)
- `PlanEntry` (noch offen)
- `Dienstplan`/`ShiftType` (noch offen)

Weitere Entitäten (z. B. Abwesenheiten, Qualifikationen) sind bewusst zurückgestellt und werden erst bei Bedarf ergänzt.

## TeamMember

```typescript
interface TeamMember {
  id: number
  vorname: string
  name: string
  rolle: 'Erzieher' | 'Praktikant' | 'Wirtschaftskraft'
  wochenarbeitszeitMinuten: number // z. B. 39h-Woche = 2340, Anzeige/Eingabe als "39:00"
  farbe: string // Hex-Wert aus fester Palette, z. B. "#3A8DFF"
}
```

### Entscheidungen und Begründung

**`id: number`**: Ergibt sich aus der bestehenden `better-sqlite3`-Anbindung, die standardmäßig einen auto-increment Integer als Primärschlüssel (rowid) vergibt. Keine offene Entscheidung, sondern Konsequenz aus Schritt 1.

**`rolle` als fester Union Type**: Die drei bekannten Rollen (Erzieher, Praktikant, Wirtschaftskraft) werden als TypeScript Union Type abgebildet, nicht als eigene Datenbanktabelle. Passt zu einer kleinen, aktuell bekannten Rollenliste. Falls künftig Rollen frei durch den Nutzer verwaltet werden sollen, ist das ein bewusster späterer Umbau zu einer eigenen Entität.

**`wochenarbeitszeitMinuten` als Zahl in Minuten**: Zeitwerte werden in der gesamten App im Format HH:MM dargestellt und eingegeben, das betrifft aber nur Anzeige und Eingabe. Intern wird die Wochenarbeitszeit als Minutenzahl gespeichert (z. B. 39h = 2340), weil spätere Berechnungen (Soll-/Ist-Vergleich, Summenbildung über einen Monat) mit einer Zahl fehlerfrei möglich sind, während ein String wie `"39:00"` bei jeder Rechnung neu geparst werden müsste. Die Umrechnung HH:MM ↔ Minuten erfolgt an der UI-Grenze (Renderer).

**`farbe` als Hex-String aus fester Palette**: Auswahl aus einer vordefinierten Palette statt freier Farbwahl, um Lesbarkeit und Unterscheidbarkeit der Mitglieder im Dienstplan zu garantieren. Palette in Schritt 2 zusammen mit der Theme-Farbpalette entschieden (siehe [`styling.md`](./styling.md)): zehn kräftige, gut unterscheidbare Farbtöne, bewusst getrennt vom neutralen Theme-Akzent — kein Grauton (für UI-Chrome reserviert) und keine zu große Nähe zum `--destructive`-Rotton (um Verwechslung mit Fehler-/Lösch-Zuständen zu vermeiden):

```typescript
export const TEAM_MEMBER_COLORS = [
  '#3A8DFF', // Blau
  '#34B37A', // Grün
  '#F2994A', // Orange
  '#9B6BDE', // Violett
  '#2FB6C4', // Türkis
  '#E15A97', // Pink
  '#C9A227', // Oliv-Gelb
  '#5C6BC0', // Indigo
  '#C1662F', // Terrakotta
  '#7FB236' // Lindgrün
] as const
```

Die Werte sind hiermit final. Der Code-Ort (`shared/types.ts`, als exportierte Konstante, die Main und Renderer gemeinsam nutzen) folgt dem in [`projektstruktur.md`](./projektstruktur.md) festgelegten Ablauf: `shared/types.ts` und die `TeamMember`-Entität werden erst bei der tatsächlichen Umsetzung der Team-Verwaltung angelegt, nicht vorab auf Vorrat.

## Offen

- `ShiftType`/`Dienstplan`: Struktur noch zu klären.
- `PlanEntry`: Struktur noch zu klären, abhängig von `ShiftType`.
