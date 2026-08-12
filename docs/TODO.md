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

## Geplante nächste Schritte (noch nicht im Detail geplant)

Werden nacheinander aufgebaut, jeweils nach dem in [`architektur/projektstruktur.md`](./architektur/projektstruktur.md) festgelegten Ablauf (Entität entwerfen → Repository-Signaturen mit Testdaten → UI → echte SQLite-Anbindung):

- [ ] Team-Verwaltung (Entität `TeamMember` bereits entworfen, siehe `architektur/datenmodell.md`)
- [ ] Eintrag-Verwaltung (Struktur von `ShiftType`/`PlanEntry` vorher in `architektur/datenmodell.md` klären, siehe Abschnitt „Offen")
- [ ] Planungsansicht: dynamische Erzeugung je Monat/Jahr (inkl. Entscheidung, ob Monats-/Jahres-Auswahl eigene Route oder interner Schritt der Planungsansicht ist)
- [ ] Packaging mit `electron-builder` (Windows-Installer)
