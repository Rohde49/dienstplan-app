# Umgang mit Claude Code

Kurzreferenz für die Arbeit an der Dienstplan-App. Quelle der Best Practices: [code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)

## Zu Beginn: CLAUDE.md anlegen

- Mit `/init` eine CLAUDE.md fürs Projekt generieren lassen
- Kurz halten: nur Befehle, Code-Style-Abweichungen und Workflow-Regeln, die Claude nicht selbst erraten kann
- Alles rauswerfen, was Claude auch durch Code-Lesen herausfinden würde
- Bei Problemen zuerst prüfen, ob die Datei zu lang geworden ist (dann gehen wichtige Regeln unter)

## Vor größeren Änderungen: Plan Mode

- Mit `Shift+Tab` aktivieren (Statuszeile zeigt „plan mode on")
- Claude liest und plant nur, ändert nichts
- Nach Freigabe erneut `Shift+Tab`, um die Umsetzung zu starten
- Bei kleinen, eindeutigen Änderungen (Tippfehler, eine Zeile) nicht nötig

## Aufträge konkret formulieren

- Datei/Bereich benennen, gewünschtes Verhalten beschreiben, ggf. auf bestehende Muster im Code verweisen
- Schlecht: "baue ein Kalenderwidget"
- Besser: "schau dir an, wie X implementiert ist, und baue nach diesem Muster ein Widget für Monat/Jahr-Auswahl"

## Wenn etwas schiefläuft

- `Esc`: Claude sofort stoppen, Kontext bleibt erhalten
- `Esc` zweimal oder `/rewind`: zu einem früheren Stand von Code und/oder Konversation zurückspringen
- Nach zwei erfolglosen Korrekturen am selben Problem: `/clear` und Auftrag neu, präziser formulieren, statt weiter zu flicken

## Kontext sauber halten

- `/clear` zwischen thematisch unabhängigen Aufgaben
- Voller/unaufgeräumter Kontext verschlechtert die Antwortqualität

## Sessions fortsetzen

- `claude --continue`: letzte Session fortsetzen
- `claude --resume`: aus einer Liste vorheriger Sessions wählen

## Ergebnisse überprüfbar machen

- Claude wo möglich eine Prüfmöglichkeit geben: Tests, TypeScript-Compiler, Screenshot-Vergleich der UI
- Ohne Prüfsignal merkt Claude selbst nicht, ob etwas kaputt ist
