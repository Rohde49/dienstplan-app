# Projektstruktur

Wo welcher Code liegt und warum. Die Trennung zwischen Main-Prozess (Node.js, Dateisystem und SQLite) und Renderer (React, reine Darstellung) gibt Electron architektonisch vor — die Regeln für diese Grenze stehen in [`prozessgrenzen.md`](./prozessgrenzen.md). Hier geht es um die Gliederung innerhalb der Prozesse.

Diese Datei ist zweimal hinter dem Code zurückgeblieben, weil sie den Stand in Prosa beschrieb. Sie führt deshalb bewusst nur noch **Ordner und Zuständigkeiten**, keine Dateilisten, die mit jedem Schritt altern.

## Ordner und ihre Zuständigkeit

| Ordner                                | Zuständig für                                                    | Darf importieren                          |
| ------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------- |
| `src/main/`                           | Main-Prozess: Fenster, App-Lebenszyklus, DB-Verbindung           | `electron`, `better-sqlite3`, `shared/`   |
| `src/main/db/`                        | ein Repository je Fachbereich, gesamter SQL-Zugriff              | `shared/`, **nicht** `../db`              |
| `src/main/ipc/`                       | ein Handler-Modul je Fachbereich, Verdrahtung Repository ↔ Kanal | `electron`, `../db`, `../db/*`, `shared/` |
| `src/preload/`                        | Brücke: `index.ts` exponiert, `index.d.ts` typisiert den Vertrag | `electron`, `shared/`                     |
| `src/shared/`                         | Entitäten und **plattformunabhängige** reine Funktionen          | nichts Prozessgebundenes                  |
| `src/renderer/src/pages/`             | eine Datei je Route, hält den Seitenzustand                      | alles im Renderer, `shared/`              |
| `src/renderer/src/components/ui/`     | shadcn-Primitives, fachlich unwissend                            | nur `lib/utils`, Radix                    |
| `src/renderer/src/components/layout/` | seitenübergreifende Layout-Bausteine                             | siehe Abweichung unten                    |
| `src/renderer/src/components/`        | fachspezifische Komponenten eines einzelnen Bereichs             | alles im Renderer, `shared/`              |
| `src/renderer/src/lib/`               | reine Funktionen, die **nur** der Renderer braucht               | `shared/`                                 |
| `src/renderer/src/assets/`            | globale CSS-Dateien und Bilder                                   | —                                         |
| `src/test/`                           | Testhilfen für alle Ebenen (kein Produktivcode)                  | alles                                     |
| `e2e/`                                | Playwright-Tests gegen die **gebaute** App                       | `playwright`, `pdfjs-dist`                |

Die Dreiteilung von `components/` (`ui/` – `layout/` – fachspezifisch) hat sich ab dem zweiten Fachbereich als tragfähig erwiesen und gilt seitdem als Muster für weitere Bereiche.

## `shared/` oder `renderer/src/lib/`?

Beides sind Ordner für reine Funktionen; sie unterscheiden sich nur darin, wer sie braucht.

| Frage                                            | Ablage                   |
| ------------------------------------------------ | ------------------------ |
| Braucht der Main-Prozess die Funktion auch?      | `src/shared/`            |
| Nur der Renderer, und sie kennt keine React-API? | `src/renderer/src/lib/`  |
| Sie liest oder rendert DOM?                      | gehört in die Komponente |

Ein Import aus `shared/` zurück nach `renderer/src/lib/` ist ausgeschlossen: Der `typecheck:node`-Lauf schließt `renderer/` bewusst nicht ein und würde brechen. Die Richtung ist deshalb immer `renderer → shared`, nie umgekehrt. Aus genau diesem Grund sind mehrere Funktionen im Lauf des Projekts von `lib/` nach `shared/` gewandert (Kalendertage, Zeitformatierung, Planeintrag-Schlüssel, Rundung) — jeweils per `git mv`, sobald der Main-Prozess sie ebenfalls brauchte.

`shared/types.ts` ist ausschließlich für Entitäten und Konstanten da. Plattformunabhängige Funktionen bekommen eine eigene Datei daneben, sie werden nicht in `types.ts` angehängt.

## Wo Fachlogik liegt

**Fachlogik gehört in reine Funktionen, nicht in Komponenten.** Sobald eine React-Komponente anfängt, fachliche Regeln selbst zu prüfen statt nur Anzeigezustand zu verwalten, gehört die Regel in eine Funktion unter `shared/` oder `lib/`. Das ist die Voraussetzung dafür, dass Ebene 1 der [Teststrategie](../test/teststrategie.md) überhaupt so tragfähig ist.

