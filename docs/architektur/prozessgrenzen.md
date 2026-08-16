# Prozessgrenzen

Die wichtigste Architekturregel des Projekts ist unsichtbar: Ein Verstoß gegen die Trennung von Main, Preload und Renderer fällt weder beim Typecheck noch bei den Fachtests auf, sondern erst zur Laufzeit — und dann oft mit einer Fehlermeldung, die woandershin zeigt. Diese Datei sammelt die Regeln, die zuvor über `CLAUDE.md`, [`projektstruktur.md`](./projektstruktur.md) und die [Teststrategie](../test/teststrategie.md) verstreut waren.

## Die drei Prozesse

| Prozess      | Läuft in                  | Darf                                                              | Darf nicht                                         |
| ------------ | ------------------------- | ----------------------------------------------------------------- | -------------------------------------------------- |
| **Main**     | Node.js                   | Dateisystem, SQLite, `electron`-APIs, Fensterverwaltung           | DOM anfassen                                       |
| **Preload**  | Node, im Renderer-Kontext | `ipcRenderer.invoke` aufrufen und über `contextBridge` exponieren | Fachlogik enthalten                                |
| **Renderer** | Chromium                  | React, DOM, `window.api`                                          | `require`, `process`, `better-sqlite3`, `electron` |

`contextIsolation` ist aktiv, `sandbox` ist aus (nötig, damit das Preload-Skript aus einem gebündelten Modul laden kann). Der Renderer sieht dadurch ausschließlich das, was `contextBridge.exposeInMainWorld` freigibt: `window.electron` (Toolkit-Standard) und `window.api` (dieses Projekt).

Dass die Grenze tatsächlich dicht ist, prüft Ebene 5 direkt: Ein E2E-Fall stellt fest, dass der Renderer weder `require` noch `process` kennt.

## Repositories nehmen die Verbindung als Parameter

Ein Repository-Modul unter `src/main/db/` importiert die globale `db`-Instanz aus [`src/main/db.ts`](../../src/main/db.ts) **nicht** selbst. Stattdessen nimmt jede Funktion die Verbindung als letzten Parameter entgegen:

```typescript
export function getTeamMembers(database: Database): TeamMember[]
export function addTeamMember(data: Omit<TeamMember, 'id'>, database: Database): TeamMember
```

Der Grund ist nicht Eleganz, sondern Testbarkeit: `src/main/db.ts` ruft beim Import `app.getPath('userData')` aus `electron` auf. Unter Vitest gibt es keine echte `app`-API — schon der Import würde fehlschlagen, und die gesamte Ebene 2 wäre nicht möglich. Der Verbindungstyp kommt über einen reinen Typ-Import (`import type Database from 'better-sqlite3'`) herein, also ohne Laufzeit-Abhängigkeit.

Verdrahtet wird erst im IPC-Handler: Dort — und nur dort — wird die echte `db`-Instanz importiert und der passende `ensure…Table(db)`-Aufruf ausgeführt.

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
| Kanal deklariert, aber kein Handler registriert      | Ebene 4 (Vertragstest)                               |
| Handler registriert, den niemand deklariert hat      | Ebene 4                                              |
| Kanal doppelt registriert                            | Ebene 4                                              |
| Preload-Signatur weicht vom Fake ab                  | Typecheck                                            |
| Kanalname in `IPC_KANAELE` umbenannt                 | **niemandem** — und das zu Recht                     |

Die letzte Zeile ist kein Loch: Beide Seiten lesen dieselbe Konstante, eine Umbenennung bewegt sie gleichzeitig. Diese Fehlerklasse ist durch die Zentralisierung beseitigt, statt abgefangen zu werden.

> ⚠️ Zu prüfen: Der Main-Prozess validiert derzeit **nichts**. Alle Eingabeprüfungen liegen im Renderer, die Handler reichen ihre Argumente ungeprüft an das Repository durch. Für ein lokales Einzelnutzer-Programm ohne Netzwerkschnittstelle ist das vertretbar, widerspricht aber der in [`datenmodell.md`](./datenmodell.md) für `Rufbereitschaft` festgehaltenen Vorgabe. Siehe [`../test/offene-maengel.md`](../test/offene-maengel.md).
