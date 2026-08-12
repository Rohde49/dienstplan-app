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

## Schritt 5: Eintrag-Verwaltung (aktueller Schritt)

Entitäten `Eintragsdefinition`, `Dienstplan`, `Dienstplantag`, `Planeintrag`, `Rufbereitschaft` bereits entworfen (siehe [`architektur/datenmodell.md`](./architektur/datenmodell.md); Auswertungslogik separat in [`architektur/auswertung.md`](./architektur/auswertung.md)). Dieser Schritt verwaltet nur die `Eintragsdefinition`-Stammdaten, die übrigen vier Entitäten gehören zur Planungsansicht (nächster Schritt). Detaillierter Ablaufplan mit den einzelnen Claude-Code-Prompts siehe [`ablaufplaene/schritt5-eintrag-verwaltung.md`](./ablaufplaene/schritt5-eintrag-verwaltung.md).

- [ ] `Eintragsdefinition`-Typ in `shared/types.ts` anlegen
- [ ] Validierungsfunktion für Uhrzeiten (Zeitpunkte, `"HH:MM"` 00–23) inkl. Unit-Tests
- [ ] Validierungsfunktion für neue/bearbeitete Eintragsdefinitionen inkl. Unit-Tests
- [ ] Repository-Funktionssignaturen `getEintragsdefinitionen`/`addEintragsdefinition`/`updateEintragsdefinition`, zunächst mit Testdaten
- [ ] IPC-Handler (`eintragsdefinition:list`/`add`/`update`) und typisierte Preload-API
- [ ] `EintraegePage`: Liste der Eintragsdefinitionen anzeigen (Testdaten)
- [ ] `EintraegePage`: Formular zum Anlegen einer Eintragsdefinition (berechnungsart-abhängige Feldsteuerung)
- [ ] `EintraegePage`: Formular zum Bearbeiten bestehender Eintragsdefinitionen
- [ ] Repository auf echte SQLite-Anbindung umstellen (Tabelle `eintragsdefinitionen`)
- [ ] Repository-Tests gegen In-Memory-SQLite
- [ ] Gesamtverifikation (Typecheck/Lint/Test, Persistenz-Check) und Doku-Update

## Geplante nächste Schritte (noch nicht im Detail geplant)

Werden nacheinander aufgebaut, jeweils nach dem in [`architektur/projektstruktur.md`](./architektur/projektstruktur.md) festgelegten Ablauf (Entität entwerfen → Repository-Signaturen mit Testdaten → UI → echte SQLite-Anbindung):

- [ ] Planungsansicht: dynamische Erzeugung je Monat/Jahr (inkl. Entscheidung, ob Monats-/Jahres-Auswahl eigene Route oder interner Schritt der Planungsansicht ist); verwaltet `Dienstplan`, `Dienstplantag`, `Planeintrag`, `Rufbereitschaft`
- [ ] Packaging mit `electron-builder` (Windows-Installer)
