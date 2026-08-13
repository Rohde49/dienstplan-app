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

## Geplante nächste Schritte (grober Fahrplan, noch nicht im Detail geplant)

Werden nacheinander aufgebaut, jeweils mit eigenem Ablaufplan (siehe `ablaufplaene/`), analog zu Schritt 4/5/6/7/8/9. Reihenfolge und Zuschnitt können sich beim Detailplanen des jeweiligen Schritts noch verschieben.

- [ ] Planungsansicht – Bemerkung-Spalte (siehe offene Fragen in `temp/temp-PlanungPage.md`)
- [ ] Planungsansicht – berechnete Kennzahlen (u. a. Soll-/Ist-Arbeitszeit, Δ Soll/Ist, Dienste-Zähler) — UI-Platzhalter dafür bereits in `PlanungsGrid.tsx` angelegt, siehe `entwicklungstagebuch.md`; hier fehlt noch ausschließlich die Berechnungslogik, in eigenem Ablaufplan getrennt von den obigen Setz-Funktionen
- [ ] AuswertungsPage: Schaltfläche innerhalb der Planungsansicht, die die Planungstabelle in den Hintergrund treten lässt (leicht unscharf) und die Auswertungstabelle im Vordergrund anzeigt
- [ ] Verkürzte Ansicht: Umschalt-Schaltfläche zwischen Planungsansicht und einer kompakten Dienstplan-Ansicht (in beide Richtungen); genaue Ausgestaltung folgt später
- [ ] PDF-Export/Druck-Funktion: Schaltfläche auf der verkürzten Ansicht (dient zugleich als Druckvorschau in der App), öffnet den Windows-Dialog für PDF-Export bzw. Drucken
- [ ] Packaging mit `electron-builder` (Windows-Installer)
