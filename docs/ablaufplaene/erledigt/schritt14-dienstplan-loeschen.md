# Ablaufplan Schritt 14: Dienstplan löschen

> **Abgeschlossen am 13.08.2026** (Commit `a349637`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`TODO.md`](../../TODO.md) und [`erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Löschen eines `Dienstplan` inklusive aller zugehörigen `Dienstplantag`-, `Planeintrag`- und `Rufbereitschaft`-Datensätze, ausschließlich über die bestehende Laden-Liste (`DienstplanLadenDialog`), nicht über einen Button im Kopfbereich der `PlanungsPage`. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Kaskadierende Löschung als explizite Transaktion**: Anders als bei `TeamMember`/`Eintragsdefinition` gibt es bei `Dienstplan` keine sinnvolle Teillöschung — ohne den `Dienstplan` sind seine `Dienstplantag`-Zeilen bedeutungslos, ohne die wiederum `Planeintrag`/`Rufbereitschaft`. Löschreihenfolge innerhalb einer `better-sqlite3`-Transaktion: erst `planeintraege`/`rufbereitschaften` (über die zugehörigen `dienstplantage`-IDs), dann `dienstplantage`, zuletzt `dienstplaene`. Keine `ON DELETE CASCADE`-Regeln im Schema nötig, das Schema bleibt unverändert.

**Löschen-Button pro Zeile im Laden-Dialog** (`DienstplanLadenDialog.tsx`), nicht im Kopfbereich der `PlanungsPage`. Da die gesamte Tabellenzeile bereits einen `onClick` zum Laden hat, muss der Löschen-Button `event.stopPropagation()` aufrufen, damit ein Klick auf „Löschen" nicht gleichzeitig den Dienstplan lädt.

**Bestätigung über den bestehenden `AlertDialog`**, Text nennt Titel/Monat/Jahr des betroffenen Dienstplans, keine Aufzählung der Anzahl betroffener Datensätze (siehe vorherige Klärungsrunde).

**Sonderfall: der gerade aktive Dienstplan wird gelöscht**: Der Laden-Dialog kann geöffnet werden, während in `PlanPage` bereits ein Dienstplan aktiv ist. Wird genau dieser über die Liste gelöscht, wechselt `PlanPage` danach automatisch zurück in den „kein Dienstplan aktiv"-Zustand (wie nach „Neu anlegen", ohne zusätzlichen Warnhinweis-Dialog — die Löschen-Bestätigung war bereits eine explizite Bestätigung). Sonst würde die Seite einen Dienstplan anzeigen, der nicht mehr existiert, und ein späteres „Speichern" liefe ins Leere.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Repository-Funktion `deleteDienstplan`

Ergänze in `dienstplanRepository.ts` `deleteDienstplan(id: number, database: Db): void` als `better-sqlite3`-Transaktion: `DELETE FROM planeintraege WHERE dienstplantagId IN (SELECT id FROM dienstplantage WHERE dienstplanId = @id)`, dieselbe Struktur für `rufbereitschaften`, danach `DELETE FROM dienstplantage WHERE dienstplanId = @id`, zuletzt `DELETE FROM dienstplaene WHERE id = @id`.

## 2. IPC-Handler und Preload-API

Ergänze `dienstplan:delete` sowie `api.dienstplan.delete(id)` in Preload (inklusive Typ-Deklaration).

## 3. `DienstplanLadenDialog` um Löschen-Button pro Zeile erweitern

Ergänze eine Löschen-Schaltfläche (Icon-Button) am rechten Rand jeder Tabellenzeile, mit `event.stopPropagation()` gegen das zeilenweite `onSelect`. Davor `AlertDialog`-Bestätigung mit Titel/Monat/Jahr im Text. Nach Löschen: Liste im Dialog neu laden (`dienstplan.list()` erneut aufrufen), Dialog bleibt offen. Screenshot-Bestätigung: Löschen-Button sichtbar pro Zeile, Klick darauf lädt nicht gleichzeitig den Dienstplan, Bestätigungsdialog erscheint mit korrektem Titel/Monat/Jahr.

## 4. `PlanPage` auf Löschen des aktiven Dienstplans reagieren lassen

Übergib `DienstplanLadenDialog` die `id` des aktuell aktiven Dienstplans (oder `null`). Wird genau diese `id` gelöscht, ruft `PlanPage` denselben Reset wie bei „Neu anlegen" auf (siehe Design-Entscheidung oben). Screenshot-Bestätigung: aktiven Dienstplan über den Laden-Dialog löschen, Seite fällt sichtbar in den Ausgangszustand zurück.

## 5. Repository-Test gegen In-Memory-SQLite

Lege zwei unabhängige Dienstpläne mit jeweils mehreren Planeinträgen und Rufbereitschaften an (über `createDienstplan`/`speicherePlanungsstand`), lösche einen davon, bestätige: alle zugehörigen `dienstplantage`/`planeintraege`/`rufbereitschaften`-Zeilen sind weg, der zweite Dienstplan samt seinen Daten bleibt vollständig unberührt.

## 6. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan mit mehreren Einträgen anlegen und speichern, über den Laden-Dialog löschen (einmal als aktiven, einmal als nicht-aktiven Dienstplan durchspielen), App neu starten, per „Laden" bestätigen, dass er wirklich weg ist (Screenshot). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
