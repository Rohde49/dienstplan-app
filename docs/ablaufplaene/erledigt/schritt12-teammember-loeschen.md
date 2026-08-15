# Ablaufplan Schritt 12: TeamMember löschen

Annahme zum Umfang: Löschen eines `TeamMember` über das bestehende Bearbeiten-Formular in `TeamPage`. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Löschen wird blockiert, wenn der Mitarbeiter bereits verwendet wird**: Existiert mindestens ein `Planeintrag` oder eine `Rufbereitschaft` mit dieser `teamMemberId`, wird nicht gelöscht. Begründung: Ein Dienstplan dokumentiert vergangene Zustände, kaskadierendes Mitlöschen historischer Einträge oder ein Löschen mit hängendem Fremdschlüssel (der den Mitarbeiter im Grid unsichtbar machen würde, da `PlanungsGrid` seine Spalten aus `team.list()` bezieht) sind beide unerwünscht. Aktuell gibt es weder `PRAGMA foreign_keys` noch `ON DELETE`-Regeln im Schema, die Prüfung muss also explizit im Anwendungscode passieren.

**Kein geworfener Fehler über IPC**: Die Repository-Funktion gibt ein Ergebnisobjekt zurück (`{ geloescht: boolean; grund?: string }`) statt einen Fehler zu werfen, damit die UI kontrolliert reagieren kann, ohne eine abgelehnte Promise behandeln zu müssen.

**UI**: Löschen-Button im bestehenden `TeamMemberForm`, nur sichtbar im `mode: 'edit'`. Bestätigung über den bestehenden `AlertDialog`-Baustein aus Schritt 7 (kein zusätzlicher Text zur Anzahl betroffener Datensätze nötig). Wird das Löschen vom Repository abgelehnt, erscheint der Grund im bereits vorhandenen Fehlerbereich des Formulars (`errors: string[]`).

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Repository-Funktion `deleteTeamMember`

Ergänze in `src/main/db/teamRepository.ts` `deleteTeamMember(id: number, database: Db): { geloescht: boolean; grund?: string }`. Prüft per `SELECT EXISTS(...)`-Abfragen gegen `planeintraege` und `rufbereitschaften` (Spalte `teamMemberId`), ob der Mitarbeiter verwendet wird. Falls ja: `{ geloescht: false, grund: '...' }` (verständliche Meldung), kein `DELETE`. Falls nein: `DELETE FROM team_members WHERE id = ?`, `{ geloescht: true }`.

## 2. IPC-Handler und Preload-API

Ergänze `team:delete` in `teamHandlers.ts` sowie `api.team.delete(id)` in Preload (inklusive Typ-Deklaration).

## 3. `TeamMemberForm` um Löschen-Button erweitern

Ergänze einen „Löschen"-Button, nur sichtbar bei `mode === 'edit'`, mit `AlertDialog`-Bestätigung davor. Bei Ablehnung durch das Repository (`geloescht: false`) den `grund` im bestehenden `errors`-Bereich anzeigen, Formular bleibt offen. Screenshot-Bestätigung: Button nur im Bearbeiten-Modus sichtbar, Bestätigungsdialog erscheint.

## 4. `TeamPage` verdrahten

Nach erfolgreichem Löschen: Liste neu laden, Formular zurück in den Anlegen-Modus. Screenshot-Bestätigung: unbenutzten Mitarbeiter löschen, verschwindet aus der Liste; Löschversuch bei einem bereits verwendeten Mitarbeiter zeigt die Fehlermeldung und löscht nicht.

## 5. Repository-Tests gegen In-Memory-SQLite

Drei Fälle: erfolgreiches Löschen eines unbenutzten Mitarbeiters, blockiertes Löschen bei vorhandenem `Planeintrag`, blockiertes Löschen bei vorhandener `Rufbereitschaft`. Baue die Testdaten über die bestehenden Repository-Funktionen auf (`createDienstplan`/`speicherePlanungsstand`), nicht über rohe Inserts, analog zum in Schritt 8/9 etablierten Vorgehen.

## 6. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: unbenutzten Mitarbeiter löschen (verschwindet), Löschversuch bei einem in einem Dienstplan verwendeten Mitarbeiter zeigt die Fehlermeldung (Screenshot). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
