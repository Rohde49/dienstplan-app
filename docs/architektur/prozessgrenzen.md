# Prozessgrenzen

Die wichtigste Architekturregel des Projekts ist unsichtbar: Ein Verstoß gegen die Trennung von Main, Preload und Renderer fällt weder beim Typecheck noch bei den Fachtests auf, sondern erst zur Laufzeit — und dann oft mit einer Fehlermeldung, die woandershin zeigt. Diese Datei sammelt die Regeln, die zuvor über `CLAUDE.md`, [`projektstruktur.md`](./projektstruktur.md) und die [Teststrategie](../test/teststrategie.md) verstreut waren.

## Die drei Prozesse

| Prozess      | Läuft in                  | Darf                                                              | Darf nicht                                         |
| ------------ | ------------------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| **Main**     | Node.js                   | Dateisystem, SQLite, `electron`-APIs, Fensterverwaltung           | DOM anfassen                                       |
| **Preload**  | Node, im Renderer-Kontext | `ipcRenderer.invoke` aufrufen und über `contextBridge` exponieren | Fachlogik enthalten                                |
| **Renderer** | Chromium                  | React, DOM, `window.api`                                          | `require`, `process`, `better-sqlite3`, `electron` |

`contextIsolation`, `sandbox` und `nodeIntegration: false` sind in [`src/main/index.ts`](../../src/main/index.ts) ausdrücklich gesetzt, obwohl alle drei den Voreinstellungen von Electron 43 entsprechen (`nodeIntegration` false, `contextIsolation` true, `sandbox` true seit Electron 20). Sie sind die Grundlage dieser Seite und sollen ein Major-Upgrade überstehen, ohne von einer geänderten Voreinstellung still gekippt zu werden. Beim Sprung von Electron 39 auf 43 am 17.08.2026 hat sich an keinem der drei Werte etwas geändert.

Der Renderer sieht dadurch ausschließlich `window.api` — die in [`src/preload/index.ts`](../../src/preload/index.ts) freigegebene Brücke, die genau die Kanäle aus `IPC_KANAELE` durchreicht.

**Das Preload-Bundle darf außer `electron` nichts per `require` laden.** Unter `sandbox: true` steht im Preload nur dieses eine Modul zur Verfügung; ein Paket aus `node_modules` bricht den Ladevorgang ab, und `window.api` bleibt undefiniert — die App startet dann mit einem funktionslosen Fenster.

Entscheidend dafür ist, in welchem Block der `package.json` ein Paket steht: electron-vite lässt Pakete aus `dependencies` als externes `require` im Bundle stehen, Pakete aus `devDependencies` bündelt es ein. Seit dem 17.08.2026 enthält `dependencies` nur noch `better-sqlite3` — die Gefahr beschränkt sich damit auf dieses eine Paket, und ein Import von `better-sqlite3` gehört ohnehin nie ins Preload. Wird künftig etwas nach `dependencies` verschoben, kommt die Fehlerklasse zurück. Der E2E-Durchstich schlägt in diesem Fall fehl und ist das Signal dafür.

Dass die Grenze tatsächlich dicht ist, prüft Ebene 5 direkt: Ein E2E-Fall stellt fest, dass der Renderer weder `require` noch `process` noch `window.electron` kennt.

## Repositories nehmen die Verbindung als Parameter

Ein Repository-Modul unter `src/main/db/` importiert die globale `db`-Instanz aus [`src/main/db.ts`](../../src/main/db.ts) **nicht** selbst. Stattdessen nimmt jede Funktion die Verbindung als letzten Parameter entgegen:

```typescript
export function getTeamMembers(database: Database): TeamMember[]
export function addTeamMember(data: Omit<TeamMember, 'id'>, database: Database): TeamMember
```

Der Grund ist nicht Eleganz, sondern Testbarkeit: `src/main/db.ts` importiert `electron`, um über `app.getPath('userData')` den Dateipfad zu bestimmen. Unter Vitest gibt es keine echte `app`-API — schon der Import würde fehlschlagen, und die gesamte Ebene 2 wäre nicht möglich. Der Verbindungstyp kommt über einen reinen Typ-Import (`import type Database from 'better-sqlite3'`) herein, also ohne Laufzeit-Abhängigkeit.

Dasselbe gilt für die IPC-Handler unter `src/main/ipc/`: Auch sie importieren die Datenbank nicht selbst, sondern bekommen sie als Parameter (`registerTeamHandlers(db)`).

**Verdrahtet wird an genau einer Stelle:** in [`src/main/index.ts`](../../src/main/index.ts), innerhalb von `app.whenReady()`. Dort wird `oeffneDatenbank()` in einem `try/catch` aufgerufen und das Ergebnis an alle fünf `register…Handlers`-Funktionen weitergereicht.

## Schema und Pragmas an einer Stelle

