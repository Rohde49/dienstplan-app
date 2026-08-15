# Teststrategie

Fünf Ebenen, von unten nach oben immer weniger Fälle. Jede Ebene hat genau eine Zuständigkeit — wenn eine Frage auf einer unteren Ebene beantwortet werden kann, gehört sie auch dorthin, weil die Tests dort schneller, stabiler und aussagekräftiger sind.

| Ebene | Zuständig für                                         | Werkzeug                            | Ausführung         | Fälle     |
| ----- | ----------------------------------------------------- | ----------------------------------- | ------------------ | --------- |
| 1     | Fachregeln ohne I/O                                   | Vitest, `environment: node`         | `npm run test`     | viele     |
| 2     | echtes SQL, Constraints, Löschregeln                  | Vitest + SQLite `:memory:`          | `npm run test`     | viele     |
| 3     | Verhalten der Oberfläche                              | Vitest + jsdom + Testing Library    | `npm run test`     | mittel    |
| 4     | Vollständigkeit der IPC-Verdrahtung                   | Vitest, `electron` gemockt          | `npm run test`     | 1 Datei   |
| 5     | Zusammenspiel aller drei Prozesse, echte Druckausgabe | Playwright `_electron` gegen `out/` | `npm run test:e2e` | 4–6 Fälle |

Ebenen 1–4 laufen zusammen in unter 20 Sekunden und sind nach jeder Änderung zumutbar. Ebene 5 setzt `npm run build` voraus und läuft deshalb getrennt.

---

## Ebene 1 — Fachlogik als reine Funktionen

Reine Funktionen ohne Electron-Abhängigkeit, z. B. „erzeuge Kalendertage für Monat X/Jahr Y" ([`shared/kalendertage.ts`](../../src/shared/kalendertage.ts)), Zeitumrechnung, Validierungsregeln, Auswertungsberechnungen. Der günstigste und wichtigste Layer.

Fachlogik gehört bewusst in solche Funktionen und nicht in Komponenten — das ist der Grund, warum diese Ebene überhaupt so tragfähig ist. Neue Berechnungsregeln zuerst hier anlegen, nicht in einer `.tsx`-Datei.

**Konfiguration**: `environment: 'node'`, bewusst ohne `globals: true` — Tests importieren `describe`/`it`/`expect` explizit aus `vitest`, damit keine zusätzliche globale Typdeklaration in den tsconfigs nötig ist.

**Gehört nicht hierher**: alles, was einen DOM, eine Datenbank oder Electron braucht.

## Ebene 2 — Repository- und Datenbankschicht

Tests gegen eine In-Memory-SQLite-Datenbank (`new Database(':memory:')`). Mit `better-sqlite3` synchron und ohne Mocking — es wird also echte SQL-Logik geprüft, ohne eine Datei auf der Platte anzulegen.

**Voraussetzung**: Repository-Module dürfen die globale `db`-Instanz aus [`src/main/db.ts`](../../src/main/db.ts) nicht selbst importieren, sonst löst schon der Import unter Vitest `app.getPath(...)` aus `electron` aus und schlägt fehl. Stattdessen nehmen Repository-Funktionen die Verbindung als Parameter entgegen (siehe [`teamRepository.ts`](../../src/main/db/teamRepository.ts)), die Verdrahtung mit der echten Instanz passiert erst in den IPC-Handlern.

**Schema**: [`src/test/datenbank.ts`](../../src/test/datenbank.ts) stellt `erzeugeTestDatenbank()` bereit. Das Schema entsteht dort über dieselben `ensure…`-Funktionen, die auch die IPC-Handler beim App-Start aufrufen — Tests können deshalb nicht gegen ein abweichendes Schema laufen.

**Gehört nicht hierher**: Formatierung und Darstellung von Werten.

## Ebene 3 — Komponententests

Gerendert wird die echte Seite mit ihren echten Kindkomponenten; ersetzt wird ausschließlich die Prozessgrenze, also `window.api`. Muster: [`TeamPage.test.tsx`](../../src/renderer/src/pages/TeamPage.test.tsx).

