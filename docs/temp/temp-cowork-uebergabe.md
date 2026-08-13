# Temp: Kontext-Übergabe an einen neuen Cowork-Chat

Zweck: Der bisherige Cowork-Chat (Planung/Review-Rolle, nicht Umsetzung) ist inzwischen automatisch komprimiert worden und wurde durch einen neuen Chat im selben Cowork-Projekt abgelöst. Diese Datei hält den Arbeitsablauf und die noch offenen Anschlussfragen fest, die sich aus dem bisherigen Chat ergeben und die dort nicht schriftlich in `docs/` liegen. Kein Bestandteil der eigentlichen Projektdokumentation unter `docs/architektur/` oder `docs/ablaufplaene/` und nicht relevant für Claude-Code-Umsetzungs-Sessions — bitte nicht als Kontext für die Umsetzung heranziehen. Nach Bedarf löschen, sobald der neue Chat eingearbeitet ist.

## Rolle von Claude in diesem Cowork-Chat

Anders als Claude Code (separate Sitzung, setzt tatsächlich Code um): Dieser Chat plant, dokumentiert und prüft, schreibt aber selbst keinen Code. Konkret:

- Sich bei Bedarf mit `git log`/`git status`/`git diff` und den Dateien unter `docs/` mit dem tatsächlichen Projektstand vertraut machen, statt ihn zu vermuten.
- Neue Schritte gemeinsam mit dem Nutzer im Gespräch klären (siehe Ablauf unten), bevor irgendetwas geschrieben wird.
- Je Schritt einen Ablaufplan unter `docs/ablaufplaene/schrittN-thema.md` verfassen — für Claude Code gedacht, nicht selbst ausgeführt.
- `docs/TODO.md` (Checkliste je Schritt) und `docs/entwicklungstagebuch.md` (chronologischer Verlauf mit Begründungen) nach jeder Planungs- und jeder Umsetzungsrunde aktuell halten.
- Nach einer Rückmeldung wie „Claude Code hat den Ablaufplan durchgeführt": die Umsetzung eigenständig verifizieren (`git log`/`status`/`diff`, `npm run typecheck`/`lint`/`test` selbst laufen lassen, betroffene Quelldateien stichprobenartig lesen) und eine ehrliche, fachlich fundierte Rückmeldung geben — nicht nur die Checkboxen in `TODO.md` glauben, sondern wirklich nachprüfen. Abweichungen, bemerkenswerte Entscheidungen und Bedenken offen ansprechen.
- Bei fachlichen oder strategischen Entscheidungen ehrlich und kritisch Rückmeldung geben, nicht einfach zustimmen.
- Kommunikation durchgehend auf Deutsch.

## Etablierter Ablauf für einen neuen Schritt

1. Nutzer signalisiert Bereitschaft für den nächsten Schritt.
2. Claude stellt Klärungsfragen als nummerierte Liste (Scope, Darstellung, Zusammenspiel mit bestehenden Mustern).
3. Nutzer beantwortet, teils in mehreren Runden, wenn Antworten neue Rückfragen aufwerfen.
4. Sobald aus Claudes Sicht genug geklärt ist: kurze Rückmeldung, ob die Informationen für den Ablaufplan reichen, offene Kleinigkeiten benennen. **Bei komplexeren Schritten (z. B. mit Mockup) ausdrücklich auf das „Go" des Nutzers warten, bevor irgendetwas geschrieben wird** — das wurde für Schritt 16 explizit so verlangt und sollte als Standardverhalten übernommen werden, wann immer Unsicherheit besteht oder der Nutzer erkennbar noch etwas gegenprüfen will. Bei sehr klaren, kleinteiligen Antworten (wie bei den meisten Schritten 8–14) kann auch direkt weitergeschrieben werden.
5. Nach Freigabe: `docs/ablaufplaene/schrittN-thema.md` schreiben, `docs/TODO.md` um den neuen Abschnitt ergänzen (gleiche Checklisten-Struktur wie die Punkte im Ablaufplan), `docs/entwicklungstagebuch.md` um einen datierten Eintrag zur Planungsrunde ergänzen.
6. Format eines Ablaufplans: einleitender Absatz „Annahme zum Umfang" (mit Formulierung „Falls das nicht mehr stimmt, bitte vor dem Start korrigieren"), Abschnitt „Design-Entscheidungen" als Referenzblock, danach nummerierte Punkte. Jeder Punkt ist ein eigenständiger Claude-Code-Prompt, endet mit einer konkreten Prüfung (Typecheck/Lint/Test/Screenshot) und dem Hinweis, dass jeder Punkt einzeln im Plan Mode gegeben, freigegeben und erst danach umgesetzt wird.
7. Nach Rückmeldung „Claude Code hat umgesetzt": Verifikation wie oben beschrieben, danach `docs/TODO.md`/`docs/entwicklungstagebuch.md` final abgleichen (Claude Code aktualisiert diese meist schon selbst, aber gegenprüfen).

## Aktueller Stand (Stand dieses Chats, 13.08.2026)

- Schritt 1–15 vollständig umgesetzt und committet.
- **Schritt 16 (Verkürzte Ansicht) ist umgesetzt und von mir gegen den Ablaufplan geprüft** (Umschalter, `VerkuerzteAnsicht.tsx`, Zellinhalte, Ist-/Soll-Fußzeilen nur für Erzieher — inkl. der Korrektur, dass Nicht-Erzieher-Zellen leer bleiben statt „n/A" zu zeigen —, „Drucken"-Platzhalter). 

## Für Schritt 17 (PDF-Export/Druck-Funktion) bereits festgelegte Rahmenbedingungen

Aus der Schritt-16-Planungsrunde bereits verbindlich geklärt, sollte bei Schritt 17 nicht erneut zur Debatte stehen:

- Es gibt **einen** Button „Drucken" (aktuell deaktivierter Platzhalter in `PlanPage.tsx`, neben dem Planform-Umschalter), **keinen** separaten „Als PDF exportieren"-Button — der Nutzer hat das im Mockup gezeigte Zwei-Button-Layout bewusst abgelehnt. Vermutlich reicht der native Windows-Druckdialog, der „Als PDF speichern" ohnehin als Druckerziel anbietet.
- Der „Freigabe und Unterschrift"-Signaturblock aus dem ursprünglichen Mockup (Datum-/Unterschriftzeile unterhalb der Tabelle) ist explizit für diesen Schritt vorgesehen, nicht für Schritt 16.
- Grundlage für den Druck ist die in Schritt 16 gebaute `VerkuerzteAnsicht` (kompakte, rein lesende Darstellung), nicht `PlanungsGrid`.

