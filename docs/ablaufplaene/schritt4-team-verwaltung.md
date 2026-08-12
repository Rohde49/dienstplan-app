# Ablaufplan Schritt 4: Team-Verwaltung

Voraussetzung erfüllt: Schritt 3 (Router, Startseite, Platzhalter-Route `/team`) ist abgeschlossen (siehe `TODO.md`, Commits `9327ddf`/`ebcee6d`). Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen. Reihenfolge folgt [`architektur/projektstruktur.md`](../architektur/projektstruktur.md) (Entität → Repository-Signaturen mit Testdaten → UI → echte SQLite-Anbindung) und ergänzt zusätzlich die in [`architektur/teststrategie.md`](../architektur/teststrategie.md) vorgesehene, aber noch nicht eingerichtete Testinfrastruktur.

Hinweis zur Farbgebung: Das Theme wurde nach der ursprünglichen Planung von neutral auf Mint-Grün umgestellt (siehe [`architektur/styling.md`](../architektur/styling.md), Abschnitt „Theme-Farbpalette (final)"). Die zehn `TeamMember.farbe`-Werte aus [`architektur/datenmodell.md`](../architektur/datenmodell.md) bleiben davon unberührt und weiterhin final; Theme-Mint und Mitarbeiterfarben sind bewusst über Sättigung/Kontext getrennt, nicht über Farbton. Bei der Farbauswahl-UI in Schritt 9 auf die bestehenden `TEAM_MEMBER_COLORS`-Werte zurückgreifen, keine neuen Farben einführen.

## 1. Vitest-Setup

Richte Vitest als Test-Runner für das Projekt ein, wie in `docs/architektur/teststrategie.md` beschrieben (reine Funktionen unit-testen, später Repository-Tests gegen In-Memory-SQLite). Ergänze die nötigen Dependencies, eine minimale `vitest.config.ts` und ein npm-Script „test" in `package.json`. Lege noch keine echten Testfälle an, nur einen Platzhalter-Test, der die Einrichtung bestätigt. Prüfe per `npm run test`, dass der Testlauf funktioniert.

## 2. TeamMember-Typ und Farbpalette

Lege gemäß `docs/architektur/projektstruktur.md` die Datei `src/shared/types.ts` an und definiere darin das Interface `TeamMember` (Felder: id, vorname, name, rolle, wochenarbeitszeitMinuten, farbe) sowie die Konstante `TEAM_MEMBER_COLORS`, beide exakt wie in `docs/architektur/datenmodell.md` festgelegt. Noch keine Repository- oder UI-Logik, nur Typen/Konstante. Prüfe mit `npm run typecheck`, dass die neue Datei fehlerfrei ist.

## 3. Konvertierungsfunktionen HH:MM ↔ Minuten

Lege reine Konvertierungsfunktionen für die Wochenarbeitszeit an (z. B. `parseHHMMToMinutes` und `formatMinutesToHHMM`), passend zur in `docs/architektur/datenmodell.md` beschriebenen Entscheidung, dass die Umrechnung an der UI-Grenze im Renderer erfolgt. Schreibe dazu Vitest-Unit-Tests inklusive Randfälle (0, mehrstellige Stunden, ungültige Eingabe). Platzierung z. B. `src/renderer/src/lib/`, Begründung kurz mit angeben.

## 4. Validierungsfunktion für neue Mitarbeiter

Schreibe eine reine Validierungsfunktion für neue `TeamMember`-Einträge (Pflichtfelder vorname/name, rolle muss einer der drei erlaubten Werte sein, wochenarbeitszeitMinuten muss positiv sein, farbe muss aus `TEAM_MEMBER_COLORS` stammen), die eine Liste verständlicher Fehlermeldungen zurückgibt. Platzierung analog zu Schritt 3. Ergänze Vitest-Unit-Tests für gültige und ungültige Eingaben.

## 5. Repository-Funktionssignaturen mit Testdaten

Lege gemäß der in `docs/architektur/projektstruktur.md` festgelegten Reihenfolge die Datei `src/main/db/teamRepository.ts` an mit `getTeamMembers(): TeamMember[]` und `addTeamMember(data: Omit<TeamMember, 'id'>): TeamMember`. Fülle beide Funktionen zunächst mit fest codierten Testdaten im Speicher, noch kein SQL, noch keine Verbindung zu `src/main/db.ts`.

## 6. IPC-Handler und Preload-API

Lege `src/main/ipc/teamHandlers.ts` an, die `ipcMain.handle('team:list', ...)` und `ipcMain.handle('team:add', ...)` registriert und die Funktionen aus `teamRepository.ts` aufruft. Erweitere die Preload-API in `src/preload/index.ts` (analog zum bestehenden `ping`-Beispiel) um typisierte Methoden `team.list()` und `team.add(data)`, inklusive passender Typ-Deklaration in `src/preload/index.d.ts` unter Verwendung des `TeamMember`-Typs.

## 7. Fehlende UI-Primitives ergänzen

Prüfe, welche shadcn-Primitives für ein Formular fehlen (voraussichtlich Input, Label, Select für Rolle und Farbauswahl). Baue nur die tatsächlich fehlenden Primitives von Hand nach, nach demselben Muster wie `Card` und `Button` aus Schritt 2 (siehe `docs/architektur/styling.md`), keine Codeübernahme aus Referenzprojekten. Zugehörige Radix-Pakete einzeln installieren, nicht pauschal. Bestehende Theme-Variablen (Mint, siehe oben) weiterverwenden, keine eigenen Farbwerte in den Primitives fest verdrahten.

## 8. TeamPage: Liste anzeigen

Ersetze den Platzhalter-Inhalt in `src/renderer/src/pages/TeamPage.tsx` (aktuell nur die Zeile „Noch nicht implementiert.") durch eine erste echte Ansicht: Liste aller Mitarbeitenden aus `team.list()`, dargestellt mit der bestehenden `Card`-Komponente (ein Card pro Mitarbeiter, inkl. Farbindikator). Den bestehenden Rückweg-Link „← Zurück zur Startseite" und die Überschrift „Team-Verwaltung" unverändert beibehalten. Noch keine Anlegen-Funktion. Bestätige das Ergebnis per Screenshot mit den Testdaten aus `teamRepository.ts`.

## 9. TeamPage: Formular zum Anlegen

Ergänze die Team-Verwaltung-Seite um ein Formular oder Dialog zum Anlegen eines neuen Mitarbeiters (Vorname, Name, Rolle als Auswahl, Wochenarbeitszeit als HH:MM-Eingabe über die Konvertierungsfunktionen aus Schritt 3, Farbe als Auswahl aus `TEAM_MEMBER_COLORS`). Validierungsfunktion aus Schritt 4 vor dem Absenden nutzen, Fehler in der UI anzeigen. Beim Absenden `team.add()` aufrufen und Liste aktualisieren. Screenshot-Bestätigung: neuer Mitarbeiter erscheint nach Anlegen in der Liste.

## 10. Echte SQLite-Anbindung

Stelle `teamRepository.ts` von Testdaten auf die echte SQLite-Anbindung um: Tabelle `team_members` beim App-Start anlegen (`CREATE TABLE IF NOT EXISTS`, analog zum bestehenden Smoke-Test in `src/main/db.ts`), `getTeamMembers`/`addTeamMember` mit echten SQL-Statements über die bestehende `db`-Instanz implementieren, Testdaten entfernen. Funktionssignaturen, IPC und UI bleiben unverändert.

## 11. Repository-Tests gegen In-Memory-SQLite

Schreibe Vitest-Tests für `getTeamMembers`/`addTeamMember` gegen eine In-Memory-SQLite-Datenbank (`new Database(':memory:')`), wie in `docs/architektur/teststrategie.md` beschrieben. Falls dafür die DB-Verbindung injizierbar gemacht werden muss statt fest auf die globale Instanz zuzugreifen, Struktur entsprechend anpassen, ohne die IPC-Schnittstelle zu verändern.

## 12. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten, über die UI einen neuen Mitarbeiter anlegen, App beenden und neu starten, um die Persistenz in der SQLite-Datei zu bestätigen (Screenshot vorher/nachher). Anschließend `docs/TODO.md` aktualisieren (Schritt 4 als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen (wichtigste Entscheidungen, Abweichungen vom Plan).
