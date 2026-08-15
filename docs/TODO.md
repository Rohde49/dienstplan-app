# TODO: Dienstplan-Desktop-App

Entwicklung erfolgt mit Claude Code (Electron + Vite + React + TypeScript). Begründung der Technologiewahl siehe [`architektur/technologieentscheidungen.md`](./architektur/technologieentscheidungen.md).

## Schritt 1: Grundgerüst aufsetzen (abgeschlossen)

- [x] Projekt mit `electron-vite` scaffolden (Template: Electron + React + TypeScript)
- [x] Node.js LTS, Git-Repository und ESLint/Prettier einrichten
- [x] Minimale Fensterstruktur starten (leeres Fenster, Hot Reload funktioniert) — per Screenshot bestätigt: Fenster startet, zeigt die electron-vite-Startseite
- [x] IPC zwischen Renderer- und Main-Prozess testen (einfache Testkommunikation über Preload-Skript) — "Send IPC"-Button im Template geklickt, Main-Prozess loggt `pong`
- [x] Erst nach erfolgreichem IPC-Test mit weiteren Schritten fortfahren
- [x] SQLite-Anbindung über `better-sqlite3` im Main-Prozess isoliert testen — `src/main/db.ts` legt DB in `app.getPath('userData')` an, Smoke-Test (Tabelle anlegen, Insert, Select) beim App-Start bestätigt per Log und Datei auf Disk
- [x] Git-Repository auf GitHub angelegt und verbunden (`github.com/Rohde49/dienstplan-app`), erster Commit gepusht

## Schritt 2: Styling-Fundament (abgeschlossen)

Details und Begründung siehe [`architektur/styling.md`](./architektur/styling.md).

- [x] Tailwind v4 über `@tailwindcss/vite` im Renderer einrichten (kein separates `tailwind.config.js`, Theme über `@theme inline` in der globalen CSS-Datei)
- [x] shadcn im Style „new-york" einrichten (`components.json`, Pfad-Alias `@/` → `src/renderer/src`), `lucide-react` installieren
- [x] `cn()`-Hilfsfunktion mit `clsx` + `tailwind-merge` anlegen (nicht wie im Referenzprojekt nur `clsx` allein, siehe `styling.md`)
- [x] Erste UI-Primitives nachbauen, mindestens `Card` (zusammengesetzt aus `Card`, `CardHeader`, `CardTitle`, `CardContent`, `CardFooter`) und `Button` — zusätzlich `CardDescription`, `Button` mit `asChild`/`@radix-ui/react-slot`
- [x] Farbpalette für Theme festlegen, gleichzeitig die noch offene Palette für `TeamMember.farbe` aus `architektur/datenmodell.md` mit klären — Theme final in `base.css` (neutral, siehe `architektur/styling.md`), `TeamMember.farbe`-Palette (10 Werte) final in `architektur/datenmodell.md`, Code-Platzierung (`shared/types.ts`) folgt bei Umsetzung der Team-Verwaltung

## Schritt 3: Startseite mit Navigation (abgeschlossen)

- [x] React Router einrichten (Routing-Grundgerüst, keine persistente Navigationsleiste, da die Cards auf der Startseite die Navigation übernehmen) — `react-router-dom` installiert, `HashRouter` in `main.tsx` eingehängt
- [x] Startseite (`StartPage`) mit drei Cards (auf Basis der in Schritt 2 gebauten `Card`-Komponente): Team-Verwaltung, Eintrag-Verwaltung, Dienstplan erstellen — `src/renderer/src/pages/StartPage.tsx`, Card-Primitive selbst unverändert
- [x] Jede Card verlinkt per Klick auf die zugehörige Route (Zielseiten vorerst leere Platzhalter, ohne Fachlogik oder Datenanbindung) — Platzhalterseiten `TeamPage`, `EintraegePage`, `PlanPage` unter `src/renderer/src/pages/`, mit Rückweg-Link zur Startseite
- [x] Hinweis: Router-Typ vor Umsetzung festlegen — entschieden für `HashRouter` statt `MemoryRouter`: funktioniert mit `file://`, und die aktuelle Route bleibt Teil der geladenen URL und übersteht damit einen vollständigen Reload (bei `MemoryRouter` wäre die Historie danach immer bei `/`)

## Schritt 4: Team-Verwaltung (abgeschlossen)

