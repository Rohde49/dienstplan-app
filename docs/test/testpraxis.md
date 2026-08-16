# Testpraxis

Wie ein Test in diesem Projekt konkret geschrieben wird. **Welche** Ebene für eine Frage zuständig ist, steht in [`teststrategie.md`](./teststrategie.md) — diese Datei setzt voraus, dass die Ebene schon feststeht.

## Konventionen

| Thema           | Regel                                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| Ablage          | Testdatei liegt neben dem geprüften Modul (`x.ts` ↔ `x.test.ts`), E2E getrennt unter `e2e/`                  |
| Benennung       | Deutsch, beschreibt das Verhalten: „gibt eine leere Liste zurück, wenn noch kein Mitarbeiter angelegt wurde" |
| Aufbau          | Arrange/Act/Assert, ohne die Abschnitte zu kommentieren                                                      |
| Testdaten       | Fabriken statt Objektliteralen, nur die relevanten Felder nennen                                             |
| Imports         | `describe`/`it`/`expect` explizit aus `vitest` (kein `globals: true`)                                        |
| Umgebung        | `.test.tsx` und `.dom.test.ts` → jsdom, alles andere → Node                                                  |
| Bekannte Mängel | `it.fails` mit Begründung und Verweis auf den behebenden Schritt — nie ein auskommentierter Test             |

## Testhilfen unter `src/test/`

Kein Produktivcode, aber von beiden tsconfigs erfasst — sonst wäre die Typabsicherung unten wirkungslos.

| Datei                                                   | Zweck                                                                                               |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`apiFake.ts`](../../src/test/apiFake.ts)               | `window.api`-Ersatz, hält Daten im Speicher, verhält sich fachlich wie die echten Handler           |
| [`datenbank.ts`](../../src/test/datenbank.ts)           | `erzeugeTestDatenbank()` — In-Memory-SQLite, Schema über dieselben `ensure…`-Funktionen wie die App |
| [`factories.ts`](../../src/test/factories.ts)           | Testdaten-Fabriken: sinnvoller Standardfall plus punktuelle Overrides                               |
| [`setup.renderer.ts`](../../src/test/setup.renderer.ts) | jsdom-Setup inklusive der Polyfills, die Radix braucht                                              |

**Warum das Fake seinen Typ aus dem Preload bezieht:** Der Rückgabetyp von `apiFake.ts` ist die aus [`src/preload/index.d.ts`](../../src/preload/index.d.ts) exportierte `interface API`. Ändert sich dort eine Signatur, bricht der Typecheck im Fake — der Vertrag wird vom Compiler bewacht statt von Disziplin. Details in [`architektur/prozessgrenzen.md`](../architektur/prozessgrenzen.md).

**Warum Fabriken statt Objektliteralen:** Ein Test nennt nur die Felder, um die es ihm geht. Kommt ein Pflichtfeld zur Entität hinzu, ist genau eine Stelle anzupassen statt jeder Testdatei.

## Gegenproben

**Ein Test, der nie fehlschlägt, ist kein Prüfsignal.** Nach dem Schreiben eines Tests, der eine neue Fehlerklasse abdecken soll:

1. die geprüfte Eigenschaft im Produktivcode absichtlich verletzen
2. bestätigen, dass der Test rot wird
3. die Verletzung zurücknehmen

Für die Ebenen 3 und 4 ist das beim Aufbau geschehen und in den jeweiligen Testdateien vermerkt.

Eine Gegenprobe kann auch etwas _anderes_ zeigen, als man erwartet hat, und das ist wertvoll: Der Versuch, einen Kanalnamen in `IPC_KANAELE` umzubenennen, machte den Vertragstest **nicht** rot — zu Recht, weil beide Seiten dieselbe Konstante lesen. Die Fehlerklasse war durch die Zentralisierung beseitigt statt abgefangen. Erst diese Erkenntnis führte zu den drei Fällen, die der Test tatsächlich prüft.

## `it.fails` für bekannte Mängel

`it.fails` kehrt die Erwartung um: Der Test gilt als bestanden, solange er fehlschlägt, und **schlägt fehl, sobald er bestehen würde**.

Das ist der richtige Platz für einen Mangel, der bekannt ist und dessen Behebung geplant ist: Die Suite bleibt grün, der Mangel ist dokumentiert statt vergessen, und der Test kann nicht stillschweigend veralten — sobald die Behebung greift, erzwingt der Fehlschlag das Entfernen der Markierung.

