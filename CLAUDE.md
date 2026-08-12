# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektübersicht

Dienstplan-Desktop-App: eine Windows-Desktop-Anwendung zur Dienstplanverwaltung. Studienprojekt, entwickelt mit Claude Code.

## Aktueller Stand & geplante Reihenfolge

Fortschritt und Planung werden ausschließlich in [`docs/TODO.md`](./docs/TODO.md) gepflegt (Checkliste je Schritt, aktueller Schritt dort oben markiert), Verlauf und Begründungen einzelner Entscheidungen in [`docs/entwicklungstagebuch.md`](./docs/entwicklungstagebuch.md). Vor Beginn eines neuen Schritts `docs/TODO.md` und den zugehörigen Ablaufplan unter [`docs/ablaufplaene/`](./docs/ablaufplaene) lesen, um den tatsächlichen Stand zu kennen statt ihn hier zu vermuten — diese Datei dupliziert den Fortschritt bewusst nicht, damit er nicht wie zuvor auseinanderlaufen kann.

### Datenbank

- `src/main/db.ts` — öffnet `better-sqlite3`-DB unter `app.getPath('userData')/dienstplan.db` (WAL-Modus), exportiert die `db`-Instanz und `runDbSmokeTest()`
- Repository-Module (z. B. `src/main/db/teamRepository.ts`) importieren die globale `db`-Instanz nicht selbst, sondern nehmen die Verbindung als Parameter entgegen — Verdrahtung mit der echten Instanz passiert erst in den IPC-Handlern (`src/main/ipc/`). Grund und Testkonsequenz siehe [`docs/architektur/teststrategie.md`](./docs/architektur/teststrategie.md).
- `better-sqlite3` v13 nutzt N-API-Prebuilds (im Paket enthalten) — kein `electron-rebuild`/`node-gyp` nötig, funktioniert direkt im Electron-Main-Prozess
- Reines Main-Prozess-Modul — Renderer darf `better-sqlite3` nicht direkt importieren, Zugriff nur über IPC/Preload-Bridge (analog zum `ping`-Beispiel)

### Befehle

- `npm run dev` — Dev-Modus (Hot Reload, Electron-Fenster startet)
- `npm run typecheck` — TypeScript-Prüfung (Node- und Web-Teil getrennt: `typecheck:node`, `typecheck:web`)
- `npm run lint` — ESLint
- `npm run format` — Prettier (schreibt Änderungen)
- `npm run test` — Vitest (reine Funktionen + Repository-Tests gegen In-Memory-SQLite, siehe [`docs/architektur/teststrategie.md`](./docs/architektur/teststrategie.md))
- `npm run build` — Typecheck + Produktions-Build
- `npm run build:win` — Windows-Installer via `electron-builder` (einziges relevantes Build-Target laut `docs/TODO.md`)

### Projektstruktur

- `src/main/index.ts` — Electron Main-Prozess
- `src/main/db.ts` — SQLite-Verbindung; `src/main/db/` — Repository-Module je Fachbereich (z. B. `teamRepository.ts`)
- `src/main/ipc/` — IPC-Handler je Fachbereich (z. B. `teamHandlers.ts`)
- `src/preload/index.ts` (+ `index.d.ts`) — Preload-Skript, Brücke zwischen Main und Renderer
- `src/shared/types.ts` — Entitäten, die Main und Renderer gemeinsam nutzen (einziger „Wahrheitsort" für Datenstrukturen)
- `src/renderer/src/` — React-App: `pages/` (eine Datei je Route), `components/ui/` (shadcn-Primitives), `components/layout/` (seitenübergreifende, fachlich unwissende Layout-Bausteine), `components/` direkt (fachspezifische Komponenten), `lib/` (reine Funktionen), `assets/`
- `docs/` — Projektdokumentation, siehe [`docs/README.md`](./docs/README.md) für die Übersicht
- `electron.vite.config.ts` — Build-Konfiguration für alle drei Prozesse
- `electron-builder.yml` — Packaging-Konfiguration
- `tsconfig.node.json` / `tsconfig.web.json` — getrennte TS-Konfiguration für Main/Preload vs. Renderer

Begründung und Details zur Ordnerstruktur siehe [`docs/architektur/projektstruktur.md`](./docs/architektur/projektstruktur.md). Das Template bringt außerdem eine funktionierende IPC-Demo zwischen Renderer und Main über das Preload-Skript mit (`ping`/`pong`, Vorlage für eigene IPC-Aufrufe).

## Tech-Stack & Architektur

- **Electron + Vite + React + TypeScript**, gescaffoldet über `electron-vite`
- Standard-Electron-Architektur: Main-Prozess / Renderer-Prozess getrennt, Kommunikation über IPC via Preload-Skript
- **SQLite** lokal über `better-sqlite3`, isoliert im Main-Prozess — kein Server-Backend, da keine Mehrbenutzer-Synchronisation über Netzwerk benötigt wird
- **React Router** (`HashRouter`) für die Navigation zwischen Startseite und den Fachbereichs-Seiten unter `src/renderer/src/pages/`, keine persistente Navigationsleiste — die Cards auf der Startseite übernehmen die Navigation
- Packaging über `electron-builder`, nur Windows-Installer (Zielplattform ausschließlich Windows)
- Electron wurde bewusst statt Tauri gewählt, um den gesamten Stack in TypeScript zu halten und zusätzlichen Rust-Lernaufwand im Studienprojekt zu vermeiden (ausführliche Begründung siehe [`docs/architektur/technologieentscheidungen.md`](./docs/architektur/technologieentscheidungen.md))

## Workflow-Konventionen

- Plan Mode (Shift+Tab) vor größeren Änderungen nutzen; bei trivialen Ein-Zeilen-Fixes nicht nötig
- Aufträge konkret formulieren: Datei/Bereich benennen, gewünschtes Verhalten beschreiben, auf bestehende Muster im Code verweisen statt vager Anweisungen
- Nach zwei erfolglosen Korrekturversuchen am selben Problem: `/clear` und Auftrag präziser neu formulieren, statt weiter zu flicken
- `/clear` zwischen thematisch unabhängigen Aufgaben, um den Kontext sauber zu halten
- Wo möglich eine Prüfmöglichkeit schaffen (Tests, TypeScript-Compiler, Screenshot-Vergleich der UI) — ohne Prüfsignal wird kaputter Code nicht selbst erkannt
- Kommunikation in diesem Projekt erfolgt auf Deutsch
