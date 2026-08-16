# Ablaufplan Schritt 15: AuswertungsPage

> **Abgeschlossen am 13.08.2026** (Commit `ff749d3`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`../../TODO.md`](../../TODO.md) und [`../../erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Trotz des Namens keine eigene Route, sondern ein Dialog-Overlay innerhalb der `PlanungsPage`, ausgelöst über den bestehenden, bisher deaktivierten „Auswertung"-Button im Kopfbereich. Zeigt die vollständige 15-Zeilen-Auswertung aus [`architektur/auswertung.md`](../architektur/auswertung.md), deren Berechnungslogik seit Schritt 11 vollständig als reine Funktionen in `shared/auswertung.ts` vorliegt, hier aber erstmals komplett angezeigt wird (`PlanungsGrid` nutzt bisher nur 5 der 15 Werte). Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Dialog statt eigener Route**: Die bestehende `Dialog`-Primitive aus Schritt 7 bringt den gewünschten Effekt (Hintergrund abgedunkelt/unscharf) bereits mit. Der Dialog öffnet sich zentriert über der `PlanungsPage`, `PlanungsGrid` bleibt im Hintergrund unverändert bestehen (kein Unmount, keine Änderung der Scroll-Position beim Öffnen/Schließen).

**Größe wächst mit dem Inhalt, bis zu einer Obergrenze**: Der Dialog soll möglichst die komplette Tabelle ohne internes Scrollen zeigen, darf dafür bis zu 70% der Fensterbreite/-höhe einnehmen (`max-w-[70vw] max-h-[70vh]`, zentriert). Erst wenn der Inhalt auch bei dieser Größe nicht passt (viele Erzieher als Spalten), bekommt die Tabelle selbst einen scrollbaren Container. Die erste Spalte (Zeilenbeschriftungen) bleibt dabei sticky links, analog zur Datum-Spalte in `PlanungsGrid`, damit sie beim horizontalen Scrollen sichtbar bleibt.

**Eigene Komponentendatei**: `components/AuswertungDialog.tsx`, fachspezifisch, analog zu `DienstplanLadenDialog.tsx`.

**Nur Erzieher als Spalten**, wie in `auswertung.md` „Darstellung" festgelegt — Praktikanten und Wirtschaftskräfte werden nicht aufgenommen (kein „n/A", sie fehlen hier komplett, anders als die fünf Platzhalter in `PlanungsGrid`).

**Live wie der Rest**: Berechnung aus dem aktuellen Entwurf (`planeintraegeEntwurf`/`rufbereitschaftEntwurf`), nicht aus der Baseline, konsistent mit Schritt 11. Der „Auswertung"-Button ist nur aktiv, wenn ein Dienstplan gerade geöffnet ist (analog zu „Speichern").

**Farbliche Hervorhebung von Δ Soll/Ist wird jetzt umgesetzt**, sowohl in der neuen Auswertungstabelle als auch rückwirkend in der bestehenden `PlanungsGrid`-Kopfzelle: grün bei exakt `0:00`, sonst farblich abgesetzt (passend zum ursprünglichen Mockup, das dafür einen eigenen Legenden-Eintrag „Soll-Ist-Abweichung" in Gelb/Orange zeigte). Kein dediziertes Erfolgs-/Warnfarben-Token im bestehenden Theme vorhanden (`styling.md` kennt nur `--primary`/`--accent`/`--ring` für UI-Chrome und `--destructive` für Fehler/Löschen). Vorschlag, im Plan Mode gegenzuprüfen: `0:00` über `--primary` (die App-Akzentfarbe ist ohnehin bereits Mint-Grün), Abweichung ungleich `0` über eine dezente, per `color-mix` abgeleitete Tönung, analog zum bestehenden Muster von `FEIERTAG_FARBE` in `PlanungsGrid.tsx`. Falls dafür ein neuer Farbansatz nötig ist, kurz in `styling.md` nachtragen.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Farbfunktion für Δ Soll/Ist

Reine Funktion (z. B. `src/renderer/src/lib/sollIstFarbe.ts`), die aus einer Minutendifferenz Tailwind-Klassen ableitet: eine Variante für exakt `0`, eine andere für alles ungleich `0` (siehe Design-Entscheidung oben). Unit-Tests für beide Fälle plus Vorzeichen-Symmetrie (positiv und negativ ungleich `0` liefern dieselbe „abgesetzt"-Klasse).

## 2. `AuswertungDialog.tsx`: Grundstruktur

Lege die neue Komponente an: `Dialog`/`DialogContent` mit `max-w-[70vw] max-h-[70vh]`, Titel „Auswertung", Tabelle mit den 15 Zeilenbeschriftungen aus `auswertung.md` (exakter Wortlaut) in der ersten, sticky-linken Spalte, einer Spalte je `TeamMember` mit `rolle === 'Erzieher'` (Farbe/Name als Kopfzeile, analog zu `PlanungsGrid`). Zunächst mit Platzhalterwerten „–" in allen Zellen, noch keine echte Berechnung. Props: `open`, `onOpenChange`, `members`, `tage`, `dienstplantage`, `planeintraegeEntwurf`, `rufbereitschaftEntwurf`. Screenshot-Bestätigung: Dialog öffnet sich zentriert, Größe/Scroll-Verhalten wie beschrieben, nur Erzieher als Spalten.

## 3. Echte Berechnung und Formatierung

Ersetze die Platzhalter durch `berechneKennzahlenFuerMitarbeiter()` je Erzieher (per `useMemo`), formatiert über `formatMinutesToHHMM` (Zeiten) bzw. direkte Zahl (Zählungen), Δ Soll/Ist über `formatiereSollIstDifferenz()` (aus Schritt 11) plus die Farbfunktion aus Punkt 1. „Anzahl Arbeitstage" (Zeile 12) ist für alle Erzieher gleich, einmal berechnen und wiederverwenden statt je Spalte neu. Screenshot-Bestätigung: Werte stimmen mit einer manuellen Kontrollrechnung überein.

## 4. `PlanungsGrid`: Δ Soll/Ist-Kopfzelle rückwirkend einfärben

Wende die Farbfunktion aus Punkt 1 auch auf die bestehende Δ Soll/Ist-Platzhalterzelle in `PlanungsGrid.tsx` an (aus Schritt 11). Screenshot-Bestätigung: Zelle zeigt die Farbe passend zum Wert.

## 5. `PlanPage` verdrahten

Aktiviere den „Auswertung"-Button (`disabled={aktiverDienstplan === null}`, analog zu „Speichern"), öffnet `AuswertungDialog` mit denselben Props wie `PlanungsGrid`. Bestätige, dass Öffnen/Schließen des Dialogs die Scroll-Position von `PlanungsGrid` nicht verändert. Screenshot-Bestätigung: Button deaktiviert ohne aktiven Dienstplan, öffnet den Dialog bei aktivem Dienstplan.

## 6. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan mit mehreren Erziehern, Planeinträgen und Rufbereitschaften aufbauen, Auswertungsdialog öffnen, alle 15 Werte gegen eine manuelle Kontrollrechnung prüfen, Farbgebung bei `0:00` und bei Abweichung vergleichen (Screenshot). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren), `docs/architektur/auswertung.md` (Hinweis zur bisher fehlenden Farbgebung entfernen/aktualisieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