Jeder `it.fails`-Eintrag gehört zusätzlich ins Register [`offene-maengel.md`](./offene-maengel.md), sonst ist er nur im Code auffindbar.

## Coverage

`npm run test:coverage` erzeugt einen Bericht. Er dient dem Auffinden blinder Flecken, **nicht** als Zielwert — eine Prozentzahl sagt nichts darüber, ob die richtigen Dinge geprüft werden. Die shadcn-Primitives unter `components/ui/` sind ausgenommen, sie sind übernommener Fremdcode.

## Rezepte

Wiederkehrende Fälle, die beim ersten Mal Zeit gekostet haben.

**jsdom kennt Pointer-Capture und `scrollIntoView` nicht.** Die Radix-Primitives rufen beides beim Öffnen von `Select` und `AlertDialog` auf. `setup.renderer.ts` füllt das zentral auf — eine Lücke der Testumgebung, kein Mangel der Komponenten. Bei einem neuen Radix-Primitive, das im Test „einfach nichts tut", zuerst dort nachsehen.

**Zwei Vitest-Projekte, aufgeteilt über die Dateiendung.** Der erste Versuch ließ alle Renderer-Tests in jsdom laufen: Laufzeit sprang von unter 2 s auf 42,8 s, weil auch die reinen Funktionen unter `renderer/src/lib/` ein DOM hochfuhren. Ein DOM kostet spürbar Startzeit pro Datei. Eine Suite, die nach jeder Änderung zumutbar ist, ist mehr wert als eine einheitliche Regel.

**Repository-Tests bauen ihre Daten über den Anwendungspfad auf**, nicht über rohe `INSERT`s — also `createDienstplan()` und `speicherePlanungsstand()` statt handgeschriebenem SQL. Damit prüft der Test dieselben Wege, die die App nimmt, inklusive der Fremdschlüsselkette. Ausnahme sind Fälle, die der Anwendungspfad gar nicht herbeiführen kann: Den `UNIQUE`-Constraint auf `rufbereitschaften.dienstplantagId` prüft ein direkter Roh-`INSERT`, weil die Delete-dann-Insert-Logik ihn nie verletzen würde.

**PDF-Auswertung nur über `pdfjs-dist`.** Ein eigener Regex über die PDF-Streams liefert Binärmüll: Chromium bettet Schriften als Teilmengen mit eigener Kodierung ein. `pdfjs-dist` wertet die ToUnicode-Tabellen korrekt aus und ist derselbe Parser, mit dem der Nutzer die Datei später ansieht.

**E2E-Läufe brauchen ein eigenes `--user-data-dir`.** Ohne das öffnet `db.ts` über `app.getPath('userData')` die echte Datenbank des Nutzers. Ein Test darf niemals Produktivdaten anfassen. Dasselbe Verzeichnis lässt sich bewusst an einen zweiten Start weiterreichen, um Persistenz über einen Neustart hinweg zu prüfen.

**Keine web-first-Assertions in E2E.** Die Fälle laufen als gewöhnliche Vitest-Tests mit der `playwright`-Bibliothek, nicht über `@playwright/test`. Statt `toBeVisible()` also `locator.waitFor()` und danach eine gewöhnliche Assertion.

## Sichtprüfung während der Entwicklung

Kein Ersatz für einen Test (siehe [`teststrategie.md`](./teststrategie.md)), aber weiterhin sinnvoll, um ein Layout zu beurteilen. Dabei gilt:

- **Nicht bei jeder Prüfung eine neue Dev-Instanz starten**, sondern die ohnehin laufende weiterverwenden. Beim Aufräumen mehrerer paralleler Instanzen besteht sonst das reale Risiko, die Instanz des Nutzers mit zu beenden; `Get-Process electron | Select Id, StartTime` hilft bei der Zuordnung.
- Für reine Renderer-Änderungen genügt oft `npm run typecheck`/`npm run lint` plus ein Blick ins ohnehin offene Fenster — Vite-HMR aktualisiert selbst.
- **Main-Prozess-Änderungen übernimmt der Watcher nicht zuverlässig.** Wer `src/main/` angefasst hat und das Ergebnis sehen will, startet die Instanz neu — sonst prüft man den alten Main-Prozess.
