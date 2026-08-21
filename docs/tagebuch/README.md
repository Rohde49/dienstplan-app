# Entwicklungstagebuch

Der **Verlauf** des Projekts: was wann gemacht wurde und warum, einschließlich der Wege, die verworfen wurden. Der aktuelle Stand steht dagegen in den Sachdateien unter [`../architektur/`](../architektur), [`../style/`](../style) und [`../test/`](../test), der Fortschritt in [`TODO.md`](../TODO.md).

## Ablage nach Kalenderwochen

Eine Datei je ISO-Kalenderwoche, benannt `JJJJ-kwNN.md`. Innerhalb einer Datei eine `## JJJJ-MM-TT`-Überschrift je Tag, darunter die Einträge in der Reihenfolge, in der sie entstanden sind.

Bisher fällt die gesamte Projektgeschichte in eine einzige Woche. Das Schema ist trotzdem so angelegt: Die ursprüngliche Einzeldatei war auf über 400 Zeilen gewachsen und damit faktisch nicht mehr navigierbar — wertvolle Begründungen waren darin nicht auffindbar. Die Aufteilung legt jetzt die Regel fest, statt später erneut zu entzerren.

## Wochenindex

| Woche                        | Zeitraum       | Kernentscheidungen                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [KW 33/2026](./2026-kw33.md) | 10.–16.08.2026 | Stack festgelegt (Electron statt Tauri, lokales SQLite); Schritte 1–16 umgesetzt; Farbschema dreimal revidiert; Design-System konsolidiert; Teststrategie von drei behaupteten auf fünf echte Ebenen ausgebaut; Schritt 17 zweimal geplant, erster Plan verworfen                                                                                                                                                                                                                 |
| [KW 34/2026](./2026-kw34.md) | 17.–23.08.2026 | Setup- und Konfigurationsprüfung vor Schritt 17: Datenbankstart abgesichert und Verdrahtung nach `index.ts` gezogen; `foreign_keys` eingeschaltet und Testdatenbank angeglichen; Migrationspfad angelegt; `sandbox: true` aktiviert und `window.electron` entfernt; `electron-builder.yml` vom Template auf das Projekt umgestellt; Fehleranzeige im Renderer eingeführt; CI-Workflow eingerichtet; Electron auf 43 gehoben und die Installer-Nutzlast von 58 auf 3,3 MB gebracht |

## Regeln

**Nicht rückwirkend korrigieren.** Ein Eintrag beschreibt den Stand zu seinem Zeitpunkt. Wird eine damalige Aussage später falsch, bleibt sie stehen und die Sachdatei wird korrigiert — sonst geht genau die Nachvollziehbarkeit verloren, für die das Tagebuch existiert.

Zwei Ausnahmen, weil sie den Inhalt nicht anfassen:

- **Format** darf vereinheitlicht werden (Überschriften, Aufzählungen).
- **Links** dürfen einer Dateiverschiebung nachgezogen werden. Zeigt ein Link auf etwas, das es nicht mehr gibt, wird er zu einem einfachen Codespan ohne Ziel — die Nennung bleibt lesbar, die Verlinkung verspricht nichts Falsches mehr.

**Was gehört ins Tagebuch statt in eine Sachdatei?** Alles, was ein Datum trägt: verworfene Alternativen, Reihenfolgen, Fehlschläge und ihre Ursachen, „warum wir es zweimal gemacht haben". Eine Sachdatei beschreibt den Zustand, das Tagebuch den Weg dorthin. Faustregel: Steht in einem Satz ein „inzwischen", „ursprünglich" oder „bis dahin", gehört er wahrscheinlich hierher.
