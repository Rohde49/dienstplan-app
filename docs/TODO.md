# TODO

Was offen ist. Abgeschlossenes steht in [`erledigt.md`](./erledigt.md), die Begründungen im [Tagebuch](./tagebuch), die Umsetzungspläne unter [`ablaufplaene/`](./ablaufplaene).

Gegliedert nach Zustand und Bereich, nicht nach Schrittnummer: Der aktuelle Schritt steht oben, alles Weitere darunter nach Themen. Jeder Punkt steht **genau einmal** — was im Mängelregister steht, wird hier nur verlinkt.

## Aktueller Schritt

Kein Schritt aktuell in Arbeit.

## Fachfunktionen

- [ ] **PDF-Export**: Live skalierte A4-Druckvorschau des Dienstplans, Drucken über den nativen Windows-Dialog.
- [ ] **Signaturblock „Freigabe und Unterschrift"** auf der Druckausgabe. Stammt aus dem Mockup zu Schritt 16, wurde aus Schritt 17 bewusst herausgenommen. Erst sinnvoll, wenn die A4-Fläche steht.

## Technik und Infrastruktur

- [ ] **Packaging mit `electron-builder`** (Windows-Installer über `npm run build:win`). Der letzte geplante Schritt des Projekts. `electron-builder.yml` ist seit dem 17.08.2026 auf das Projekt umgestellt und `build:unpack` erzeugt ein korrekt benanntes Paket — offen ist der signierte Installer selbst.
- [ ] **Hooks für Prettier und gezielten Typecheck** nach `Edit`/`Write`, siehe [`workflow/setup-empfehlungen.md`](./workflow/setup-empfehlungen.md), Abschnitt 3.
- [ ] **Skills `schritt-start` und `schritt-abschluss`** — der am häufigsten wiederholte Ablauf im Projekt.

## Dokumentation

- [ ] **Nach dem PDF-Export: `VerkuerzteAnsicht` → `DruckAnsicht` in der Doku nachziehen.** Betroffen sind [`architektur/auswertung.md`](./architektur/auswertung.md) (Spalte in der Ansichtstabelle) und [`style/design-system.md`](./style/design-system.md) (bekannte Abweichungen, geteilte Darstellungslogik).
- [ ] **Die `> ⚠️ Zu prüfen:`-Markierungen abarbeiten**, die beim Doku-Umbau gesetzt wurden. Jede benennt eine Stelle, an der die Doku den Ist-Zustand beschreibt, aber eine Entscheidung aussteht.

## Bekannte Mängel

Vollständig im Register [`test/offene-maengel.md`](./test/offene-maengel.md). Kurz:

| Mangel                                    | Prüfsignal        | Behebung       |
| ----------------------------------------- | ----------------- | -------------- |
| Druck verliert den letzten Tag des Monats | `it.fails` in E2E | PDF-Export     |
| Main-Prozess validiert keine Eingabe      | keines            | zu entscheiden |
| Toter Scaffold-Code                       | keines            | siehe „Ideen"  |

## Ideen und Später

Unpriorisiert, nichts davon ist zugesagt.

- **„Inaktiv setzen" statt Löschen für `TeamMember`.** Das eigentlich passende Werkzeug für ausscheidende Mitarbeiter mit Planungshistorie — bei der Team-Verwaltung bewusst nicht eingeführt.
- **Toten Scaffold-Code entfernen**: `electron.svg`, `wavy-lines.svg`, den `ping`-Kanal und `runDbSmokeTest()`, das bei jedem App-Start eine Zeile in eine Tabelle schreibt, die niemand liest. (`Versions.tsx` ist am 17.08.2026 entfallen — es war die Voraussetzung für `sandbox: true`.)
- **Subagent `ipc-pruefer`** für die Architekturregel, die kein automatisches Prüfsignal hat.
- **MCP-Server `context7`** für verlässliche Doku zu Tailwind v4, React 19 und Electron 39.
- **`docs/`-Markdown als Word- oder PDF-Abgabe** für das Studienprojekt.
