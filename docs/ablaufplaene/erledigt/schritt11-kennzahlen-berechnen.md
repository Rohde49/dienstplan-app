# Ablaufplan Schritt 11: Berechnete Kennzahlen

> **Abgeschlossen am 13.08.2026** (Commit `caffece`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`../../TODO.md`](../../TODO.md) und [`../../erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Dieser Schritt implementiert die vollständige Berechnungslogik für alle 15 Kennzahlen aus [`architektur/auswertung.md`](../architektur/auswertung.md), verdrahtet davon aber zunächst nur die fünf Platzhalter, die bereits seit Schritt 6/8 in `PlanungsGrid.tsx` angelegt sind (SN/F-Dienste, Freie Tage, Δ Soll/Ist, Ist, Soll). Die übrigen zehn Zeilen (u. a. Nachtzuschläge, Anzahl Arbeitstage als eigene Anzeige, Anzahl Rufbereitschaften als eigene Anzeige) werden mitimplementiert und mitgetestet, aber noch nirgends angezeigt — sie sind für die separat geplante `AuswertungsPage` vorgesehen. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Berechnung in `shared/`, nicht im Main-Prozess**: Die Kennzahlen müssen live aus dem aktuellen, noch nicht gespeicherten Entwurf berechnet werden (siehe unten), den nur der Renderer kennt. Der Main-Prozess sieht ausschließlich den zuletzt gespeicherten Stand. Eine IPC-Berechnung würde entweder nicht live sein oder bei jeder Zellenänderung den kompletten Entwurf zum Main-Prozess schicken müssen — unnötiger Umweg für eine reine, zustandslose Berechnung. Stattdessen: plattformunabhängige, reine Funktionen in `shared/auswertung.ts` (wie `shared/kalendertage.ts` seit Schritt 7), die der Renderer synchron aufruft. Spätere Konsumenten (`AuswertungsPage`, verkürzte Ansicht, ggf. PDF-Export im Main-Prozess) importieren dieselben Funktionen, keine Duplizierung.

**„Freie Tage" hat eine eigene, einfachere Definition** als die Summe aus „Freie Samstage" und „Freie Sonntage und Feiertage": Es ist die Anzahl der `Planeintrag`-Datensätze eines `TeamMember` mit `kuerzel === '/'`, unabhängig vom Wochentag. „Freie Samstage" und „Freie Sonntage und Feiertage" bleiben als eigene, engere Zeilen bestehen (nur für die spätere `AuswertungsPage` sichtbar). `architektur/auswertung.md` wurde entsprechend bereits aktualisiert (die dort vorher offene Frage ist damit geklärt).

**Nur Erzieher bekommen echte Werte**: Für `TeamMember` mit `rolle !== 'Erzieher'` zeigen alle fünf Grid-Platzhalter den Text „n/A" statt eines berechneten Werts, passend zur in `auswertung.md` festgelegten Beschränkung der gesamten Auswertung auf Erzieher.

**Live aus dem Entwurf, nicht aus der Baseline**: Die Berechnung nutzt `planeintraegeEntwurf`/`rufbereitschaftEntwurf` (den aktuellen, ggf. ungespeicherten Stand), nicht die zuletzt gespeicherten Daten — Änderungen im Grid wirken sich sofort auf die Kennzahlen aus, auch vor „Speichern".

**Keine farbliche Hervorhebung von Δ Soll/Ist in diesem Schritt** (grün bei `0:00`, sonst abgesetzt, aus dem ursprünglichen Mockup) — bewusst für einen späteren Feinschliff zurückgestellt. Die textuelle Vorzeichen-Darstellung (`+`/`0:00`/`−`) aus `auswertung.md` gehört dagegen zur korrekten Anzeige des Werts selbst und ist Teil dieses Schritts.

**Rundungsregel vereinheitlichen**: Die in Schritt 8 für `mitarbeiterabhaengigeArbeitszeit.ts` gebaute Rundungsregel (exakte halbe Minute wird aufgerundet) wird jetzt an drei Stellen gebraucht (Soll-Arbeitszeit, Nachtzuschlag, Nachtbereitschaftszuschlag). Vor der eigentlichen Kennzahlen-Logik als eigenständige Hilfsfunktion nach `shared/` extrahieren, `mitarbeiterabhaengigeArbeitszeit.ts` darauf umstellen, statt die Rundung mehrfach zu implementieren.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Rundungshilfsfunktion vereinheitlichen

Extrahiere die Rundungsregel aus `mitarbeiterabhaengigeArbeitszeit.ts` (Schritt 8) als eigenständige reine Funktion `rundeAufVolleMinute(minuten: number): number` nach `shared/`. Stelle `mitarbeiterabhaengigeArbeitszeit.ts` auf diese Funktion um. Bestehende Tests müssen weiterhin grün bleiben, ergänze ggf. fehlende Tests direkt für `rundeAufVolleMinute` selbst.

## 2. Anzahl Arbeitstage im Monat

Reine Funktion `berechneArbeitstageFuerMonat(tage: Kalendertag[]): number` in `shared/auswertung.ts` (Zeile 12 aus `auswertung.md`: Montag bis Freitag, abzüglich gesetzlicher Feiertage auf diesen Wochentagen). Unabhängig vom Mitarbeiter. Unit-Tests inklusive eines Monats mit einem Feiertag auf einem Werktag.

## 3. Tagesbezogene Zählungen je Mitarbeiter

Beginne `berechneKennzahlenFuerMitarbeiter()` in `shared/auswertung.ts` mit den Zeilen, die durch Iteration über die Tage eines Mitarbeiters entstehen: Anzahl SN/F-Dienste (Zeile 1, `kuerzel === 'SN/F'`), Anzahl Freie Tage (eigene Definition, siehe oben), Anzahl Freie Samstage (Zeile 2), Anzahl Freie Sonntage und Feiertage (Zeile 3, ein Tag zählt einmal auch wenn beides zutrifft), gearbeitete Stunden an Sonntagen/Feiertagen (Zeile 4), Anzahl Rufbereitschaften (Zeile 11). Parameter: `teamMemberId`, `tage: Kalendertag[]`, `dienstplantage: Dienstplantag[]` (zur Zuordnung `datum` → `dienstplantagId`), `planeintraege: Record<string, PlaneintragSnapshot>`, `rufbereitschaften: Record<string, number>`. Unit-Tests je Zeile, inklusive des Sonntag-und-Feiertag-Dopplungsfalls.

## 4. Monatssummen und abgeleitete Werte

Ergänze die restlichen Zeilen: Arbeitszeit/Nachtbereitschaft/Arbeitszeit-ohne-Nachtbereitschaft/Nachtarbeit gesamt im Monat (Zeilen 5–8, Summen über die fünf Zeitfelder aus `PlaneintragSnapshot`), Nachtzuschlag 20 % und Nachtbereitschaftszuschlag 25 % (Zeilen 9–10, aus der vollen Monatssumme berechnet, erst danach gerundet über `rundeAufVolleMinute`), Ist-Arbeitszeit (Zeile 13, identisch zu Zeile 5), Soll-Arbeitszeit (Zeile 14, `berechneArbeitstageFuerMonat() × wochenarbeitszeitMinuten / 5`, gerundet), Differenz Soll/Ist (Zeile 15). `Kennzahlen`-Typ mit allen 15 Werten vervollständigen. Unit-Tests inklusive Gegenprobe des Beispiels aus `auswertung.md` (21 Arbeitstage × 39:00 / 5 = 163:48).

## 5. Formatierung Δ Soll/Ist mit Vorzeichen

Reine Funktion, die eine Minutendifferenz gemäß `auswertung.md` formatiert: positiv mit `+`, `0:00` bei exaktem Ausgleich, negativ mit `−`, auf Basis von `formatMinutesToHHMM` aus Schritt 4. Unit-Tests für alle drei Fälle.

## 6. `PlanungsGrid` verdrahten

Ersetze die fünf `–`-Platzhalter (drei Kopfzeilen je Mitarbeiter, zwei Fußzeilen) durch echte, per `useMemo` berechnete Werte aus `berechneKennzahlenFuerMitarbeiter()`, angewendet auf `planeintraegeEntwurf`/`rufbereitschaftEntwurf` (nicht auf eine Baseline). Nur für `rolle === 'Erzieher'`; andere Rollen zeigen „n/A" in allen fünf Zellen. Δ Soll/Ist über die Funktion aus Punkt 5 formatiert, keine Farb-Hervorhebung. Screenshot-Bestätigung: Werte erscheinen korrekt für Erzieher, „n/A" für andere Rollen, Änderung eines Planeintrags/einer Rufbereitschaft aktualisiert die Werte sofort ohne „Speichern".

## 7. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan mit mehreren Einträgen/Rufbereitschaften über verschiedene Erzieher und Rollen aufbauen, Kennzahlen im Grid mit einer manuellen Kontrollrechnung vergleichen, Live-Aktualisierung ohne Speichern bestätigen (Screenshot). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