**Das `window.api`-Fake** ([`src/test/apiFake.ts`](../../src/test/apiFake.ts)) hält die Daten im Speicher und verhält sich fachlich wie die echten Handler. Sein Rückgabetyp ist der aus [`src/preload/index.d.ts`](../../src/preload/index.d.ts) exportierte Typ `API`: Ändert sich dort eine Signatur, schlägt `npm run typecheck` im Fake fehl. Der Vertrag zwischen Renderer und Main wird damit vom Compiler bewacht statt von Disziplin. (Grenze: Ein rein zusätzlicher hinterer Parameter fällt nicht auf, weil TypeScript Funktionen mit weniger Parametern zulässt — diesen Fall fängt der aufrufende Anwendungscode ab.)

**Bedienung ausschließlich über zugängliche Rollen und Beschriftungen**, nie über CSS-Klassen oder Testids. Das ist keine Stilfrage: Ein Feld, das der Screenreader nicht findet, findet der Test auch nicht — die Barrierefreiheits-Mindestanforderungen aus [`design-system.md`](./design-system.md) werden dadurch nebenbei mitgeprüft.

**Testdaten** kommen aus den Fabriken in [`src/test/factories.ts`](../../src/test/factories.ts) (sinnvoller Standardfall plus punktuelle Overrides). Ein Test nennt damit nur die Felder, um die es ihm geht; kommt ein Pflichtfeld zur Entität hinzu, ist genau eine Stelle anzupassen.

**Dateiendungen entscheiden über die Umgebung**: `.test.tsx` und `.dom.test.ts` laufen in jsdom, alles andere in Node. Ein DOM kostet pro Testdatei spürbar Startzeit — deshalb nur dort, wo er gebraucht wird. Die reinen Funktionen unter `renderer/src/lib/` bleiben bewusst auf Ebene 1.

**jsdom-Lücken**: Pointer-Capture-API und `scrollIntoView` fehlen in jsdom; die Radix-Primitives rufen beides beim Öffnen auf. [`src/test/setup.renderer.ts`](../../src/test/setup.renderer.ts) füllt das zentral auf — eine Lücke der Testumgebung, kein Mangel der Komponenten.

**Gehört nicht hierher**: Fachregeln (Ebene 1) und SQL (Ebene 2). Ein Komponententest prüft, ob die Oberfläche das Ergebnis richtig anzeigt und weiterreicht, nicht ob das Ergebnis stimmt.

## Ebene 4 — IPC-Vertrag

Renderer und Main sind nur über Kanalnamen verbunden — eine Verbindung, die weder der Compiler noch ein Fachtest prüfen kann. [`src/shared/ipcKanaele.ts`](../../src/shared/ipcKanaele.ts) ist deshalb die einzige Quelle dieser Namen; Preload und Handler greifen beide darauf zu, statt denselben String zweimal zu schreiben.

[`ipcVertrag.test.ts`](../../src/main/ipc/ipcVertrag.test.ts) registriert alle Handler gegen ein `ipcMain`-Doppel und vergleicht das Ergebnis mit der Deklaration. Nachweislich erkannt werden (beide Fälle gegengeprüft):

- ein Kanal ist deklariert und im Preload benutzt, aber kein Handler registriert
- ein Handler ist registriert, den niemand deklariert hat
- ein Kanal wird doppelt registriert

Eine Umbenennung in `IPC_KANAELE` erkennt der Test bewusst nicht: Sie bewegt beide Seiten gleichzeitig. Diese Fehlerklasse ist durch die zentrale Konstante beseitigt, statt abgefangen zu werden.

## Ebene 5 — E2E-Smoke-Suite

Playwright startet über `_electron.launch` die **gebaute** App (`out/main/index.js`). Hier gehört nur hin, was sich ausschließlich im Zusammenspiel aller drei Prozesse zeigt.

