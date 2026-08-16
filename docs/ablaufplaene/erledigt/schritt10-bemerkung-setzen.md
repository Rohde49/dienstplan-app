# Ablaufplan Schritt 10: Bemerkung – Setzen und Bearbeiten

> **Abgeschlossen am 13.08.2026** (Commit `74d2ab8`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`../../TODO.md`](../../TODO.md) und [`../../erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Dieser Schritt behandelt das Setzen und Ändern von `Dienstplantag.bemerkung` in der Bemerkung-Spalte der `PlanungsPage`. Danach sind aus dem ursprünglichen Fahrplan für die Planungsansicht nur noch die berechneten Kennzahlen offen (eigener, separat geplanter Ablaufplan), siehe `docs/TODO.md`. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Kein Popover, direktes Inline-Textfeld**: Anders als bei Planeintrag/Rufbereitschaft (Schritt 8/9) klickt der Nutzer nicht auf die Zelle, um ein Popover zu öffnen, sondern die Bemerkung-Zelle selbst ist ein Eingabefeld, in das direkt getippt wird. Maximal 40 Zeichen, clientseitig über `maxLength` durchgesetzt.

**Keine neue Entität, keine neue Tabelle**: `bemerkung` ist ein Feld auf `Dienstplantag`, die Zeilen existieren bereits seit dem Erstellen des Dienstplans (Schritt 7). Es wird nichts eingefügt oder gelöscht wie bei `Planeintrag`/`Rufbereitschaft`, nur ein `UPDATE` auf bereits vorhandene `dienstplantage`-Zeilen.

**Keine neue Lade-Logik nötig**: Der bestehende `dienstplantage`-State in `PlanPage` (aus Schritt 7, wird beim Erstellen/Laden ohnehin befüllt) enthält `bemerkung` bereits vollständig — anders als bei Planeintrag/Rufbereitschaft gibt es hier keinen separaten Ladevorgang zu ergänzen, die Baseline ergibt sich direkt aus diesem bestehenden State.

**Leeres Feld wird als `null` gespeichert**, nicht als leerer String, passend zum nullable Typ in `datenmodell.md` und konsistent zu „keine Bemerkung" als Zustand.

**Persistenz analog zum Rest**: Wie bei Titel/Planeintrag/Rufbereitschaft ändert Tippen zunächst nur lokalen Entwurfs-State, persistiert wird ausschließlich über den bestehenden „Speichern"-Button (`speicherePlanungsstand()` aus `dienstplanRepository.ts` wird um einen weiteren Parameter erweitert). Der bestehende Punkt-Indikator für ungespeicherte Zellen gilt auch hier, `gibtUngespeicherteAenderung` wird entsprechend erweitert.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Validierung der Bemerkung-Länge

Lege eine kleine, wiederverwendbare Konstante (z. B. `MAX_BEMERKUNG_LAENGE = 40` in `src/renderer/src/lib/`) sowie eine reine Funktion an, die einen String gegen diese Grenze prüft und bei Überschreitung eine Fehlermeldung zurückgibt. Unit-Tests inklusive Grenzfall (genau 40 Zeichen gültig, 41 ungültig, leerer String gültig).

## 2. `speicherePlanungsstand` um Bemerkung-Änderungen erweitern

Erweitere die Funktion in `dienstplanRepository.ts` um einen Parameter `bemerkungAenderungen: { dienstplantagId: number; bemerkung: string | null }[]`. Rückgabewert um die aktualisierten `dienstplantage: Dienstplantag[]` ergänzen (der Aufrufer braucht eine frische Baseline, ohne die Tage komplett neu zu laden). Zunächst mit Testdaten/In-Memory-Verarbeitung, analog zum in Schritt 8/9 etablierten Hybrid-Vorgehen (die übrigen Teile der Funktion sind bereits echtes SQL).

## 3. IPC-Handler und Preload-API

Passe den bestehenden `dienstplan:speichernPlanungsstand`-Kanal an die neue Signatur an, inklusive Preload-Methode und Typ-Deklaration.

## 4. Bemerkung-Zelle als Inline-Textfeld

Ersetze die bisher leere Bemerkung-Zelle in `PlanungsGrid` durch ein Eingabefeld (`maxLength={40}`), nur editierbar, wenn ein Dienstplan aktiv ist. Kein Popover, keine separate Trigger-Logik.

## 5. Lokaler Entwurf und ungespeichert-Indikator

Führe in `PlanPage` `bemerkungEntwurf: Record<string, string>` ein (Schlüssel `dienstplantagId`), initialisiert/zurückgesetzt aus dem bestehenden `dienstplantage`-State (dient als Baseline, kein separater Bemerkung-Baseline-State nötig). `veraenderteBemerkungZellen` per Vergleich mit `dienstplantage`, `gibtUngespeicherteAenderung` entsprechend erweitern. Zellen mit abweichendem Entwurf bekommen denselben Punkt-Indikator wie die anderen beiden Spalten. Screenshot-Bestätigung: Bemerkung eintippen, Indikator erscheint, über 40 Zeichen nicht weiter eingebbar.

## 6. „Speichern" um Bemerkung-Änderungen erweitern

`handleSpeichern` ruft die erweiterte `speichernPlanungsstand`-API mit den zusätzlichen Bemerkung-Änderungen auf, aktualisiert nach Erfolg den `dienstplantage`-State mit dem Rückgabewert (Baseline und Anzeige in einem). Screenshot-Bestätigung: Bemerkung setzen, speichern, Indikator weg, App neu starten, per „Laden" wiederfinden.

## 7. Echte SQLite-Anbindung

Ersetze die Testdaten-Verarbeitung aus Punkt 2 durch echtes SQL (`UPDATE dienstplantage SET bemerkung = @bemerkung WHERE id = @id`) innerhalb der bestehenden Transaktion von `speicherePlanungsstand()`.

## 8. Repository-Tests gegen In-Memory-SQLite

Tests für die erweiterte `speicherePlanungsstand`-Funktion: Bemerkung setzen, ändern, auf leer zurücksetzen (landet als `null` in der Datenbank, nicht als leerer String), gemeinsames Speichern mit Titel-, Planeintrag- und Rufbereitschaft-Änderungen in einem Aufruf, unveränderte Tage bleiben unangetastet.

## 9. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan erstellen, mehrere Bemerkungen setzen, eine ändern, eine leeren, zusammen mit anderen Änderungen speichern, App neu starten, per „Laden" bestätigen (Screenshot vorher/nachher). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
