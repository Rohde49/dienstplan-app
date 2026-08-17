# Technologieentscheidungen

Warum der Stack so aussieht, wie er aussieht. Nur Entscheidungen mit echter Alternative — was ohne Abwägung aus dem `electron-vite`-Template übernommen wurde, steht hier nicht.

| Frage          | Gewählt                 | Verworfen                       | Ausschlaggebend                                       |
| -------------- | ----------------------- | ------------------------------- | ----------------------------------------------------- |
| Desktop-Rahmen | Electron                | Tauri                           | Gesamter Stack in TypeScript, kein Rust-Lernaufwand   |
| Datenhaltung   | `better-sqlite3`, lokal | Server-Backend                  | Keine Mehrbenutzer-Synchronisation nötig              |
| Zielplattform  | nur Windows             | plattformübergreifend           | Projektanforderung                                    |
| Router         | `HashRouter`            | `BrowserRouter`, `MemoryRouter` | `file://` im Produktions-Build, Route überlebt Reload |

## Electron statt Tauri

Kompletter Stack in TypeScript. Tauri wurde erwogen (kleinere Binaries, geringerer Ressourcenverbrauch), aber die Backend-Logik liefe dort in Rust — eine zusätzliche Sprache parallel zum eigentlichen Projekt und innerhalb des Zeitrahmens des Studienprojekts. Die Entscheidung wurde nach dem Aufsetzen des Grundgerüsts noch einmal bewusst geprüft und bestätigt.

## Lokale SQLite-Datenbank statt Server-Backend

Die App läuft lokal für eine Person, es gibt nichts über Netzwerk zu synchronisieren. `better-sqlite3` im Main-Prozess, strikt isoliert vom Renderer — die Regeln dazu stehen in [`prozessgrenzen.md`](./prozessgrenzen.md).

`better-sqlite3` v13 bringt N-API-Prebuilds mit. Es ist deshalb weder `electron-rebuild` noch `node-gyp` nötig, das Paket läuft direkt im Electron-Main-Prozess.

## Zielplattform: nur Windows

Einziges relevantes Build-Target laut Projektanforderung. Packaging über `electron-builder` als Windows-Installer (`npm run build:win`).

`electron-builder.yml` trägt die Windows-Ausrichtung seit dem 17.08.2026 auch tatsächlich: `appId: de.rohde.dienstplan`, `productName: Dienstplan`, keine mac-/Linux-Blöcke, keine `publish`-URL. Die Skripte `build:mac` und `build:linux` sind entfallen.

Zwei Punkte, die dabei zusammenhängen und leicht zu übersehen sind:

- `app.getPath('userData')` hängt an `app.getName()`, und das liest `productName` aus **`package.json`** — dort steht keines, also gilt `name: dienstplan-app`. Der `productName` in `electron-builder.yml` verschiebt das Datenverzeichnis deshalb nicht. Aus demselben Grund darf in `package.json` kein `productName` ergänzt werden: Das würde bestehende Datenbanken unauffindbar machen.
- `electronApp.setAppUserModelId(...)` in `src/main/index.ts` muss mit `appId` übereinstimmen, sonst gruppiert Windows Taskleisten-Anheftung und Benachrichtigungen unter einer anderen Identität als der installierten.

## `HashRouter` statt der Alternativen

`BrowserRouter` scheidet aus: Der Renderer wird im Produktions-Build über `file://` geladen, echte Pfad-URLs funktionieren dort nicht. Gegen `MemoryRouter` sprach, dass die aktuelle Route Teil der geladenen URL bleiben und damit einen vollständigen Reload überstehen soll; ein Mehrfenster-Szenario, das für `MemoryRouter` spräche, gibt es in diesem Projekt nicht.