**Datenisolation**: [`e2e/appStart.ts`](../../e2e/appStart.ts) übergibt ein frisches `--user-data-dir` je Lauf. Ohne das würde `db.ts` über `app.getPath('userData')` die echte Datenbank des Nutzers öffnen — ein Test darf niemals Produktivdaten anfassen. Dasselbe Verzeichnis lässt sich an einen zweiten Start übergeben, um Persistenz über einen Neustart hinweg zu prüfen.

**Aktueller Umfang** ([`app.e2e.test.ts`](../../e2e/app.e2e.test.ts), [`druckausgabe.e2e.test.ts`](../../e2e/druckausgabe.e2e.test.ts)):

| Fall                    | Prüft                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| Anwendungsstart         | Fenster öffnet, Startseite zeigt die drei Navigations-Cards          |
| Prozessgrenze           | Renderer hat weder `require` noch `process`, nur `window.api`        |
| Durchstich mit Neustart | Renderer → IPC → SQLite → Datei auf Platte → nach Neustart wieder da |
| Druckausgabe            | `printToPDF` liefert eine A4-Seite mit allen Mitarbeiterspalten      |
| Seitenzählung           | sichert die PDF-Auswertung selbst ab                                 |

**Kein zweiter Testrunner**: Die Fälle laufen als gewöhnliche Vitest-Tests mit der `playwright`-Bibliothek, nicht über `@playwright/test`. Das kostet die web-first-Assertions (`toBeVisible` & Co.) — stattdessen `locator.waitFor()` und danach eine gewöhnliche Vitest-Assertion.

**Gehört nicht hierher**: Fachlogik-Abdeckung. Jeder Fall auf dieser Ebene kostet Sekunden statt Millisekunden und bricht bei jeder Layout-Änderung.

### Automatisierte Druckprüfung

Der native Windows-Druckdialog lässt sich nicht automatisieren — das Druckergebnis sehr wohl. `webContents.printToPDF` im Main-Prozess erzeugt exakt die Ausgabe, die auch bei „Microsoft Print to PDF" entsteht. [`e2e/pdf.ts`](../../e2e/pdf.ts) wertet sie mit `pdfjs-dist` aus (Seitenzahl und Text).

Warum kein eigener Regex über die PDF-Streams: Chromium bettet Schriften als Teilmengen mit eigener Kodierung ein, ein naiver Ansatz liefert Binärmüll aus den Bilddaten. `pdfjs-dist` wertet die ToUnicode-Tabellen korrekt aus und ist derselbe Parser, mit dem der Nutzer die Datei später ansieht.

Damit ist die zentrale Zusage von Schritt 17 — „der Dienstplan passt vollständig auf eine A4-Seite" — erstmals maschinell prüfbar: eine Seite **und** alle Mitarbeiterspalten **und** alle Tage des Monats. Nur alle drei zusammen bedeuten „nichts abgeschnitten"; eine einzelne Seite allein wäre auch dann erreicht, wenn der Rest wegfiele.

Manuell bleibt danach nur noch, dass der Dialog überhaupt aufgeht und ein realer Drucker angesprochen wird.

---

## Konventionen

| Thema           | Regel                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Ablage          | Testdatei liegt neben dem geprüften Modul (`x.ts` ↔ `x.test.ts`), E2E getrennt unter `e2e/`                  |
| Benennung       | Deutsch, beschreibt das Verhalten: „gibt eine leere Liste zurück, wenn noch kein Mitarbeiter angelegt wurde" |
| Aufbau          | Arrange/Act/Assert, ohne die Abschnitte zu kommentieren                                                      |
| Testdaten       | Fabriken statt Objektliteralen, nur die relevanten Felder nennen                                             |
| Imports         | `describe`/`it`/`expect` explizit aus `vitest` (kein `globals: true`)                                        |
| Bekannte Mängel | `it.fails` mit Begründung und Verweis auf den behebenden Schritt — nie ein auskommentierter Test             |

### Gegenproben

Ein Test, der nie fehlschlägt, ist kein Prüfsignal. Nach dem Schreiben eines Tests, der eine neue Fehlerklasse abdecken soll, wird die geprüfte Eigenschaft einmal absichtlich verletzt und bestätigt, dass der Test rot wird — danach wird die Verletzung zurückgenommen. Für die Ebenen 3 und 4 ist das beim Aufbau geschehen und in den jeweiligen Testdateien vermerkt.

