# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projektübersicht

Dienstplan-Desktop-App: eine Windows-Desktop-Anwendung zur Dienstplanverwaltung. Studienprojekt, entwickelt mit Claude Code.

## Aktueller Stand & geplante Reihenfolge

Fortschritt und Planung werden ausschließlich in [`docs/TODO.md`](./docs/TODO.md) gepflegt, Abgeschlossenes in [`docs/erledigt.md`](./docs/erledigt.md), Verlauf und Begründungen einzelner Entscheidungen im Tagebuch unter [`docs/tagebuch/`](./docs/tagebuch) (eine Datei je Kalenderwoche, Index in dessen `README.md`). Vor Beginn eines neuen Schritts `docs/TODO.md` und den zugehörigen Ablaufplan unter [`docs/ablaufplaene/`](./docs/ablaufplaene) lesen, um den tatsächlichen Stand zu kennen statt ihn hier zu vermuten — diese Datei dupliziert den Fortschritt bewusst nicht, damit er nicht wie zuvor auseinanderlaufen kann.

Wegweiser durch die gesamte Dokumentation: [`docs/README.md`](./docs/README.md). Nach Code-Änderungen die betroffene Doku mit `/doku-pflege` nachziehen, Ablageregeln siehe [`docs/workflow/doku-pflege.md`](./docs/workflow/doku-pflege.md).

### Datenbank

- `src/main/db.ts` — exportiert `oeffneDatenbank()` (öffnet `app.getPath('userData')/dienstplan.db`) und `datenbankPfad()`. Das Öffnen ist bewusst **keine** Modul-Nebenwirkung: `src/main/index.ts` ruft es in `app.whenReady()` innerhalb eines `try/catch` auf und zeigt bei einem Fehler `dialog.showErrorBox`, statt den Prozess stumm sterben zu lassen.
- `src/main/db/schema.ts` — `bereiteDatenbankVor()`: Pragmas (`WAL`, `foreign_keys = ON`, `busy_timeout`), Tabellen und `user_version`-Migrationen. Ohne `electron`-Import, damit die Tests über `src/test/datenbank.ts` exakt dieselbe Vorbereitung nutzen.
- Repository-Module (z. B. `src/main/db/teamRepository.ts`) **und** die IPC-Handler nehmen die Verbindung als Parameter entgegen; verdrahtet wird ausschließlich in `src/main/index.ts`. Grund und Testkonsequenz siehe [`docs/architektur/prozessgrenzen.md`](./docs/architektur/prozessgrenzen.md).
- `better-sqlite3` v13 nutzt N-API-Prebuilds (im Paket enthalten) — kein `electron-rebuild`/`node-gyp` nötig, funktioniert direkt im Electron-Main-Prozess
- Reines Main-Prozess-Modul — Renderer darf `better-sqlite3` nicht direkt importieren, Zugriff nur über IPC/Preload-Bridge (analog zum `ping`-Beispiel)

### Befehle

- `npm run dev` — Dev-Modus (Hot Reload, Electron-Fenster startet)
- `npm run typecheck` — TypeScript-Prüfung (Node- und Web-Teil getrennt: `typecheck:node`, `typecheck:web`)
- `npm run lint` — ESLint
- `npm run format` — Prettier (schreibt Änderungen)
- `npm run test` — Vitest, Ebenen 1–4 (reine Funktionen, Repository gegen In-Memory-SQLite, Komponenten in jsdom, IPC-Vertrag), läuft in unter 20 Sekunden
- `npm run test:e2e` — Ebene 5: Playwright gegen die gebaute App; baut selbst vorher. `npm run test:e2e:only` überspringt den Build für schnelle Wiederholungen
- `npm run test:coverage` — Coverage-Bericht (Signal zum Finden blinder Flecken, kein Zielwert)
- `npm run build` — Typecheck + Produktions-Build
- `npm run build:win` — Windows-Installer via `electron-builder` (einziges Build-Target; mac/Linux wurden entfernt)

> `npm ci` scheitert auf einem Rechner ohne Python/Build-Tools, weil npm für `better-sqlite3` einen `node-gyp`-Build startet. Nötig ist er nicht — die Prebuilds liegen im Paket. Siehe [`docs/test/offene-maengel.md`](./docs/test/offene-maengel.md).

Zuständigkeit der einzelnen Testebenen, Konventionen und was bewusst nicht getestet wird: [`docs/test/teststrategie.md`](./docs/test/teststrategie.md) — vor dem Schreiben neuer Tests lesen.

### Projektstruktur

- `src/main/index.ts` — Electron Main-Prozess
- `src/main/db.ts` — SQLite-Verbindung; `src/main/db/` — Repository-Module je Fachbereich (z. B. `teamRepository.ts`)
- `src/main/ipc/` — IPC-Handler je Fachbereich (z. B. `teamHandlers.ts`)
- `src/preload/index.ts` (+ `index.d.ts`) — Preload-Skript, einzige Brücke zwischen Main und Renderer (`window.api`). Darf außer `electron` **nichts** importieren, sonst bricht es unter `sandbox: true`
- `src/shared/types.ts` — Entitäten, die Main und Renderer gemeinsam nutzen (einziger „Wahrheitsort" für Datenstrukturen)
- `src/renderer/src/` — React-App: `pages/` (eine Datei je Route), `components/ui/` (shadcn-Primitives), `components/layout/` (seitenübergreifende, fachlich unwissende Layout-Bausteine), `components/` direkt (fachspezifische Komponenten), `lib/` (reine Funktionen), `assets/`
- `src/shared/ipcKanaele.ts` — einzige Quelle der IPC-Kanalnamen; Preload und Handler greifen beide darauf zu, ein Vertragstest prüft die Vollständigkeit
- `src/test/` — Testhilfen für alle Ebenen: `apiFake.ts` (typisierter `window.api`-Ersatz), `datenbank.ts`, `factories.ts`, `setup.renderer.ts`
- `e2e/` — Playwright-Tests gegen die gebaute App, inklusive automatisierter Druckprüfung über `printToPDF`
- `docs/` — Projektdokumentation, siehe [`docs/README.md`](./docs/README.md) für die Übersicht. Vor UI-Arbeit [`docs/style/design-system.md`](./docs/style/design-system.md) und [`docs/style/barrierefreiheit.md`](./docs/style/barrierefreiheit.md) lesen: Tokens, Skalen, Zustände und die Barrierefreiheits-Mindestanforderungen sind dort verbindlich festgehalten
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
- Wo möglich eine Prüfmöglichkeit schaffen (Tests, TypeScript-Compiler) — ohne Prüfsignal wird kaputter Code nicht selbst erkannt. Die passende Ebene dafür ergibt sich aus [`docs/test/teststrategie.md`](./docs/test/teststrategie.md); ein Screenshot ist Sichtprüfung, kein Prüfsignal
- Nach einem neuen Test, der eine bisher ungeprüfte Fehlerklasse abdeckt: einmal die geprüfte Eigenschaft absichtlich verletzen, Rotwerden bestätigen, Verletzung zurücknehmen — ein Test, der nie fehlschlägt, ist wertlos
- Kommunikation in diesem Projekt erfolgt auf Deutsch