Entität `TeamMember` bereits entworfen (siehe [`architektur/datenmodell.md`](./architektur/datenmodell.md)). Detaillierter Ablaufplan mit den einzelnen Claude-Code-Prompts siehe [`ablaufplaene/schritt4-team-verwaltung.md`](./ablaufplaene/schritt4-team-verwaltung.md), Reihenfolge folgt [`architektur/projektstruktur.md`](./architektur/projektstruktur.md).

- [x] Vitest-Testinfrastruktur einrichten (Dependencies, `vitest.config.ts`, npm-Script „test", Platzhalter-Test)
- [x] `TeamMember`-Typ und `TEAM_MEMBER_COLORS`-Palette in `shared/types.ts` anlegen
- [x] Konvertierungsfunktionen HH:MM ↔ Minuten (`parseHHMMToMinutes`/`formatMinutesToHHMM`) inkl. Unit-Tests
- [x] Validierungsfunktion für neue Mitarbeiter-Einträge inkl. Unit-Tests
- [x] Repository-Funktionssignaturen `getTeamMembers`/`addTeamMember` in `teamRepository.ts`, zunächst mit Testdaten
- [x] IPC-Handler (`team:list`, `team:add`) und typisierte Preload-API
- [x] Fehlende UI-Primitives ergänzen (Input, Label, Select), nach Muster aus Schritt 2
- [x] `TeamPage`: Liste der Mitarbeitenden anzeigen (Testdaten)
- [x] `TeamPage`: Formular zum Anlegen eines Mitarbeiters
- [x] Repository auf echte SQLite-Anbindung umstellen (Tabelle `team_members`)
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update — alle drei Checks sauber, Persistenz über vollständigen App-Neustart per Screenshot bestätigt (neu angelegter Mitarbeiter „Michael Roth" nach Neustart weiterhin in der SQLite-Datei vorhanden)

**Nacharbeit nach Abschluss (kein neuer nummerierter Schritt, siehe `entwicklungstagebuch.md`)**: Team-Verwaltung nach Nutzer-Mockup umgebaut — Bearbeiten-Funktion (`updateTeamMember`, `team:update`), echte `Table`-Primitive statt Card-Grid, wiederverwendbare `ManagementLayout`-Komponente (`components/layout/`), globale Inter-Schrift.

## Schritt 5: Eintrag-Verwaltung (abgeschlossen)

Entitäten `Eintragsdefinition`, `Dienstplan`, `Dienstplantag`, `Planeintrag`, `Rufbereitschaft` bereits entworfen (siehe [`architektur/datenmodell.md`](./architektur/datenmodell.md); Auswertungslogik separat in [`architektur/auswertung.md`](./architektur/auswertung.md)). Dieser Schritt verwaltet nur die `Eintragsdefinition`-Stammdaten, die übrigen vier Entitäten gehören zur Planungsansicht (nächster Schritt). Detaillierter Ablaufplan mit den einzelnen Claude-Code-Prompts siehe [`ablaufplaene/schritt5-eintrag-verwaltung.md`](./ablaufplaene/schritt5-eintrag-verwaltung.md).

- [x] `Eintragsdefinition`-Typ in `shared/types.ts` anlegen
- [x] Validierungsfunktion für Uhrzeiten (Zeitpunkte, `"HH:MM"` 00–23) inkl. Unit-Tests
- [x] Validierungsfunktion für neue/bearbeitete Eintragsdefinitionen inkl. Unit-Tests
- [x] Repository-Funktionssignaturen `getEintragsdefinitionen`/`addEintragsdefinition`/`updateEintragsdefinition`, zunächst mit Testdaten
- [x] IPC-Handler (`eintragsdefinition:list`/`add`/`update`) und typisierte Preload-API
- [x] `EintraegePage`: Liste der Eintragsdefinitionen anzeigen (Testdaten)
- [x] `EintraegePage`: Formular zum Anlegen einer Eintragsdefinition (berechnungsart-abhängige Feldsteuerung)
- [x] `EintraegePage`: Formular zum Bearbeiten bestehender Eintragsdefinitionen
- [x] Repository auf echte SQLite-Anbindung umstellen (Tabelle `eintragsdefinitionen`)
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update — alle drei Checks sauber, Persistenz über vollständigen App-Neustart per Screenshot bestätigt (Eintragsdefinitionen „Spätdienst-Nacht (bearbeitet)" und „Krankheit" nach Neustart weiterhin in der SQLite-Datei vorhanden)

**Nacharbeit nach Abschluss (kein neuer nummerierter Schritt, siehe `entwicklungstagebuch.md`)**: Nutzer-Feedback aus dem laufenden Dev-Server umgesetzt — eigenes gestapeltes Layout (`StackedManagementLayout`) für die breite Eintragsdefinitionen-Tabelle statt des zu schmalen `ManagementLayout`-Rasters; fachliche Korrektur, dass `arbeitszeitMinuten` bei `berechnungsart: 'mitarbeiterabhaengig'` ebenfalls deaktiviert und auf `0` erzwungen wird (nicht nur die vier anderen Zeitwerte), da dieser Wert erst beim späteren `Planeintrag` berechnet wird; Anlegen/Bearbeiten-Card und Liste innerhalb des gestapelten Layouts getauscht (Formular jetzt oben, Liste darunter) und die Formular-Card über eine neue `Collapsible`-Primitive (`@radix-ui/react-collapsible`) ausklappbar gemacht, standardmäßig eingeklappt.

## Schritt 6: Planungsansicht – Gerüst (abgeschlossen)

Baut nur das Grundgerüst der `PlanungsPage` (bestehende Platzhalterdatei `PlanPage.tsx`) auf: Kalendertage-Berechnung, Kopfbereich mit Monat/Jahr-Auswahl, Grid mit echten Mitarbeiterdaten, Platzhalter-Spalten für spätere Funktionen. Noch kein Setzen von `Planeintrag`/`Rufbereitschaft`, keine Persistenz von `Dienstplan`/`Dienstplantag`. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt6-planungsansicht-geruest.md`](./ablaufplaene/schritt6-planungsansicht-geruest.md).

- [x] Kalendertage-Funktion (reine Funktion inkl. Feiertagsberechnung nach Brandenburgischem Feiertagsgesetz) inkl. Unit-Tests
- [x] `PlanungsPage`: Kopfbereich mit Monat-/Jahr-Auswahl sowie deaktivierten Schaltflächen „Verkürzte Form" und „Auswertung"
- [x] Grid-/Scroll-Grundstruktur (sticky Kopfzeile, sticky Datum-Spalte, horizontaler Scroll bei vielen Mitarbeitenden) zunächst mit Platzhalterdaten geprüft
- [x] Mitarbeiter-Spaltengruppen mit echten `TeamMember`-Daten (Name, Farbe), Eintrag-/Beginn-/Ende-Unterspalten vorerst leer
- [x] Kalendertage-Zeilen mit echten Daten (Wochenende-/Feiertags-Kennzeichnung)
- [x] Platzhalter-Spalten Rufbereitschaft und Bemerkung (ohne Funktion)
- [x] Gesamtverifikation (Typecheck/Lint/Test, Screenshot-Vergleich mit Mockup) und Doku-Update — alle drei Checks sauber (78 Tests), Screenshot-Serie über CDP (Kopfbereich, Spaltenfarben, sticky Header/Datum-Spalte bei diagonalem Scroll, Wochenende-/Feiertags-Färbung inkl. Ostern/Weihnachten) bestätigt

## Schritt 7: Dienstplan/Dienstplantag – Anlegen & Speichern (abgeschlossen)

Erstellen/Laden/Speichern von `Dienstplan` inkl. der zugehörigen `Dienstplantag`-Zeilen, mit dem dazugehörigen Titel-Feld. Noch kein Setzen von `Planeintrag`/`Rufbereitschaft`, keine Bemerkung-Funktion, keine berechneten Kennzahlen — siehe [`temp/temp-PlanungPage.md`](./temp/temp-PlanungPage.md) für die dafür zurückgestellten Fragen. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt7-dienstplan-anlegen-speichern.md`](./ablaufplaene/schritt7-dienstplan-anlegen-speichern.md).

- [x] `Dienstplan`/`Dienstplantag`-Typen in `shared/types.ts`
- [x] Repository-Funktionssignaturen (`getDienstplaene`/`getDienstplanMitTagen`/`createDienstplan`/`updateDienstplanTitel`), zunächst mit Testdaten
- [x] IPC-Handler und typisierte Preload-API
- [x] Kopfbereich: Zustandslogik Erstellen/Speichern/Neu-anlegen, Titel-Feld
- [x] Laden-Dialog mit Liste vorhandener Dienstpläne
- [x] Warnhinweis bei ungespeicherten Änderungen
- [x] `PlanungsGrid` mit `Dienstplantag`-Zeilen verknüpfen (Vorbereitung für spätere Schritte)
- [x] Echte SQLite-Anbindung (Tabellen `dienstplaene`/`dienstplantage`, Transaktion beim Erstellen)
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update — alle drei Checks sauber (93 Tests, 15 davon neu für `dienstplanRepository`), Persistenz über vollständigen App-Neustart per Screenshot bestätigt (Titel „Persistenz-Test SQLite (final)" und aktualisiertes `geaendertAm` nach Neustart weiterhin in der SQLite-Datei vorhanden, `erstelltAm` unverändert), Warnhinweis-Flow (Laden/Neu anlegen, Abbrechen/Fortfahren) im laufenden Fenster durchgespielt

## Schritt 8: Planeintrag – Setzen und Bearbeiten (abgeschlossen)

Setzen/Ändern/Entfernen von `Planeintrag`-Einträgen im Grid, über ein Popover je Zellengruppe, persistiert gemeinsam mit dem Titel über den bestehenden „Speichern"-Button aus Schritt 7. Noch kein `Rufbereitschaft`, keine Bemerkung-Funktion, keine berechneten Kennzahlen. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt8-planeintrag-setzen.md`](./ablaufplaene/schritt8-planeintrag-setzen.md).

- [x] `Planeintrag`-Typ in `shared/types.ts`
- [x] Berechnungsfunktion für mitarbeiterabhängige Arbeitszeit inkl. Unit-Tests
- [x] Repository-Funktionssignaturen (`getPlaneintraegeFuerDienstplan`, kombinierte Speicherfunktion), zunächst mit Testdaten
- [x] IPC-Handler und typisierte Preload-API
- [x] Popover-Primitive und Eintragsdefinition-Auswahl-Komponente
- [x] Popover ans Grid anbinden, lokaler Entwurf inkl. ungespeichert-Indikator
- [x] Laden erweitert Planeinträge in die Baseline
- [x] „Speichern" um Planeintrag-Änderungen erweitern
- [x] Echte SQLite-Anbindung (Tabelle `planeintraege`, Transaktion)
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update — alle drei Checks sauber (113 Tests, 21 davon neu für `planeintragSchluessel`/`planeintragSnapshot`/`mitarbeiterabhaengigeArbeitszeit` sowie `speicherePlanungsstand`/`getPlaneintraegeFuerDienstplan`), Persistenz über vollständigen App-Neustart per Screenshot bestätigt (mehrere Einträge gesetzt, einen mitarbeiterabhängigen geändert, einen entfernt, gespeichert, nach Neustart per „Laden" korrekt wiedergefunden), Warnhinweis-Flow mit offenen Planeintrag-Änderungen (Abbrechen/Fortfahren) im laufenden Fenster durchgespielt

## Schritt 9: Rufbereitschaft – Setzen, Ändern und Entfernen (abgeschlossen)

Setzen/Ändern/Entfernen von `Rufbereitschaft` in der Rufbereitschaft-Spalte, nach demselben Popover- und Entwurf/Baseline-Muster wie `Planeintrag` in Schritt 8, persistiert gemeinsam über den bestehenden „Speichern"-Button. Noch keine Bemerkung-Funktion, keine berechneten Kennzahlen. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt9-rufbereitschaft-setzen.md`](./ablaufplaene/schritt9-rufbereitschaft-setzen.md).

- [x] `Rufbereitschaft`-Typ in `shared/types.ts`
- [x] Repository-Funktionssignaturen (`getRufbereitschaftenFuerDienstplan`), zunächst mit Testdaten
- [x] `speicherePlanungsstand` um Rufbereitschaft-Änderungen erweitern
- [x] IPC-Handler und typisierte Preload-API
- [x] `RufbereitschaftAuswahl`-Komponente
- [x] Rufbereitschaft-Spalte im Grid anbinden, lokaler Entwurf inkl. ungespeichert-Indikator
- [x] Laden erweitert Rufbereitschaften in die Baseline
- [x] „Speichern" um Rufbereitschaft-Änderungen erweitern
- [x] Echte SQLite-Anbindung (Tabelle `rufbereitschaften`, UNIQUE auf `dienstplantagId`)
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update — alle drei Checks sauber (122 Tests, 7 davon neu für `speicherePlanungsstand`/`getRufbereitschaftenFuerDienstplan`/UNIQUE-Constraint), Persistenz über vollständigen App-Neustart per Screenshot bestätigt (drei Rufbereitschaften gesetzt, eine geändert, eine entfernt, zusammen mit einem Planeintrag gespeichert, nach Neustart per „Laden" korrekt wiedergefunden), Warnhinweis-Flow mit offenen Rufbereitschaft-Änderungen im laufenden Fenster durchgespielt

## Schritt 10: Bemerkung – Setzen und Bearbeiten (abgeschlossen)

Setzen/Ändern von `Dienstplantag.bemerkung` als Inline-Textfeld in der Bemerkung-Spalte (max. 40 Zeichen), persistiert gemeinsam über den bestehenden „Speichern"-Button. Keine neue Entität/Tabelle, keine neue Lade-Logik nötig. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt10-bemerkung-setzen.md`](./ablaufplaene/schritt10-bemerkung-setzen.md).

- [x] Validierung der Bemerkung-Länge (max. 40 Zeichen) inkl. Unit-Tests
- [x] `speicherePlanungsstand` um Bemerkung-Änderungen erweitern, zunächst mit Testdaten
- [x] IPC-Handler und typisierte Preload-API
- [x] Bemerkung-Zelle als Inline-Textfeld im Grid
- [x] Lokaler Entwurf und ungespeichert-Indikator
- [x] „Speichern" um Bemerkung-Änderungen erweitern
- [x] Echte SQLite-Anbindung (UPDATE innerhalb bestehender Transaktion)
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update — alle drei Checks sauber (131 Tests, 5 davon neu für `speicherePlanungsstand`/Bemerkung), Persistenz über vollständigen Prozess-Neustart per Screenshot bestätigt (mehrere Bemerkungen gesetzt, eine geändert, eine geleert, zusammen mit Planeintrag- und Rufbereitschaft-Änderung gespeichert, nach Neustart per „Laden" korrekt wiedergefunden, geleerte Bemerkung als `null` in der Datenbank bestätigt)

## Schritt 11: Berechnete Kennzahlen (abgeschlossen)

Implementiert die vollständige Berechnungslogik aller 15 Kennzahlen aus [`architektur/auswertung.md`](./architektur/auswertung.md) als reine Funktionen in `shared/`, verdrahtet davon zunächst nur die fünf Platzhalter in `PlanungsGrid.tsx` (SN/F-Dienste, Freie Tage, Δ Soll/Ist, Ist, Soll), live aus dem aktuellen Entwurf, nur für Erzieher. Die übrigen zehn Zeilen sind für die spätere `AuswertungsPage` vorbereitet, aber noch nicht angezeigt. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt11-kennzahlen-berechnen.md`](./ablaufplaene/schritt11-kennzahlen-berechnen.md).

- [x] Rundungshilfsfunktion vereinheitlichen (`rundeAufVolleMinute` nach `shared/`)
- [x] Anzahl Arbeitstage im Monat inkl. Unit-Tests
- [x] Tagesbezogene Zählungen je Mitarbeiter (SN/F-Dienste, Freie Tage/Samstage/Sonntage+Feiertage, Sonntag/Feiertag-Stunden, Rufbereitschaften)
- [x] Monatssummen und abgeleitete Werte (Arbeitszeit-Summen, Zuschläge, Ist/Soll/Differenz)
- [x] Formatierung Δ Soll/Ist mit Vorzeichen
- [x] `PlanungsGrid` verdrahten (live, nur Erzieher, „n/A" für andere Rollen)
- [x] Gesamtverifikation (Typecheck/Lint/Test, Screenshot-Vergleich) und Doku-Update — alle drei Checks sauber (156 Tests, 25 davon neu), manuelle Kontrollrechnung im laufenden Fenster über CDP-Skript bestätigt (SN/F-Dienste für drei Erzieher unterschiedlicher Wochenarbeitszeit sowie eine Wirtschaftskraft gesetzt, zwei Rufbereitschaften vergeben; alle fünf Grid-Werte stimmten exakt mit der Handrechnung überein, Aktualisierung sofort ohne „Speichern")

## Schritt 12: TeamMember löschen (abgeschlossen)

Löschen über das bestehende Bearbeiten-Formular in `TeamPage`, blockiert wenn der Mitarbeiter bereits in `Planeintrag`/`Rufbereitschaft` verwendet wird. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt12-teammember-loeschen.md`](./ablaufplaene/schritt12-teammember-loeschen.md).

- [x] Repository-Funktion `deleteTeamMember` (mit Verwendungsprüfung)
- [x] IPC-Handler und typisierte Preload-API
- [x] `TeamMemberForm` um Löschen-Button erweitern
- [x] `TeamPage` verdrahten
- [x] Repository-Tests gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test) und Doku-Update — alle drei Checks sauber (159 Tests, 3 davon neu für `deleteTeamMember`), Löschen im laufenden Fenster über CDP-Skript geprüft (unbenutzten Mitarbeiter „Frau Müller" gelöscht, verschwindet aus der Liste; Löschversuch bei „Max Mustermann" — verwendet in Planeintrag und Rufbereitschaft — zeigt die Fehlermeldung im Formular, Mitarbeiter bleibt erhalten)

## Schritt 13: Eintragsdefinition löschen (abgeschlossen)

Löschen über das bestehende Bearbeiten-Formular in `EintraegePage`, ohne Verwendungsprüfung (bereits gesetzte Planeinträge sind laut Datenmodell als Snapshot unabhängig von der Eintragsdefinition). Detaillierter Ablaufplan siehe [`ablaufplaene/schritt13-eintragsdefinition-loeschen.md`](./ablaufplaene/schritt13-eintragsdefinition-loeschen.md).

- [x] Repository-Funktion `deleteEintragsdefinition`
- [x] IPC-Handler und typisierte Preload-API
- [x] `EintragsdefinitionForm` um Löschen-Button erweitern
- [x] `EintraegePage` verdrahten
- [x] Repository-Test gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test) und Doku-Update — alle drei Checks sauber (161 Tests, 2 davon neu für `deleteEintragsdefinition`), Löschen im laufenden Fenster über CDP-Skript geprüft (Eintragsdefinition „GV" angelegt, in einem Dienstplan als Planeintrag für Max Mustermann am 01.08. gesetzt und gespeichert, danach die Eintragsdefinition gelöscht — Dienstplan neu geladen zeigt den Planeintrag inkl. Snapshot „GV / 08:00–16:00" unverändert im Grid)

## Schritt 14: Dienstplan löschen (abgeschlossen)

Löschen ausschließlich über die Laden-Liste (`DienstplanLadenDialog`), kaskadiert über `dienstplantage`/`planeintraege`/`rufbereitschaften` in einer Transaktion. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt14-dienstplan-loeschen.md`](./ablaufplaene/schritt14-dienstplan-loeschen.md).

- [x] Repository-Funktion `deleteDienstplan` (kaskadierende Transaktion)
- [x] IPC-Handler und typisierte Preload-API
- [x] `DienstplanLadenDialog` um Löschen-Button pro Zeile erweitern
- [x] `PlanPage` auf Löschen des aktiven Dienstplans reagieren lassen
- [x] Repository-Test gegen In-Memory-SQLite
- [x] Gesamtverifikation (Typecheck/Lint/Test) und Doku-Update — alle drei Checks sauber (163 Tests, 2 davon neu für `deleteDienstplan`), End-to-End-Test im laufenden Fenster über CDP-Skript bestätigt (Dienstplan mit Planeinträgen/Rufbereitschaft angelegt und gespeichert, nicht-aktiven sowie aktiven Dienstplan über den Laden-Dialog gelöscht — bei Löschen des aktiven Plans fällt `PlanPage` sichtbar in den Ausgangszustand zurück —, nach vollständigem App-Neustart per „Laden" bestätigt, dass beide Testpläne wirklich weg sind)

## Schritt 15: AuswertungsPage (abgeschlossen)

Dialog-Overlay innerhalb der `PlanungsPage` (kein eigener Router-Pfad), ausgelöst über den bestehenden „Auswertung"-Button, zeigt alle 15 Kennzahlen-Zeilen aus `auswertung.md` nur für Erzieher, live aus dem aktuellen Entwurf. Inklusive der in Schritt 11 zurückgestellten farblichen Hervorhebung von Δ Soll/Ist (jetzt auch rückwirkend in `PlanungsGrid`). Detaillierter Ablaufplan siehe [`ablaufplaene/schritt15-auswertungspage.md`](./ablaufplaene/schritt15-auswertungspage.md).

- [x] Farbfunktion für Δ Soll/Ist inkl. Unit-Tests
- [x] `AuswertungDialog.tsx`: Grundstruktur (Dialog-Größe, Layout, Zeilenbeschriftungen, nur Erzieher-Spalten)
- [x] Echte Berechnung und Formatierung einbinden
- [x] `PlanungsGrid`: Δ Soll/Ist-Kopfzelle rückwirkend einfärben
- [x] `PlanPage` verdrahten (Button aktivieren, Dialog einbinden)
- [x] Gesamtverifikation (Typecheck/Lint/Test, Screenshot-Vergleich) und Doku-Update — alle drei Checks sauber (167 Tests, 4 davon neu für `sollIstFarbe`), manuelle Kontrollrechnung im laufenden Fenster über CDP-Skript bestätigt (drei Erzieher mit unterschiedlichen SN/F-Diensten, freien Tagen, Sonntagsarbeit, Rufbereitschaften und einem gezielt exakt auf die Soll-Arbeitszeit gesetzten Testfall; alle 15 Zeilen je Erzieher stimmten exakt mit der Handrechnung überein, Δ Soll/Ist zeigte dabei sowohl den Grün- als auch den Abweichungsfall im selben Screenshot)

## Schritt 16: Verkürzte Ansicht (abgeschlossen)

Aktiviert den bestehenden, bisher deaktivierten Planform-Umschalter „Planung"/„Druckvorschau" im Kopfbereich der `PlanungsPage` und ergänzt eine neue, rein lesende `VerkuerzteAnsicht`-Komponente: eine Spalte je Mitarbeiter (statt drei Unterspalten), Kopfzeile mit Wochenarbeitszeit statt der Kennzahlen-Platzhalter aus `PlanungsGrid`, Rufbereitschaft/Bemerkung bleiben erhalten, alle `TeamMember` sichtbar. Kein PDF-Export/Druckdialog in diesem Schritt (eigener, späterer Schritt), nur ein deaktivierter Platzhalter-Button „Drucken". Detaillierter Ablaufplan siehe [`ablaufplaene/schritt16-verkuerzte-ansicht.md`](./ablaufplaene/schritt16-verkuerzte-ansicht.md).

- [x] Planform-Umschalter aktivieren (State in `PlanPage`, bedingtes Rendering)
- [x] `VerkuerzteAnsicht.tsx`: Grundstruktur (Spalten-/Kopfzeilenlayout, Platzhalterwerte)
- [x] Echte Zellinhalte aus dem Entwurf (Planeintrag, Rufbereitschaft, Bemerkung)
- [x] Fußzeilen Ist-/Soll-Arbeitszeit je Mitarbeiter, nur für Erzieher
- [x] „Drucken"-Platzhalter-Button
- [x] Gesamtverifikation (Typecheck/Lint/Test, Screenshot-Vergleich) und Doku-Update — alle drei Checks sauber (167 Tests, unverändert, da rein UI-seitige Wiederverwendung bestehender reiner Funktionen ohne neue Testfälle), Screenshot-Serie im laufenden Fenster über CDP-Skript bestätigt (Dienstplan mit vier Erziehern und einer Wirtschaftskraft, festen und mitarbeiterabhängigen Planeinträgen, zwei Rufbereitschaften und zwei Bemerkungen aufgebaut, mehrfach zwischen „Planung" und „Druckvorschau" hin- und hergeschaltet — alle Werte inkl. Fußzeilen stimmten in jeder Runde exakt mit `PlanungsGrid` überein, keine Daten gingen beim Umschalten verloren)

## Zwischenschritt: Teststrategie überarbeitet (abgeschlossen)

Kein nummerierter Fachschritt, sondern eine Überarbeitung der Testinfrastruktur vor Schritt 17. Die bisherige Strategie hatte drei Ebenen, von denen nur zwei existierten — die UI-Schicht und die IPC-Verdrahtung waren vollständig ungeprüft, und die dritte Ebene bestand aus nicht eingecheckten Screenshot-Skripten. Neue Fassung siehe [`architektur/teststrategie.md`](./architektur/teststrategie.md).

- [x] `vitest.config.ts` auf zwei Projekte umgestellt (Node und jsdom, Aufteilung über die Dateiendung — Laufzeit dadurch bei 1,9 s statt 42,8 s)
- [x] Testhilfen unter `src/test/`: typisiertes `window.api`-Fake, In-Memory-Datenbank, Testdaten-Fabriken, jsdom-Setup inkl. Radix-Polyfills
- [x] Ebene 4 neu: `src/shared/ipcKanaele.ts` als einzige Quelle der Kanalnamen, Preload und alle 15 Handler darauf umgestellt, Vertragstest mit beidseitiger Prüfung
- [x] Ebene 3 neu: Komponententests mit Testing Library, Muster in `TeamPage.test.tsx` (vier Fälle über zugängliche Rollen/Beschriftungen)
- [x] Ebene 5 neu: Playwright-Smoke-Suite unter `e2e/` gegen die gebaute App mit isoliertem Benutzerdatenverzeichnis — Start, Prozessgrenze, Durchstich mit Neustart-Persistenz
- [x] Automatisierte Druckprüfung über `webContents.printToPDF` plus `pdfjs-dist`-Auswertung (Seitenzahl und Textinhalt) — ersetzt den Screenshot-Vergleich für die Druckausgabe
- [x] Gegenproben für die Ebenen 3 und 4 durchgeführt (Prüfeigenschaft absichtlich verletzt, Rotwerden bestätigt, Verletzung zurückgenommen)
- [x] Verifikation: 174 Tests in 19 Dateien grün, E2E 5 grün plus 1 bewusst als `it.fails` markierter Mangel, Typecheck und Lint sauber

**Dabei aufgedeckter Mangel**: Die Druckausgabe verliert heute den letzten Tag des Monats — die Ansicht aus Schritt 16 ist ein Scrollcontainer, gedruckt wird nur der sichtbare Ausschnitt. Als `it.fails` in `e2e/druckausgabe.e2e.test.ts` festgehalten; wird von Schritt 17 behoben, danach ist die Markierung zu entfernen.

## Schritt 17: Druckvorschau/Drucken

Baut `VerkuerzteAnsicht.tsx` aus Schritt 16 grundlegend zu `DruckAnsicht.tsx` um: statt einer scrollbaren Kompakttabelle zeigt sie dauerhaft eine live skalierte, exakte A4-Hochformat-Vorschau (zwei getrennte Skalierungsebenen: Inhalts-Skalierung auf eine physische A4-Seite, unabhängig davon ein rein optischer Außen-Zoom fürs App-Panel), inklusive Dienstplan-Titel als Kopfzeile. Der bestehende „Drucken"-Button löst darauf `window.print()` aus (nativer Windows-Druckdialog, „Microsoft Print to PDF" oder echter Drucker, kein neuer IPC-Kanal). Kein Signaturblock in diesem Schritt. Detaillierter Ablaufplan siehe [`ablaufplaene/schritt17-druckvorschau-drucken.md`](./ablaufplaene/schritt17-druckvorschau-drucken.md).

- [ ] Umbenennung `VerkuerzteAnsicht.tsx` → `DruckAnsicht.tsx`, A4-Flächen-Grundgerüst, Titel-Kopfzeile
- [ ] Reine Skalierungsfunktion (`berechneDruckSkalierungsfaktor`) inkl. Unit-Tests
- [ ] Live Inhalts-Skalierung verdrahten (auf eine A4-Seite, unabhängig von Fenstergröße)
- [ ] Live Außen-Zoom verdrahten (Panel-Anpassung per `ResizeObserver`, rein optisch)
- [ ] Print-Stylesheet und „Drucken"-Button aktivieren
- [ ] Gesamtverifikation (Typecheck/Lint/Test, `npm run test:e2e`) und Doku-Update — der Abnahmetest existiert bereits: `it.fails('legt alle Tage des Monats auf die Seite')` in `e2e/druckausgabe.e2e.test.ts` muss nach diesem Schritt bestehen, dann `.fails` entfernen. Zusätzlich einmal manuell über „Drucken" als PDF exportieren (nur der native Dialog bleibt unautomatisierbar).

## Geplante nächste Schritte (grober Fahrplan, noch nicht im Detail geplant)

Werden nacheinander aufgebaut, jeweils mit eigenem Ablaufplan (siehe `ablaufplaene/`), analog zu Schritt 4/5/6/7/8/9/10/11/12/13/14/15/16/17. Reihenfolge und Zuschnitt können sich beim Detailplanen des jeweiligen Schritts noch verschieben.

- [ ] Packaging mit `electron-builder` (Windows-Installer)