### `it.fails` für bekannte Mängel

`it.fails` kehrt die Erwartung um: Der Test gilt als bestanden, solange er fehlschlägt, und **schlägt fehl, sobald er bestehen würde**. Das ist der richtige Platz für einen Mangel, der bekannt ist und dessen Behebung geplant ist: Die Suite bleibt grün, der Mangel ist dokumentiert statt vergessen, und der Test kann nicht stillschweigend veralten — sobald die Behebung greift, erzwingt der Fehlschlag das Entfernen der Markierung.

Aktuell so markiert: die Vollständigkeit der Druckseite (der letzte Tag des Monats fehlt heute in der Ausgabe, weil die Ansicht aus Schritt 16 ein Scrollcontainer ist). Wird mit Schritt 17 behoben.

### Coverage

`npm run test:coverage` erzeugt einen Bericht. Er dient dem Auffinden blinder Flecken, **nicht** als Zielwert — eine Prozentzahl sagt nichts darüber, ob die richtigen Dinge geprüft werden. Die shadcn-Primitives unter `components/ui/` sind ausgenommen, sie sind übernommener Fremdcode.

---

## Bewusst nicht getestet

| Bereich                      | Begründung                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------- |
| Native Dialoge               | Druck- und Dateidialoge des Betriebssystems sind nicht automatisierbar                |
| `electron-builder`-Installer | Wird selten geändert; ein Fehler zeigt sich beim ersten manuellen Installationslauf   |
| Chromium-Rendering selbst    | Kein Snapshot-/Pixelvergleich — siehe unten                                           |
| shadcn-Primitives            | Übernommener Fremdcode, wird über die Komponententests der Fachkomponenten mitgeprüft |

**Keine Snapshot-Tests.** Bei einer Tabelle mit 31 Zeilen mal n Mitarbeitern erzeugen sie riesige, ungelesene Dateien und werden bei jedem Layout-Detail blind aktualisiert — sie melden Veränderung, nicht Fehler.

---

## Vorgeschichte: Screenshot-Vergleich

Bis zur Einführung von Ebene 3 und 5 gab es keine automatisierten UI-Tests. Stattdessen wurde die Oberfläche über Screenshots geprüft, in drei Ausbaustufen:

1. **Schritt 1**: Screenshots von Hand (Fenster- und IPC-Test bestätigt)
2. **Schritte 4/5**: `playwright-core` temporär per `npm install --no-save` installiert, die gebaute App über die `_electron`-API bedient, danach wieder deinstalliert
3. **Ab Schritt 6**: `electron-vite dev --remoteDebuggingPort 9222` plus ein Node-Skript gegen das Chrome-DevTools-Protocol (`Runtime.evaluate`, `Page.captureScreenshot`), ohne zusätzliche Abhängigkeit

Diese Verfahren sind **abgelöst**. Keines lag im Repository, keines lief wiederholbar, keines schlug fehl, wenn etwas kaputtging — es waren Hilfsmittel zur Sichtprüfung, kein Testtyp. Ebene 5 leistet dasselbe dauerhaft und prüfbar, insbesondere für die Druckausgabe.

Für eine schnelle Sichtprüfung während der Entwicklung bleibt der Weg über die laufende Dev-Instanz weiter sinnvoll. Dabei gilt unverändert: **nicht bei jeder Prüfung eine neue Dev-Instanz starten**, sondern die ohnehin laufende weiterverwenden — beim Aufräumen mehrerer paralleler Instanzen besteht sonst das reale Risiko, die Instanz des Nutzers mit zu beenden (`Get-Process electron | Select Id, StartTime` hilft bei der Zuordnung). Für reine Renderer-Änderungen ohne Layout-Risiko genügt oft `npm run typecheck`/`npm run lint` plus Sichtprüfung im ohnehin offenen Fenster, da Vite-HMR automatisch aktualisiert.
