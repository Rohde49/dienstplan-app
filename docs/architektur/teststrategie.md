# Teststrategie

Drei Testebenen, priorisiert nach Aufwand/Nutzen für ein Studienprojekt mit begrenztem Zeitrahmen.

## 1. Fachlogik als reine Funktionen (höchste Priorität)

Reine Funktionen ohne Electron-Abhängigkeit schreiben, z. B. "erzeuge leere Plantabelle für Monat X/Jahr Y" oder Validierungsregeln. Mit Vitest unit-testen, ganz ohne laufendes Electron-Fenster. Das ist der wichtigste und günstigste Test-Layer und sollte zuerst aufgebaut werden.

**Umsetzung seit Schritt 4**: `vitest.config.ts` im Projektroot, `environment: 'node'`, bewusst ohne `globals: true` — Tests importieren `describe`/`it`/`expect` explizit aus `vitest`, damit keine zusätzliche globale Typdeklaration in `tsconfig.node.json`/`tsconfig.web.json` nötig ist. Ausführung über `npm run test` (`vitest run`).

## 2. Repository-/DB-Layer

Gegen eine In-Memory-SQLite-Datenbank testen (`new Database(':memory:')`). Das geht mit `better-sqlite3` problemlos synchron und ohne Mocking, es wird also echte SQL-Logik getestet, ohne eine Datei auf der Platte anzulegen.

**Voraussetzung**: Repository-Module dürfen die globale `db`-Instanz aus `src/main/db.ts` nicht selbst importieren, sonst löst schon der Import unter Vitest `app.getPath(...)` aus `electron` aus und schlägt fehl (kein echtes Electron-Environment im Testlauf). Stattdessen nehmen Repository-Funktionen die DB-Verbindung als Parameter entgegen (siehe `teamRepository.ts`), die Verdrahtung mit der echten Instanz passiert erst in den IPC-Handlern.

## 3. UI-/E2E-Tests (niedrige Priorität, vorerst zurückgestellt)

Für Electron z. B. mit Playwright möglich, aber Zusatzaufwand mit begrenztem Mehrwert für dieses Projekt. Kein dauerhafter Testtyp in diesem Projekt, stattdessen manueller bzw. gescripteter Screenshot-Vergleich der UI, wie bisher schon bei Schritt 1 praktiziert (Fenster/IPC-Test per Screenshot bestätigt).

**Gescriptete Variante seit Schritt 4**: In Sessions ohne interaktives Screenshot-Werkzeug für das Desktop-Fenster wurde `playwright-core` temporär per `npm install --no-save` installiert, um die gebaute App (`npm run build` → `out/`) über die `_electron`-API automatisiert zu bedienen und Screenshots zu erzeugen, danach wieder deinstalliert. `package.json`/`package-lock.json` bleiben dadurch unverändert, `playwright-core` ist keine dauerhafte Dependency — das bleibt bei der Entscheidung oben, kein festes E2E-Framework einzuführen, ist nur ein Hilfsmittel für den Einzelfall.
