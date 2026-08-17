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

> Auf einem Rechner ohne Python und Build-Tools bricht `npm ci` ab, weil npm für `better-sqlite3` einen `node-gyp`-Build startet. Nötig ist der Build nicht — die Prebuilds liegen im Paket. Umweg und Hintergrund in [`docs/test/offene-maengel.md`](./docs/test/offene-maengel.md).

## Entwicklung

```bash
npm run dev
```

## Prüfen

```bash
npm run typecheck && npm run lint && npm run test && npm run test:e2e
```

Was die einzelnen Testebenen abdecken und was bewusst nicht getestet wird: [`docs/test/teststrategie.md`](./docs/test/teststrategie.md).

## Windows-Installer bauen

```bash
npm run build:win
```

Empfohlene IDE-Einrichtung: [VS Code](https://code.visualstudio.com/) mit [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) und [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode).
