# Ablaufplan Schritt 5: Eintrag-Verwaltung

> **Abgeschlossen am 12.08.2026** (Commit `5760978`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`../../TODO.md`](../../TODO.md) und [`../../erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Schritt 5 verwaltet ausschließlich die Stammdaten der `Eintragsdefinition` (Dienstarten, Urlaub, Krankheit usw.), analog zur Team-Verwaltung in Schritt 4. `Dienstplan`, `Dienstplantag`, `Planeintrag` und `Rufbereitschaft` aus [`architektur/datenmodell.md`](../architektur/datenmodell.md) gehören zur späteren Planungsansicht (nächster Schritt laut `TODO.md`), nicht zu diesem Schritt. Falls das nicht stimmt, bitte vor dem Start korrigieren.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung. Vitest ist seit Schritt 4 eingerichtet, dafür entfällt hier der Setup-Schritt. Anders als bei `TeamMember` ist von Anfang an eine Bearbeiten-Funktion mitgeplant, nicht erst nachträglich ergänzt, weil „Stammdatenpflege" laut `datenmodell.md` ausdrücklich auch das Ändern bestehender Werte einschließt, nicht nur das Anlegen.

## 1. Eintragsdefinition-Typ in `shared/types.ts`

Ergänze in `src/shared/types.ts` das Interface `Eintragsdefinition` exakt wie in `docs/architektur/datenmodell.md` festgelegt (Felder: id, kuerzel, name, berechnungsart, beginn, ende, anwesenheitszeitMinuten, arbeitszeitMinuten, arbeitszeitOhneNachtbereitschaftMinuten, nachtbereitschaftMinuten, nachtarbeitMinuten). Noch keine Repository- oder UI-Logik. Prüfe mit `npm run typecheck`.

## 2. Validierungsfunktion für Uhrzeiten (Zeitpunkte)

Schreibe eine reine Funktion, die einen Zeitpunkt-String im Format `"HH:MM"` gegen die in `datenmodell.md` (Konventionen) festgelegte Regel prüft: Stunden zwischen `00` und `23`, Minuten zwischen `00` und `59`. Diese Funktion ist bewusst separat von den bestehenden `parseHHMMToMinutes`/`formatMinutesToHHMM` aus Schritt 4, die für Zeitdauern gedacht sind und z. B. dreistellige Stunden zulassen — für Zeitpunkte wie `beginn`/`ende` ist das fachlich falsch. Platzierung z. B. `src/renderer/src/lib/`. Ergänze Vitest-Unit-Tests inklusive Randfälle (`"00:00"`, `"23:59"`, `"24:00"`, `"12:60"`, falsches Format).

## 3. Validierungsfunktion für neue/bearbeitete Eintragsdefinitionen

Schreibe eine reine Validierungsfunktion, die eine Liste verständlicher Fehlermeldungen zurückgibt. Prüft: `kuerzel` und `name` nicht leer, `berechnungsart` einer der beiden erlaubten Werte, `beginn`/`ende` (falls nicht `null`) über die Funktion aus Schritt 2, die fünf Zeitdauer-Felder nichtnegative ganze Minutenzahlen. Zusätzlich die in `datenmodell.md` beschriebene Regel für `berechnungsart: 'mitarbeiterabhaengig'`: `anwesenheitszeitMinuten`, `arbeitszeitOhneNachtbereitschaftMinuten`, `nachtbereitschaftMinuten` und `nachtarbeitMinuten` müssen `0` sein, `beginn`/`ende` müssen `null` sein. Ergänze Vitest-Unit-Tests für gültige und ungültige Eingaben beider Berechnungsarten.

## 4. Repository-Funktionssignaturen mit Testdaten

Lege `src/main/db/eintragsdefinitionRepository.ts` an mit `getEintragsdefinitionen(): Eintragsdefinition[]`, `addEintragsdefinition(data: Omit<Eintragsdefinition, 'id'>): Eintragsdefinition` und `updateEintragsdefinition(id: number, data: Omit<Eintragsdefinition, 'id'>): Eintragsdefinition`. Fülle alle drei Funktionen zunächst mit fest codierten Testdaten im Speicher (mindestens eine Eintragsdefinition je Berechnungsart), noch kein SQL.

## 5. IPC-Handler und Preload-API

Lege `src/main/ipc/eintragsdefinitionHandlers.ts` an, die `ipcMain.handle('eintragsdefinition:list', ...)`, `ipcMain.handle('eintragsdefinition:add', ...)` und `ipcMain.handle('eintragsdefinition:update', ...)` registriert und die Funktionen aus Schritt 4 aufruft. Erweitere die Preload-API in `src/preload/index.ts` um `eintragsdefinition.list()`, `.add(data)` und `.update(id, data)`, inklusive Typ-Deklaration in `src/preload/index.d.ts`, nach demselben Muster wie `api.team` aus Schritt 4.

## 6. EintraegePage: Liste anzeigen

Ersetze den Platzhalter-Inhalt in `src/renderer/src/pages/EintraegePage.tsx` (aktuell nur die Zeile „Noch nicht implementiert.") durch eine Liste aller Eintragsdefinitionen aus `eintragsdefinition.list()`, dargestellt mit der bestehenden `Card`-Komponente. Zeitdauern über `formatMinutesToHHMM` aus Schritt 4 anzeigen, `beginn`/`ende` direkt als Text (kein Format-Wechsel nötig, ist schon `"HH:MM"`), fehlende Uhrzeiten (`null`) sinnvoll darstellen (z. B. „–"). Bestehenden Rückweg-Link und Überschrift beibehalten. Noch keine Anlegen-/Bearbeiten-Funktion. Screenshot-Bestätigung mit den Testdaten aus Schritt 4.

## 7. EintraegePage: Formular zum Anlegen

Ergänze ein Formular zum Anlegen einer neuen Eintragsdefinition mit allen Feldern aus dem Typ. Zentral: Die Auswahl der `berechnungsart` muss die vier betroffenen Zeitdauer-Felder und `beginn`/`ende` je nach Auswahl sichtbar/eingebbar machen oder deaktivieren (bei `mitarbeiterabhaengig` deaktiviert und auf die in `datenmodell.md` vorgesehenen Werte gesetzt), nicht einfach immer alle elf Felder anzeigen. Prüfe zuerst, ob dafür ein neues UI-Primitiv nötig ist oder die bestehenden (`Select` für `berechnungsart`, `Input`) ausreichen. Validierungsfunktion aus Schritt 3 vor dem Absenden nutzen. Screenshot-Bestätigung: neue Eintragsdefinition erscheint nach Anlegen in der Liste, für beide Berechnungsarten einmal geprüft.

## 8. EintraegePage: Formular zum Bearbeiten

Ergänze eine Bearbeiten-Funktion für bestehende Eintragsdefinitionen, die das Formular aus Schritt 7 wiederverwendet und mit den aktuellen Werten vorbefüllt. Beim Speichern `eintragsdefinition.update()` aufrufen. Screenshot-Bestätigung: Änderung an einer bestehenden Eintragsdefinition wird nach dem Speichern in der Liste sichtbar.

## 9. Echte SQLite-Anbindung

Stelle `eintragsdefinitionRepository.ts` von Testdaten auf die echte SQLite-Anbindung um: Tabelle `eintragsdefinitionen` beim App-Start anlegen (`CREATE TABLE IF NOT EXISTS`, elf Spalten passend zum Typ, `beginn`/`ende` als `TEXT` mit `NULL` erlaubt), `getEintragsdefinitionen`/`addEintragsdefinition`/`updateEintragsdefinition` mit echten SQL-Statements. DB-Verbindung wie bei `teamRepository.ts` als Parameter entgegennehmen, nicht global importieren (aus demselben Grund wie in Schritt 4: sonst schlägt der Import unter Vitest fehl, weil er `app.getPath(...)` auslöst). Testdaten entfernen.

## 10. Repository-Tests gegen In-Memory-SQLite

Schreibe Vitest-Tests für `getEintragsdefinitionen`/`addEintragsdefinition`/`updateEintragsdefinition` gegen eine In-Memory-SQLite-Datenbank (`new Database(':memory:')`), analog zu `teamRepository.test.ts` aus Schritt 4. Achte insbesondere auf die korrekte Behandlung von `beginn`/`ende` als `null` bei mitarbeiterabhängigen Einträgen.

## 11. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten, je eine Eintragsdefinition beider Berechnungsarten anlegen und eine davon bearbeiten, App neu starten, Persistenz bestätigen (Screenshot vorher/nachher). Anschließend `docs/TODO.md` aktualisieren (Schritt 5 als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen (wichtigste Entscheidungen, Abweichungen vom Plan).