[`src/main/db/schema.ts`](../../src/main/db/schema.ts) importiert bewusst **kein** `electron`. Es beschreibt, wie eine Datenbank auszusehen hat, nicht wo sie liegt — dadurch kann [`src/test/datenbank.ts`](../../src/test/datenbank.ts) dieselbe Funktion `bereiteDatenbankVor()` auf eine In-Memory-Datenbank anwenden, die der Main-Prozess auf die Datei des Nutzers anwendet.

Das ist keine Kosmetik: Die Pragmas gehören dazu. `foreign_keys = ON` wird hier gesetzt, und ohne diese gemeinsame Quelle liefen die Repository-Tests gegen eine Datenbank ohne Fremdschlüsselprüfung, während die Produktion sie hat.

| Pragma                | Warum                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `journal_mode = WAL`  | Nebenläufige Leser blockieren den Schreiber nicht                                                   |
| `foreign_keys = ON`   | Ohne dies sind die `REFERENCES`-Klauseln der Repositories wirkungslos — SQLite prüft sonst nicht    |
| `busy_timeout = 5000` | Zweiter Riegel hinter der Einzelinstanz-Sperre; wartet auf den Schreiblock statt sofort abzubrechen |

Die Schemaversion steht in `PRAGMA user_version`. Frische Datenbanken bekommen sofort die aktuelle Version, Bestandsdatenbanken durchlaufen die Einträge in `MIGRATIONEN`. Die Regeln für neue Migrationen stehen als Kommentar an diesem Array — sie gelten unwiderruflich, sobald ein Installer ausgeliefert ist.

## Ein Kanal, eine Quelle

[`src/shared/ipcKanaele.ts`](../../src/shared/ipcKanaele.ts) hält alle 15 Kanalnamen. Preload und Handler greifen beide darauf zu, statt denselben String zweimal zu schreiben.

Ein neuer Kanal entsteht deshalb immer in dieser Reihenfolge:

1. Name in `IPC_KANAELE` ergänzen
2. `ipcMain.handle(IPC_KANAELE.…)` in einem Handler-Modul registrieren
3. Methode im Preload-`api`-Objekt ergänzen
4. Signatur in `interface API` (`src/preload/index.d.ts`) nachziehen

Wird Punkt 2 oder 3 vergessen, meldet das der Vertragstest auf Ebene 4. Wird Punkt 4 vergessen, meldet es der Typecheck.

## Der Preload-Vertrag

`interface API` in [`src/preload/index.d.ts`](../../src/preload/index.d.ts) ist exportiert, und das Test-Fake in [`src/test/apiFake.ts`](../../src/test/apiFake.ts) trägt sie als Rückgabetyp. Ändert sich eine Signatur, schlägt `npm run typecheck` im Fake fehl — der Vertrag zwischen Renderer und Main wird vom Compiler bewacht statt von Disziplin.

Eine Grenze bleibt: Ein rein zusätzlicher **hinterer** Parameter fällt nicht auf, weil TypeScript Funktionen mit weniger Parametern zulässt. Diesen Fall fängt erst der aufrufende Anwendungscode ab.

## Was einen Verstoß bemerkt

| Verstoß                                              | Bemerkt von                                          |
| ---------------------------------------------------- | ---------------------------------------------------- |
| Renderer importiert `better-sqlite3` oder `electron` | Typecheck (`typecheck:web`), sonst erst zur Laufzeit |
| Repository importiert `../db` selbst                 | Ebene-2-Test bricht beim Import                      |
| Preload importiert ein Paket aus `node_modules`      | Ebene 5 — unter Sandbox bleibt `window.api` leer     |
| Kanal deklariert, aber kein Handler registriert      | Ebene 4 (Vertragstest)                               |
| Handler registriert, den niemand deklariert hat      | Ebene 4                                              |
| Kanal doppelt registriert                            | Ebene 4                                              |
| Preload-Signatur weicht vom Fake ab                  | Typecheck                                            |
| Kanalname in `IPC_KANAELE` umbenannt                 | **niemandem** — und das zu Recht                     |

Die letzte Zeile ist kein Loch: Beide Seiten lesen dieselbe Konstante, eine Umbenennung bewegt sie gleichzeitig. Diese Fehlerklasse ist durch die Zentralisierung beseitigt, statt abgefangen zu werden.

> ⚠️ Zu prüfen: Der Main-Prozess validiert derzeit **nichts**. Alle Eingabeprüfungen liegen im Renderer, die Handler reichen ihre Argumente ungeprüft an das Repository durch. Für ein lokales Einzelnutzer-Programm ohne Netzwerkschnittstelle ist das vertretbar, widerspricht aber der in [`datenmodell.md`](./datenmodell.md) für `Rufbereitschaft` festgehaltenen Vorgabe. Siehe [`test/offene-maengel.md`](../test/offene-maengel.md).
