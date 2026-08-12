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

**Gescriptete Variante Schritt 4/5**: In Sessions ohne interaktives Screenshot-Werkzeug für das Desktop-Fenster wurde `playwright-core` temporär per `npm install --no-save` installiert, um die gebaute App (`npm run build` → `out/`) über die `_electron`-API automatisiert zu bedienen und Screenshots zu erzeugen, danach wieder deinstalliert. `package.json`/`package-lock.json` bleiben dadurch unverändert, `playwright-core` ist keine dauerhafte Dependency — das bleibt bei der Entscheidung oben, kein festes E2E-Framework einzuführen, ist nur ein Hilfsmittel für den Einzelfall.

**Gescriptete Variante seit Schritt 6 (aktuell)**: Statt `playwright-core` wird der in `electron-vite dev` eingebaute Schalter `--remoteDebuggingPort` genutzt (`npx electron-vite dev --remoteDebuggingPort 9222`), gesteuert über ein kleines Node-Skript (`WebSocket` gegen das Chrome-DevTools-Protocol: `Runtime.evaluate` für Hash-Navigation/Klicks, `Page.captureScreenshot` für Bilder). Keine zusätzliche npm-Abhängigkeit nötig, da Node 24 `WebSocket`/`fetch` bereits global bereitstellt. Wichtig dabei: **nicht bei jeder Prüfung eine neue Dev-Instanz starten**, sondern nach Möglichkeit die ohnehin laufende (eigene oder vom Nutzer gestartete) weiterverwenden — beim Aufräumen mehrerer parallel laufender Instanzen sonst reales Risiko, versehentlich die Instanz des Nutzers mit zu beenden (`Get-Process electron | Select Id, StartTime` hilft, Prozesse eindeutig der eigenen Instanz zuzuordnen, bevor man sie beendet). Für reine Renderer-Änderungen ohne Layout-Risiko reicht oft auch: nur `npm run typecheck`/`npm run lint`, Sichtprüfung im ohnehin offenen Fenster dem Nutzer überlassen (Vite-HMR übernimmt die Aktualisierung automatisch).
