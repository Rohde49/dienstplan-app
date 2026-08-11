# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektübersicht

Dienstplan-Desktop-App: eine Windows-Desktop-Anwendung zur Dienstplanverwaltung. Studienprojekt, entwickelt mit Claude Code.

## Aktueller Stand

Das Grundgerüst ist gescaffoldet (via `npm create @quick-start/electron@latest` mit Template `react-ts`). `npm install`, `typecheck`, `lint` und `npm run dev` wurden verifiziert; Fenster und die eingebaute IPC-Demo (Renderer → Preload → Main, Button „Send IPC" löst `pong`-Log im Main-Prozess aus) wurden per Screenshot/Test bestätigt. `better-sqlite3` ist eingerichtet und im Main-Prozess per Smoke-Test verifiziert (`src/main/db.ts`). Ein Git-Repository ist initialisiert (noch kein Commit). Ausstehend: Routing, Fachlogik (siehe „Geplante Reihenfolge").

### Datenbank

- `src/main/db.ts` — öffnet `better-sqlite3`-DB unter `app.getPath('userData')/dienstplan.db` (WAL-Modus), exportiert die `db`-Instanz und `runDbSmokeTest()`
- `better-sqlite3` v13 nutzt N-API-Prebuilds (im Paket enthalten) — kein `electron-rebuild`/`node-gyp` nötig, funktioniert direkt im Electron-Main-Prozess
- Reines Main-Prozess-Modul — Renderer darf `better-sqlite3` nicht direkt importieren, Zugriff nur über IPC/Preload-Bridge (analog zum `ping`-Beispiel)

### Befehle

- `npm run dev` — Dev-Modus (Hot Reload, Electron-Fenster startet)
- `npm run typecheck` — TypeScript-Prüfung (Node- und Web-Teil getrennt: `typecheck:node`, `typecheck:web`)
- `npm run lint` — ESLint
- `npm run format` — Prettier (schreibt Änderungen)
- `npm run build` — Typecheck + Produktions-Build
- `npm run build:win` — Windows-Installer via `electron-builder` (einziges relevantes Build-Target laut `TODO.md`)

### Projektstruktur

- `src/main/index.ts` — Electron Main-Prozess
- `src/preload/index.ts` (+ `index.d.ts`) — Preload-Skript, Brücke zwischen Main und Renderer
- `src/renderer/` — React-App (`src/renderer/src/App.tsx`, `main.tsx`, `components/`, `assets/`)
- `electron.vite.config.ts` — Build-Konfiguration für alle drei Prozesse
- `electron-builder.yml` — Packaging-Konfiguration
- `tsconfig.node.json` / `tsconfig.web.json` — getrennte TS-Konfiguration für Main/Preload vs. Renderer

Das Template bringt bereits eine funktionierende IPC-Demo zwischen Renderer und Main über das Preload-Skript mit (Vorlage für eigene IPC-Aufrufe).

## Tech-Stack & Architektur

- **Electron + Vite + React + TypeScript**, gescaffoldet über `electron-vite`
- Standard-Electron-Architektur: Main-Prozess / Renderer-Prozess getrennt, Kommunikation über IPC via Preload-Skript
- **SQLite** lokal über `better-sqlite3`, isoliert im Main-Prozess — kein Server-Backend, da keine Mehrbenutzer-Synchronisation über Netzwerk benötigt wird
- **React Router** für die Navigation zwischen: Startseite, Team-Verwaltung, Plan-Verwaltung, Monats-/Jahres-Auswahl
- Packaging über `electron-builder`, nur Windows-Installer (Zielplattform ausschließlich Windows)
- Electron wurde bewusst statt Tauri gewählt, um den gesamten Stack in TypeScript zu halten und zusätzlichen Rust-Lernaufwand im Studienprojekt zu vermeiden

## Geplante Reihenfolge

1. ~~`electron-vite`-Scaffold, Node.js LTS, Git-Repository, ESLint/Prettier~~ erledigt
2. ~~Minimales Fenster mit funktionierendem Hot Reload~~ erledigt
3. ~~IPC-Test zwischen Renderer und Main über Preload-Skript~~ erledigt
4. ~~SQLite-Anbindung (`better-sqlite3`) isoliert im Main-Prozess testen~~ erledigt
5. Grundlayout mit React Router
6. Team-Verwaltung
7. Planungsansicht (dynamisch je Monat/Jahr)
8. Packaging mit `electron-builder`

## Workflow-Konventionen

- Plan Mode (Shift+Tab) vor größeren Änderungen nutzen; bei trivialen Ein-Zeilen-Fixes nicht nötig
- Aufträge konkret formulieren: Datei/Bereich benennen, gewünschtes Verhalten beschreiben, auf bestehende Muster im Code verweisen statt vager Anweisungen
- Nach zwei erfolglosen Korrekturversuchen am selben Problem: `/clear` und Auftrag präziser neu formulieren, statt weiter zu flicken
- `/clear` zwischen thematisch unabhängigen Aufgaben, um den Kontext sauber zu halten
- Wo möglich eine Prüfmöglichkeit schaffen (Tests, TypeScript-Compiler, Screenshot-Vergleich der UI) — ohne Prüfsignal wird kaputter Code nicht selbst erkannt
- Kommunikation in diesem Projekt erfolgt auf Deutsch
