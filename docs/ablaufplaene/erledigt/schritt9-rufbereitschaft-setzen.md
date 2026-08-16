# Ablaufplan Schritt 9: Rufbereitschaft – Setzen, Ändern und Entfernen

> **Abgeschlossen am 13.08.2026** (Commit `7af24c2`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`TODO.md`](../../TODO.md) und [`erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Dieser Schritt behandelt das Setzen, Ändern und Entfernen von `Rufbereitschaft`-Datensätzen in der Rufbereitschaft-Spalte der `PlanungsPage`, nach demselben Muster wie `Planeintrag` in Schritt 8. Die Bemerkung-Spalte und alle berechneten Kennzahlen sind weiterhin nicht Teil dieses Schritts, siehe `temp/temp-PlanungPage.md`. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Gleiches Muster wie Planeintrag, aber einfacher**: Popover-Interaktion, Entwurf/Baseline-Tracking und Persistenz ausschließlich über den bestehenden „Speichern"-Button — analog zu Schritt 8, dort im Detail begründet. Rufbereitschaft ist strukturell einfacher als Planeintrag: Es gibt nur eine Spalte (nicht eine je Mitarbeiter), und laut `datenmodell.md` höchstens eine Rufbereitschaft pro Kalendertag (`UNIQUE` auf `dienstplantagId` allein, nicht auf `dienstplantagId`+`teamMemberId` wie bei `planeintraege`). Der lokale Entwurf braucht deshalb keinen zusammengesetzten Schlüssel wie `planeintragSchluessel()`: `Record<string, number>`, Schlüssel = `dienstplantagId` als String, Wert = `teamMemberId`. Abwesenheit eines Schlüssels bedeutet „keine Rufbereitschaft an diesem Tag". Kein Snapshot-Objekt nötig (anders als bei `Planeintrag`), da `Rufbereitschaft` außer den beiden Fremdschlüsseln keine eigenen Felder hat.

**Popover-Trigger unproblematisch**: Die Rufbereitschaft-Spalte ist bereits eine einzelne `<td>`-Zelle je Tag (kein Drei-Spalten-Konstrukt wie Eintrag/Beginn/Ende), der in Schritt 8 nötige Workaround mit nur einem echten Radix-Trigger unter mehreren Zellen entfällt hier.

**Auswahl gefiltert auf Erzieher**: Die Popover-Liste zeigt nur `TeamMember` mit `rolle === 'Erzieher'` (fachliche Regel aus `datenmodell.md`), lädt die Daten über die bereits bestehende `team.list()`-API (Schritt 4), keine neue IPC-Schnittstelle dafür nötig. „Keine Rufbereitschaft" als oberster Listeneintrag, analog zu „Kein Eintrag" bei `EintragsdefinitionAuswahl` aus Schritt 8. Auswahlliste zeigt Vor- und Nachname (zur eindeutigen Unterscheidung bei gleichen Nachnamen), die Zelle selbst nach dem Setzen nur den Nachnamen (Platzgründe, laut Nutzervorgabe).

**Persistenz**: `speicherePlanungsstand()` aus `dienstplanRepository.ts` (Schritt 8) wird um einen weiteren Parameter `rufbereitschaftAenderungen: RufbereitschaftAenderung[]` erweitert, verarbeitet in derselben Transaktion wie Titel und Planeintrag-Änderungen (gleiches Delete-dann-Insert-Prinzip je Tag). `RufbereitschaftAenderung` analog zu `PlaneintragAenderung`: `{ dienstplantagId: number; teamMemberId: number | null }` (`null` = entfernen).

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. `Rufbereitschaft`-Typ in `shared/types.ts`

Ergänze das Interface exakt wie in `datenmodell.md` festgelegt (`id`, `dienstplantagId`, `teamMemberId`). Prüfe mit `npm run typecheck`.

## 2. Repository-Funktionssignaturen mit Testdaten

Lege `src/main/db/rufbereitschaftRepository.ts` an mit `getRufbereitschaftenFuerDienstplan(dienstplanId: number, database): Rufbereitschaft[]` (Join über `dienstplantage`, analog zu `getPlaneintraegeFuerDienstplan` in `planeintragRepository.ts`). Zunächst mit Testdaten im Speicher.

## 3. `speicherePlanungsstand` um Rufbereitschaft erweitern

Erweitere die Funktion in `dienstplanRepository.ts` um den Parameter `rufbereitschaftAenderungen: RufbereitschaftAenderung[]`, verarbeitet in derselben Transaktion (Delete auf `dienstplantagId` allein, danach Insert falls `teamMemberId !== null`). Rückgabewert um `rufbereitschaften: Rufbereitschaft[]` ergänzen (über `getRufbereitschaftenFuerDienstplan` nach dem Speichern). Weiterhin mit Testdaten, noch kein SQL für `rufbereitschaften`.

## 4. IPC-Handler und Preload-API

Ergänze `rufbereitschaft:listFuerDienstplan`. Passe den bestehenden `dienstplan:speichernPlanungsstand`-Kanal (Schritt 8) an die neue Signatur an, inklusive Preload-Methode und Typ-Deklaration.

## 5. `RufbereitschaftAuswahl`-Komponente

Baue sie analog zu `components/EintragsdefinitionAuswahl.tsx`: lädt `team.list()`, filtert auf `rolle === 'Erzieher'`, zeigt Vor- und Nachname je Zeile, „Keine Rufbereitschaft" oben. Noch keine Anbindung ans Grid. Screenshot-Bestätigung: Popover-Inhalt zeigt nur Erzieher, korrekt formatiert.

## 6. Rufbereitschaft-Spalte im Grid anbinden, lokaler Entwurf

Verbinde die Rufbereitschaft-Zelle in `PlanungsGrid` mit einem Popover, das `RufbereitschaftAuswahl` zeigt (nur klickbar, wenn ein Dienstplan aktiv ist). Führe in `PlanPage` `rufbereitschaftEntwurf`/`rufbereitschaftBaseline` als `Record<string, number>` ein (Schlüssel `dienstplantagId`), zugehöriges `veraenderteRufbereitschaftZellen`-Set analog zum bestehenden `veraenderteZellen` für Planeinträge. `gibtUngespeicherteAenderung` um diesen neuen Vergleich erweitern. Zellen mit abweichendem Entwurf bekommen denselben dezenten Punkt-Indikator wie bei Planeintrag-Zellen. Screenshot-Bestätigung: Rufbereitschaft setzen, ändern, über „Keine Rufbereitschaft" entfernen, Indikator erscheint/verschwindet korrekt, Warnhinweis greift auch bei offenen Rufbereitschaft-Änderungen.

## 7. Laden erweitert Rufbereitschaften in die Baseline

Beim Laden eines Dienstplans zusätzlich `rufbereitschaft:listFuerDienstplan` aufrufen (im bestehenden `Promise.all` aus `handleDienstplanAuswaehlen` ergänzen) und als Baseline übernehmen. Screenshot-Bestätigung: Dienstplan mit zuvor gesetzten Rufbereitschaften laden, Grid zeigt sie korrekt an.

## 8. „Speichern" um Rufbereitschaft-Änderungen erweitern

`handleSpeichern` ruft die erweiterte `speichernPlanungsstand`-API mit den zusätzlichen Rufbereitschaft-Änderungen auf. Nach Erfolg: Baseline aktualisieren, Indikatoren verschwinden. Screenshot-Bestätigung: Rufbereitschaften setzen, speichern, Indikatoren weg, App neu starten, per „Laden" wiederfinden.

## 9. Echte SQLite-Anbindung

Tabelle `rufbereitschaften` anlegen (`id`, `dienstplantagId` als Fremdschlüssel auf `dienstplantage.id` mit `UNIQUE`-Constraint allein auf dieser Spalte, `teamMemberId`). Repository-Funktionen aus Punkt 2/3 auf echtes SQL umstellen. DB-Verbindung als Parameter, nicht global importieren. Testdaten entfernen.

## 10. Repository-Tests gegen In-Memory-SQLite

Tests für `getRufbereitschaftenFuerDienstplan` und die erweiterte `speicherePlanungsstand`-Funktion: Neuanlage, Ersetzen (andere Person am selben Tag), Entfernen, gemeinsames Speichern von Titel-, Planeintrag- und Rufbereitschaft-Änderungen in einem Aufruf, `UNIQUE`-Constraint auf `dienstplantagId` greift (kein zweiter Datensatz für denselben Tag möglich).

## 11. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan erstellen, mehrere Rufbereitschaften setzen, eine ändern, eine entfernen, zusammen mit Planeintrag-Änderungen speichern, App neu starten, per „Laden" bestätigen (Screenshot vorher/nachher). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
