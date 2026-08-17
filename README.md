# Dienstplan-App

Windows-Desktop-Anwendung zur Dienstplanverwaltung. Studienprojekt, entwickelt mit Claude Code.

Electron + Vite + React + TypeScript, lokale SQLite-Datenbank über `better-sqlite3`. Ausführliche Begründung der Technologiewahl in [`docs/architektur/technologieentscheidungen.md`](./docs/architektur/technologieentscheidungen.md).

## Dokumentation

Wegweiser durch die gesamte Projektdokumentation: [`docs/README.md`](./docs/README.md).

Der aktuelle Stand steht in [`docs/TODO.md`](./docs/TODO.md), der Verlauf im [Tagebuch](./docs/tagebuch), die Arbeitskonventionen in [`CLAUDE.md`](./CLAUDE.md).

## Einrichtung

```bash
npm install
```

Für eine reproduzierbare Installation aus der `package-lock.json` — und auf jedem Rechner ohne Python und Build-Tools — stattdessen:

```bash
npm ci --ignore-scripts && node node_modules/electron/install.js
```

> Ohne `--ignore-scripts` startet npm für `better-sqlite3` einen `node-gyp`-Build und bricht ohne Python ab. Nötig ist der Build nicht — die N-API-Prebuilds aller Plattformen liegen im Paket. Der zweite Befehl holt die Electron-Binärdatei nach, deren `postinstall` das Flag mit unterdrückt. Denselben Weg geht der CI-Workflow in [`.github/workflows/ci.yml`](./.github/workflows/ci.yml).

## Entwicklung

```bash
npm run dev
```

## Prüfen

```bash
npm run typecheck && npm run lint && npm run test && npm run test:e2e
```

Was die einzelnen Testebenen abdecken und was bewusst nicht getestet wird: [`docs/test/teststrategie.md`](./docs/test/teststrategie.md).

Dieselben Prüfungen laufen bei jedem Push und Pull Request automatisch über [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) — Lint, Typecheck und Tests auf Linux, Build und E2E auf Windows.

## Windows-Installer bauen

```bash
npm run build:win
```

Empfohlene IDE-Einrichtung: [VS Code](https://code.visualstudio.com/) mit [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) und [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).
