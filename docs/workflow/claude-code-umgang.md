# Umgang mit Claude Code

Kurzreferenz für die **Bedienung**. Wie das Projekt für Claude Code eingerichtet ist und was daran noch fehlt, steht in [`setup-empfehlungen.md`](./setup-empfehlungen.md); die Regeln für die Doku-Pflege in [`doku-pflege.md`](./doku-pflege.md).

Quelle der Best Practices: [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)

## Die vier wichtigsten Handgriffe

| Situation                            | Handgriff                                                               |
| ------------------------------------ | ----------------------------------------------------------------------- |
| Vor einer größeren Änderung          | `Shift+Tab` → Plan Mode: Claude liest und plant, ändert nichts          |
| Claude läuft in die falsche Richtung | `Esc` stoppt sofort, der Kontext bleibt erhalten                        |
| Zweimal erfolglos korrigiert         | `/clear`, dann den Auftrag präziser neu formulieren statt weiterflicken |
| Neues, unabhängiges Thema            | `/clear` — voller Kontext verschlechtert die Antwortqualität            |

## CLAUDE.md

- Mit `/init` erzeugen, danach kurz halten: nur Befehle, Abweichungen vom Erwartbaren und Workflow-Regeln.
- Alles rauswerfen, was Claude durch Code-Lesen selbst herausfindet.
- Bei Problemen zuerst prüfen, ob die Datei zu lang geworden ist — dann gehen die wichtigen Regeln unter.
- Details gehören nach `docs/`, `CLAUDE.md` verweist nur darauf. Dieses Muster ist im Projekt bereits angelegt.

## Aufträge konkret formulieren

Datei oder Bereich benennen, gewünschtes Verhalten beschreiben, auf ein bestehendes Muster im Code verweisen.

- Schlecht: „baue ein Kalenderwidget"
- Besser: „schau dir an, wie `PlanungsGrid` aufgebaut ist, und baue nach diesem Muster ein Widget für die Monat/Jahr-Auswahl"

## Zurückspringen

- `Esc` einmal: stoppen, Kontext bleibt.
- `Esc` zweimal oder `/rewind`: zu einem früheren Stand von Code und/oder Konversation zurück.
- `claude --continue`: letzte Session fortsetzen. `claude --resume`: aus einer Liste wählen.

## Ergebnisse überprüfbar machen

**Ohne Prüfsignal merkt Claude selbst nicht, ob etwas kaputt ist.** Die verfügbaren Signale sind `npm run typecheck`, `npm run lint`, `npm run test` und `npm run test:e2e` — welche Ebene für welche Frage zuständig ist, steht in [`../test/teststrategie.md`](../test/teststrategie.md).

**Ein Screenshot gehört nicht dazu.** Er ist Sichtprüfung: Er zeigt einmalig, dass etwas aussieht wie erwartet, und meldet danach nie wieder etwas. Für eine neue Fehlerklasse gehört ein echter Test her, und der wird einmal absichtlich rot gemacht, bevor man ihm glaubt (siehe [`../test/testpraxis.md`](../test/testpraxis.md), Abschnitt „Gegenproben").
