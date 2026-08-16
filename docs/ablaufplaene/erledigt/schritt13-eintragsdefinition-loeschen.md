# Ablaufplan Schritt 13: Eintragsdefinition löschen

> **Abgeschlossen am 13.08.2026** (Commit `d45716b`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`TODO.md`](../../TODO.md) und [`erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Löschen einer `Eintragsdefinition` über das bestehende Bearbeiten-Formular in `EintraegePage`. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Löschen ohne Verwendungsprüfung erlaubt**, anders als bei `TeamMember` (Schritt 12). `Planeintrag` speichert bereits einen vollständigen Snapshot (`kuerzel`, `beginn`, `ende`, fünf Zeitfelder) unabhängig von der `Eintragsdefinition`, aus der er einmal erzeugt wurde — laut `datenmodell.md` („Kontrollierte Redundanz") ist das bewusst so, damit spätere Änderungen oder eben auch das Löschen der Stammdaten bereits gesetzte Planeinträge nicht verändern. Der Fremdschlüssel `eintragsdefinitionId` zeigt nach dem Löschen ins Leere, das hat aber keine fachliche Auswirkung: Nichts in der App liest darüber aktuell live nach.

**UI**: Löschen-Button im bestehenden `EintragsdefinitionForm`, nur im Bearbeiten-Modus, mit dem bestehenden `AlertDialog` aus Schritt 7 als Bestätigung — nach demselben Muster wie in Schritt 12 (`TeamMemberForm`) umgesetzt.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Repository-Funktion `deleteEintragsdefinition`

Ergänze in `src/main/db/eintragsdefinitionRepository.ts` `deleteEintragsdefinition(id: number, database: Db): void` — einfaches `DELETE FROM eintragsdefinitionen WHERE id = ?`, keine Verwendungsprüfung (siehe Design-Entscheidung oben).

## 2. IPC-Handler und Preload-API

Ergänze `eintragsdefinition:delete` sowie `api.eintragsdefinition.delete(id)` in Preload (inklusive Typ-Deklaration).

## 3. `EintragsdefinitionForm` um Löschen-Button erweitern

Ergänze einen „Löschen"-Button, nur sichtbar im Bearbeiten-Modus, mit `AlertDialog`-Bestätigung davor, nach demselben Muster wie `TeamMemberForm` in Schritt 12. Screenshot-Bestätigung: Button nur im Bearbeiten-Modus sichtbar, Bestätigungsdialog erscheint.

## 4. `EintraegePage` verdrahten

Nach erfolgreichem Löschen: Liste neu laden, Formular zurück in den Anlegen-Modus. Screenshot-Bestätigung: Eintragsdefinition löschen, verschwindet aus der Liste.

## 5. Repository-Test gegen In-Memory-SQLite

Prüfe, dass Löschen den Datensatz entfernt — auch dann, wenn er bereits in einem `Planeintrag` referenziert wurde (Testfall legt bewusst einen referenzierenden Planeintrag über `speicherePlanungsstand` an, löscht danach die zugrunde liegende Eintragsdefinition, und bestätigt, dass der Planeintrag selbst unverändert abrufbar bleibt, inklusive seines Snapshots).

## 6. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Eintragsdefinition anlegen, in einem Dienstplan verwenden, danach löschen — bestehender Planeintrag im Grid bleibt unverändert sichtbar (Screenshot). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
