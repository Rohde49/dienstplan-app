# Ablaufplan Schritt 16: Verkürzte Ansicht

> **Abgeschlossen am 14.08.2026** (Commit `65092dc`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`TODO.md`](../../TODO.md) und [`erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Aktiviert den bestehenden, bisher deaktivierten Planform-Umschalter „Planung"/„Druckvorschau" im Kopfbereich der `PlanungsPage` und ergänzt dafür eine neue, rein lesende Komponente mit einer kompakten Darstellung des Dienstplans (eine Spalte je Mitarbeiter statt drei Unterspalten). Kein PDF-Export, kein Windows-Druckdialog in diesem Schritt — das ist ein eigener, späterer Schritt (siehe `TODO.md`, „Geplante nächste Schritte"). Hier entsteht lediglich ein deaktivierter Platzhalter-Button „Drucken". Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Bestehende Toggle-Beschriftung bleibt**: „Planung"/„Druckvorschau", nicht die im Mockup gezeigten Beschriftungen „Vollständige Planform"/„Verkürzte Form".

**Eigene Komponente, rein lesend**: `components/layout/VerkuerzteAnsicht.tsx`, analog zu `PlanungsGrid.tsx` (gleiches Grid-/Scroll-/Sticky-Muster: `table-fixed`, `<colgroup>`, sticky Kopf und sticky Datum-Spalte, Wochenende-/Feiertag-Zeilenfärbung über `WOCHENENDE_FARBE`/`FEIERTAG_FARBE`), aber ohne Popover, ohne Input, ohne `onChange`-Handler. Zeigt **alle** `TeamMember` (nicht nur Erzieher, anders als `AuswertungDialog`).

**Eine Spalte je Mitarbeiter statt drei Unterspalten**: Kopfzeile zweizeilig — obere Zeile `TeamMember.wochenarbeitszeitMinuten` (formatiert über `formatMinutesToHHMM`), untere Zeile Name mit `member.farbe` als Hintergrund (wie die Namenszeile in `PlanungsGrid`). Die drei Kennzahlen-Kopfzellen aus `PlanungsGrid` (SN/F-Dienste, Freie Tage, Δ Soll/Ist) entfallen hier vollständig, ersetzt durch die Wochenarbeitszeit.

**Zellinhalt direkt aus dem `Planeintrag`-Snapshot**: Angezeigt wird `kuerzel`, zusätzlich `beginn–ende` in derselben Zelle, wenn beide gesetzt sind. Kein Rückgriff auf `Eintragsdefinition.berechnungsart` nötig — laut `datenmodell.md` haben mitarbeiterabhängige Einträge auf dem `Planeintrag` ohnehin `beginn`/`ende` = `null`, die Unterscheidung „mit Zeit" vs. „nur Kürzel" ergibt sich also direkt aus den beiden Snapshot-Feldern. Leere Zelle bei keinem Eintrag.

**Rufbereitschaft-/Bemerkung-Spalten bleiben erhalten**, rein lesend: Rufbereitschaft zeigt `teamMember.name` (wie in `PlanungsGrid`), Bemerkung zeigt den reinen Text statt eines `Input`.

**Fußzeilen Ist-/Soll-Arbeitszeit nur für Erzieher**: Wie in `PlanungsGrid` und `AuswertungDialog` werden `berechneKennzahlenFuerMitarbeiter()`-Werte nur für `TeamMember` mit `rolle === 'Erzieher'` berechnet. Praktikanten und Wirtschaftskräfte bleiben in beiden Fußzeilen leer, obwohl sie als eigene Spalte im übrigen Grid sichtbar sind (sie haben Planeinträge/Rufbereitschaft, aber kein Soll/Ist). Eine Spalte je Mitarbeiter (nicht `colSpan={3}` wie in `PlanungsGrid`).

**Live wie der Rest der Planungsansicht**: Berechnung/Anzeige aus dem aktuellen Entwurf (`planeintraegeEntwurf`, `rufbereitschaftEntwurf`, `bemerkungEntwurf`), nicht aus der Baseline, konsistent mit `PlanungsGrid` und `AuswertungDialog`.

**„Drucken"-Button als deaktivierter Platzhalter**: Ein einzelner Button mit Icon (`Printer` aus `lucide-react`) und Text „Drucken", `disabled`, kein zweiter Button für PDF-Export (abweichend vom Mockup). Platzierung im Kopfbereich neben dem Planform-Umschalter.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Planform-Umschalter aktivieren

Ergänze in `PlanPage.tsx` einen State `ansicht: 'planung' | 'druckvorschau'` (Default `'planung'`). Entferne `disabled`/`cursor-not-allowed` von den beiden bestehenden Toggle-Buttons, verdrahte `onClick` (setzt `ansicht`) und `aria-pressed` dynamisch entsprechend dem aktuellen Wert. Rendere `PlanungsGrid` nur bei `ansicht === 'planung'`, an der gleichen Stelle bei `ansicht === 'druckvorschau'` zunächst weiterhin `PlanungsGrid` (die neue Komponente folgt in Punkt 2) — so lässt sich das Umschalten selbst schon isoliert prüfen. Screenshot-Bestätigung: Klick auf „Druckvorschau" markiert den Button als aktiv (`aria-pressed`, visuelle Hervorhebung analog zum bisherigen „Planung"-Button), Klick zurück auf „Planung" funktioniert ebenso, keine der Entwurfsdaten geht beim Umschalten verloren.

## 2. `VerkuerzteAnsicht.tsx`: Grundstruktur

Lege die neue Komponente an mit Platzhalterwerten in den Zellen, noch ohne echte Daten: Tabellen-Grundgerüst mit Datum-Spalte (sticky links, wie `PlanungsGrid`), einer Spalte je `TeamMember` (alle Rollen) mit zweizeiliger Kopfzeile (Wochenarbeitszeit oben, Name unten mit `member.farbe`-Hintergrund), Rufbereitschaft- und Bemerkung-Spalte, sticky Kopfzeile, Wochenende-/Feiertag-Zeilenfärbung. Props zunächst: `members`, `tage`, `dienstplantage`. Verdrahte in `PlanPage.tsx` bei `ansicht === 'druckvorschau'`. Screenshot-Bestätigung: Struktur sichtbar, ein schmales Spaltenraster je Mitarbeiter (deutlich schmaler als `PlanungsGrid`), sticky Verhalten beim Scrollen wie gewohnt.

## 3. Echte Zellinhalte aus dem Entwurf

Ergänze Props `planeintraegeEntwurf`, `rufbereitschaftEntwurf`, `bemerkungEntwurf`. Planeintrag-Zelle zeigt `kuerzel`, plus `beginn–ende` in derselben Zelle, wenn beide gesetzt sind (siehe Design-Entscheidung oben), sonst leere Zelle. Rufbereitschaft-Zelle zeigt `teamMember.name`, sonst leer. Bemerkung-Zelle zeigt den reinen Text. Keine Popover, keine Inputs, keine Klick-Handler. Screenshot-Bestätigung: Ein Dienstplan mit mehreren gesetzten Planeinträgen (mind. ein fester Dienst mit Zeit, ein mitarbeiterabhängiger Eintrag ohne Zeit), einer Rufbereitschaft und einer Bemerkung zeigt in der Druckvorschau exakt dieselben Werte wie in der Planungsansicht, nur im kompakten Format.

## 4. Fußzeilen Ist-/Soll-Arbeitszeit

Ergänze zwei Fußzeilen analog zu `PlanungsGrid`, mit einer Spalte je Mitarbeiter (nicht `colSpan={3}`), aber weiterhin nur für `TeamMember` mit `rolle === 'Erzieher'` berechnet über `berechneKennzahlenFuerMitarbeiter()` (siehe Design-Entscheidung oben). Praktikanten/Wirtschaftskräfte bleiben in beiden Fußzeilen leer. Screenshot-Bestätigung: Werte stimmen für Erzieher mit den entsprechenden Fußzeilen in `PlanungsGrid` überein, Praktikanten-/Wirtschaftskraft-Spalten bleiben in beiden Fußzeilen leer.

## 5. „Drucken"-Platzhalter-Button

Ergänze im Kopfbereich von `PlanPage.tsx` einen deaktivierten Button mit `Printer`-Icon und Text „Drucken", platziert neben dem Planform-Umschalter. Keine Funktion in diesem Schritt. Screenshot-Bestätigung: Button sichtbar und erkennbar deaktiviert, unabhängig von `ansicht`.

## 6. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan mit mehreren Mitarbeitenden unterschiedlicher Rollen, festen und mitarbeiterabhängigen Planeinträgen, Rufbereitschaften und Bemerkungen aufbauen, zwischen „Planung" und „Druckvorschau" mehrfach hin- und herschalten (Screenshot-Serie), Inhalte gegen die Planungsansicht abgleichen. Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren, aus „Geplante nächste Schritte" entfernen) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
