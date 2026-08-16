# TODO

Was offen ist. Abgeschlossenes steht in [`erledigt.md`](./erledigt.md), die Begründungen im [Tagebuch](./tagebuch), die Umsetzungspläne unter [`ablaufplaene/`](./ablaufplaene).

Gegliedert nach Zustand und Bereich, nicht nach Schrittnummer: Der aktuelle Schritt steht oben, alles Weitere darunter nach Themen. Jeder Punkt steht **genau einmal** — was im Mängelregister steht, wird hier nur verlinkt.

## Aktueller Schritt

### Schritt 17: Druckvorschau/Drucken

Baut `VerkuerzteAnsicht.tsx` zu `DruckAnsicht.tsx` um: statt einer scrollbaren Kompakttabelle eine dauerhaft live skalierte, exakte A4-Hochformat-Vorschau (zwei getrennte Skalierungsebenen — Inhalts-Skalierung auf die physische Seite, davon unabhängig ein rein optischer Außen-Zoom fürs Panel), inklusive Dienstplan-Titel als Kopfzeile. Der „Drucken"-Button löst darauf `window.print()` aus (nativer Windows-Dialog, kein neuer IPC-Kanal). Kein Signaturblock in diesem Schritt.

Ablaufplan: [`ablaufplaene/schritt17-druckvorschau-drucken.md`](./ablaufplaene/schritt17-druckvorschau-drucken.md)

- [ ] Umbenennung `VerkuerzteAnsicht.tsx` → `DruckAnsicht.tsx`, A4-Flächen-Grundgerüst, Titel-Kopfzeile
- [ ] Reine Skalierungsfunktion (`berechneDruckSkalierungsfaktor`) inkl. Unit-Tests
- [ ] Live Inhalts-Skalierung verdrahten (auf eine A4-Seite, unabhängig von der Fenstergröße)
- [ ] Live Außen-Zoom verdrahten (Panel-Anpassung per `ResizeObserver`, rein optisch)
- [ ] Print-Stylesheet und „Drucken"-Button aktivieren
- [ ] **Früh prüfen, nicht am Ende:** einmal manuell über „Drucken" als PDF exportieren — nur der native Dialog bleibt unautomatisierbar
- [ ] Gesamtverifikation (`npm run typecheck`, `npm run lint`, `npm run test`, `npm run test:e2e`)
- [ ] `.fails` in `e2e/druckausgabe.e2e.test.ts` entfernen und den Eintrag aus [`test/offene-maengel.md`](./test/offene-maengel.md) streichen — der Test schlägt sonst fehl, sobald er bestehen würde
- [ ] Doku nachziehen (`/doku-pflege`): Schritt nach `erledigt.md`, Tagebucheintrag, Ablaufplan nach `ablaufplaene/erledigt/`

## Fachfunktionen

- [ ] **Signaturblock „Freigabe und Unterschrift"** auf der Druckausgabe. Stammt aus dem Mockup zu Schritt 16, wurde aus Schritt 17 bewusst herausgenommen. Erst sinnvoll, wenn die A4-Fläche steht.

## Technik und Infrastruktur

- [ ] **Packaging mit `electron-builder`** (Windows-Installer über `npm run build:win`). Der letzte geplante Schritt des Projekts.
- [ ] **`electron-builder.yml` steht noch auf Template-Stand** — `productName: electron-scaffold-tmp`, mac-/linux-Targets, `publish`-URL auf `example.com`. Gehört zum Packaging-Schritt.
- [ ] **CI-Workflow** `.github/workflows/ci.yml`: `lint`, `typecheck`, `test` bei Push und PR, dazu `build` und `test:e2e` auf einem Windows-Runner. Größter verbleibender Einzelzugewinn — bis dahin laufen alle Prüfungen nur, wenn jemand daran denkt.
- [ ] **Hooks für Prettier und gezielten Typecheck** nach `Edit`/`Write`, siehe [`workflow/setup-empfehlungen.md`](./workflow/setup-empfehlungen.md), Abschnitt 3.
- [ ] **Skills `schritt-start` und `schritt-abschluss`** — der am häufigsten wiederholte Ablauf im Projekt.
- [ ] **Permission-Allowlist** in `.claude/settings.json` für die harmlosen npm-Skripte.

## Dokumentation

- [ ] **Nach Schritt 17: `VerkuerzteAnsicht` → `DruckAnsicht` in der Doku nachziehen.** Betroffen sind [`architektur/auswertung.md`](./architektur/auswertung.md) (Spalte in der Ansichtstabelle) und [`style/design-system.md`](./style/design-system.md) (bekannte Abweichungen, geteilte Darstellungslogik).
- [ ] **Die `> ⚠️ Zu prüfen:`-Markierungen abarbeiten**, die beim Doku-Umbau gesetzt wurden. Jede benennt eine Stelle, an der die Doku den Ist-Zustand beschreibt, aber eine Entscheidung aussteht.

## Bekannte Mängel

Vollständig im Register [`test/offene-maengel.md`](./test/offene-maengel.md). Kurz:

| Mangel                                    | Prüfsignal        | Behebung          |
| ----------------------------------------- | ----------------- | ----------------- |
| Druck verliert den letzten Tag des Monats | `it.fails` in E2E | Schritt 17        |
| Main-Prozess validiert keine Eingabe      | keines            | zu entscheiden    |
| `electron-builder.yml` auf Template-Stand | keines            | mit dem Packaging |
| Toter Scaffold-Code                       | keines            | siehe „Ideen"     |

## Ideen und Später

Unpriorisiert, nichts davon ist zugesagt.

- **„Inaktiv setzen" statt Löschen für `TeamMember`.** Das eigentlich passende Werkzeug für ausscheidende Mitarbeiter mit Planungshistorie — bei der Team-Verwaltung bewusst nicht eingeführt.
- **Toten Scaffold-Code entfernen**: `Versions.tsx`, `electron.svg`, `wavy-lines.svg` und `runDbSmokeTest()`, das bei jedem App-Start eine Zeile in eine Tabelle schreibt, die niemand liest.
- **Subagent `ipc-pruefer`** für die Architekturregel, die kein automatisches Prüfsignal hat.
- **MCP-Server `context7`** für verlässliche Doku zu Tailwind v4, React 19 und Electron 39.
- **`docs/`-Markdown als Word- oder PDF-Abgabe** für das Studienprojekt.