**Der Renderer bleibt trotzdem „dumm" gegenüber Daten**: Er ruft über die Preload-API ab, zeigt an und schickt Formulareingaben zurück. Er baut keine SQL-Abfragen und kennt `better-sqlite3` nicht.

> ⚠️ Zu prüfen: Eine frühere Fassung dieser Datei verlangte, Fachlogik gehöre „in den Main-Prozess, dicht bei den Repositories". Das beschreibt den Code nicht: Sämtliche Validierung (`validateTeamMember`, `validateEintragsdefinition`, `validateBemerkung`) liegt im Renderer, die Berechnungen liegen in `shared/`, und der Main-Prozess validiert **nichts**. Für die Kennzahlen ist das eine bewusste Entscheidung (sie müssen live aus dem noch ungespeicherten Entwurf rechnen, den der Main-Prozess nicht kennt). Für die Eingabevalidierung ist es keine Entscheidung, sondern gewachsen — siehe den Eintrag in [`test/offene-maengel.md`](../test/offene-maengel.md).

## Reihenfolge für einen neuen Fachbereich

Die Repository-Funktionen sind die Naht, an der die UI vom SQL entkoppelt wird: Die UI wird gegen die Funktionssignatur gebaut, nicht gegen die Datenbank. Wird die Funktion später auf echtes SQL umgestellt, ändert sich für den Renderer nichts.

1. Entität(en) in `shared/types.ts` entwerfen
2. Reine Funktionen (Validierung, Berechnung) anlegen — mit Tests, bevor irgendeine UI existiert
3. Repository-Funktionssignaturen festlegen, zunächst mit Testdaten im Speicher gefüllt
4. Kanalnamen in `shared/ipcKanaele.ts` ergänzen, IPC-Handler und Preload-API nachziehen
5. UI gegen die Repository-Funktionen bauen
6. Repository auf echte SQLite-Anbindung umstellen
7. Repository-Tests gegen In-Memory-SQLite
8. Gesamtverifikation

Schritt 3 und 6 getrennt zu halten, hat sich mehrfach bewährt: Solange Testdaten im Speicher liegen, beweist ein App-Neustart nichts über Persistenz. Der Neustart-Test gehört deshalb hinter Schritt 6, nicht davor.

## Bekannte Abweichungen

- **`PlanungsGrid` und `VerkuerzteAnsicht` liegen in `layout/`, sind aber fachlich wissend.** Sie importieren `TeamMember`, `Kalendertag` und die Kennzahlen-Berechnung und widersprechen damit der Definition von `layout/` als „fachlich unwissend". Ein Verschieben wurde zurückgestellt, weil Schritt 17 `VerkuerzteAnsicht` ohnehin umbaut — die Einordnung wird dort mitentschieden.
- **`FehlerHinweis` liegt direkt unter `components/`, ist aber der umgekehrte Fall: fachlich unwissend und seitenübergreifend.** Sie zeigt Fehler aus der Preload-Bridge unabhängig vom Fachbereich an und importiert keine Fachtypen — passt der Definition nach eher zu `layout/`. Landete am 17.08.2026 trotzdem direkt unter `components/`, weil sie kein Layout im eigentlichen Sinn ist (kein Rahmen um Seiteninhalt, sondern eine global eingehängte Anzeige). Keine Korrektur geplant, nur benannt.
- **`src/main/db.ts` blieb eine eigenständige Datei** neben dem Ordner `src/main/db/`, statt zu `db/index.ts` zu werden. Kein Umbau geplant; die Trennung „Verbindung hier, Repositories dort" ist eindeutig genug.

> ⚠️ Zu prüfen: Reste des `electron-vite`-Templates sind nirgends importiert und damit toter Code — `assets/electron.svg`, `assets/wavy-lines.svg` und der `ping`-Kanal in `src/main/index.ts`. Auch `runDbSmokeTest()` in `src/main/db.ts` stammt aus Schritt 1 und schreibt bei **jedem** App-Start eine Zeile in eine Tabelle `smoke_test`, die fachlich niemand liest. Alles ließe sich gefahrlos entfernen, ist aber nie beauftragt worden. Registriert in [`test/offene-maengel.md`](../test/offene-maengel.md).

Die ursprüngliche Ordner-Skizze von vor Schritt 4 (noch mit den Altnamen `ShiftType`/`PlanEntry` und einem gemeinsamen `planRepository.ts`) ist nur noch historisch und steht im [Tagebuch](../tagebuch/2026-kw33.md), Eintrag vom 11.08.2026.
