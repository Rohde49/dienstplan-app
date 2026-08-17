# Ablaufpläne

Ein Ablaufplan zerlegt einen Entwicklungsschritt in einzelne, für sich abgeschlossene Prompts. Jeder Punkt ist ein eigener Plan-Mode-Durchlauf: erst planen lassen, nach Freigabe umsetzen, prüfen, dann zum nächsten Punkt.

Der Zweck ist die **Prüfbarkeit dazwischen**. Ein Schritt, der in einem Zug umgesetzt wird, lässt sich am Ende nur noch als Ganzes beurteilen; ein Schritt in acht Punkten mit acht Prüfungen zeigt beim dritten Punkt, dass der zweite falsch war.

## Aktueller Plan

Aktuell kein Ablaufplan in Arbeit.

Abgeschlossene Pläne liegen unter [`erledigt/`](./erledigt) und tragen oben eine Zeile mit Abschlussdatum und Commit.

## Lebenszyklus

1. **Planen** — Scope klären, Design-Entscheidungen festhalten, Punkte schneiden. Der Plan entsteht _vor_ der Umsetzung und wird als eigener Commit abgelegt.
2. **Umsetzen** — Punkt für Punkt, jeder mit der im Plan genannten Prüfung.
3. **Abschließen** — Häkchen in [`TODO.md`](../TODO.md), Eintrag im [Tagebuch](../tagebuch), Zusammenfassung in [`erledigt.md`](../erledigt.md).
4. **Verschieben** — `git mv` nach `erledigt/`, Abschluss-Banner oben ergänzen.

**Dateinamen werden nicht geändert**, auch wenn sich der Zuschnitt verschiebt: Sie sind in Tagebuch und `erledigt.md` vielfach verlinkt. Ein Plan, der komplett verworfen wird, wird gelöscht statt umbenannt — so geschehen mit dem ersten Anlauf für Schritt 17.

**Der Plan wird nach der Umsetzung nicht rückwirkend korrigiert.** Er ist ein historisches Dokument wie ein Tagebucheintrag. Was tatsächlich herauskam — samt Abweichungen vom Plan — steht im Tagebuch.

## Vorlage

Alle bisherigen Pläne folgen demselben Aufbau:

```markdown
# Ablaufplan Schritt N: <Titel>

Annahme zum Umfang: <Was dieser Schritt tut und was ausdrücklich nicht.>
Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**<Stichwort>**: <Entscheidung mit Begründung.>

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode
geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt
übergehen, jeweils mit der beschriebenen Prüfung.

## 1. <Erster Punkt>

<Auftrag.> <Prüfung: Typecheck, Test oder konkrete Beobachtung.>

## …

## N. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen. Anschließend
`docs/TODO.md` und das Tagebuch nachziehen.
```

Zwei Details, die sich bewährt haben:

- **Die Umfangs-Annahme oben mit der Bitte um Korrektur.** Zwischen Planen und Umsetzen liegen oft Tage; die Annahme macht sichtbar, wovon der Plan ausging.
- **Die Prüfung steht im Punkt selbst**, nicht gesammelt am Ende. Sonst wird sie verschoben, bis sie nichts mehr aussagt.

Welche Prüfung zu welcher Art Änderung passt, steht in [`test/teststrategie.md`](../test/teststrategie.md).
