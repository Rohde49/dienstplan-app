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

Das npm-Paket enthält alle acht Plattform-Prebuilds sowie unter `deps/` die SQLite-Amalgamation für einen Selbstbau — zusammen rund 25 MB, von denen auf Windows genau einer gebraucht wird. `lib/binding.js` sucht ihn als `../prebuilds/<platform>-<arch>.node`; ausgeliefert wird deshalb nur `prebuilds/win32-x64.node` (siehe Abschnitt „Zielplattform").

## Zielplattform: nur Windows

Einziges relevantes Build-Target laut Projektanforderung. Packaging über `electron-builder` als Windows-Installer (`npm run build:win`).

`electron-builder.yml` trägt die Windows-Ausrichtung seit dem 17.08.2026 auch tatsächlich: `appId: de.rohde.dienstplan`, `productName: Dienstplan`, keine mac-/Linux-Blöcke, keine `publish`-URL. Die Skripte `build:mac` und `build:linux` sind entfallen.

### Was in das Paket wandert

`files` in `electron-builder.yml` ist seit dem 17.08.2026 eine **Allow-Liste**: Aufgezählt wird, was mitgeliefert wird, alles andere bleibt draußen. Die vorherige Ausschlussliste musste jede unerwünschte Datei einzeln kennen und ließ deshalb 54 MB `node_modules` sowie ein Paket in den Installer, das gar nicht mehr in `package.json` stand.

Zwei Regeln halten das Paket klein, beide an derselben Ursache:

- **Der Renderer kann `node_modules` nicht laden.** Er läuft mit `nodeIntegration: false`, sein Code liegt vollständig gebündelt in `out/renderer/`. Jedes UI-Paket im Paket wäre also totes Gewicht. Deshalb steht in `dependencies` nur noch `better-sqlite3`; alles andere gehört in `devDependencies` und wird eingebündelt.
- **electron-builder packt aus dem physischen `node_modules`, nicht aus dem Lockfile.** Ein verwaistes Paket im Arbeitsverzeichnis landet sonst beim Nutzer. Die Allow-Liste macht das strukturell unmöglich.

Nachgemessen am 17.08.2026: 3,31 MB App-Nutzlast (1,46 MB `app.asar` plus 2,0 MB `app.asar.unpacked`), 39 Dateien statt 4859. Der Installer selbst liegt bei 96,3 MB — das ist fast vollständig die Electron-Laufzeit und von dieser Entscheidung unberührt.

Native Binärdateien müssen außerhalb des asar liegen, sonst kann `require` sie nicht laden; dafür sorgt `asarUnpack: '**/*.node'`.

### Identität der Anwendung

Zwei Punkte, die dabei zusammenhängen und leicht zu übersehen sind:

- `app.getPath('userData')` hängt an `app.getName()`, und das liest `productName` aus **`package.json`** — dort steht keines, also gilt `name: dienstplan-app`. Der `productName` in `electron-builder.yml` verschiebt das Datenverzeichnis deshalb nicht. Aus demselben Grund darf in `package.json` kein `productName` ergänzt werden: Das würde bestehende Datenbanken unauffindbar machen. Am 17.08.2026 an der gepackten App nachgemessen: `app.getName()` liefert `dienstplan-app`, das Datenverzeichnis ist `%APPDATA%\dienstplan-app`, und ein Verzeichnis `%APPDATA%\Dienstplan` existiert nicht. Die von electron-builder in das Paket geschriebene `package.json` enthält kein `productName`.
- `electronApp.setAppUserModelId(...)` in `src/main/index.ts` muss mit `appId` übereinstimmen, sonst gruppiert Windows Taskleisten-Anheftung und Benachrichtigungen unter einer anderen Identität als der installierten.

## `HashRouter` statt der Alternativen

`BrowserRouter` scheidet aus: Der Renderer wird im Produktions-Build über `file://` geladen, echte Pfad-URLs funktionieren dort nicht. Gegen `MemoryRouter` sprach, dass die aktuelle Route Teil der geladenen URL bleiben und damit einen vollständigen Reload überstehen soll; ein Mehrfenster-Szenario, das für `MemoryRouter` spräche, gibt es in diesem Projekt nicht.
