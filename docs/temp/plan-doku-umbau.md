# Plan: Doku-Ordnersystem einführen, Inhalte umsortieren, Pflege absichern

> Vorgesehen für eine **neue Sitzung** (vom Nutzer so entschieden). Der Startprompt steht am Ende dieser Datei.

## Context

Der `docs/`-Ordner ist inhaltlich stark, aber strukturell gewachsen statt geplant. Der Nutzer hat manuell vier leere Ordner angelegt — `ablaufplaene/erledigt/`, `style/`, `test/`, `temp/` — und wünscht daraus ein durchdachtes, koordiniertes System.

**Ist-Zustand:** 26 Dateien, 2 Ebenen, alles Fachliche unter `architektur/` gesammelt.

| Problem                                                                                   | Auswirkung                                                                  |
| ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `entwicklungstagebuch.md` mit 406 Zeilen, wächst mit jedem Schritt                          | Nicht navigierbar; wertvolle Begründungen sind faktisch nicht auffindbar      |
| `TODO.md` mit 239 Zeilen, davon ~90 % abgehakt                                              | Der aktuelle Stand geht zwischen 16 erledigten Schritten unter                |
| `architektur/` sammelt Datenmodell, Styling, Design-System und Teststrategie gleichzeitig   | Vier verschiedene Themen unter einem Dach; die neuen Ordner sind die Antwort  |
| 14 Ablaufpläne im selben Ordner, 13 davon erledigt                                          | Der eine aktuelle Plan (Schritt 17) ist nicht erkennbar                       |
| Doku-Aktualität hängt allein an manuellen „Dokumentationsdurchgängen"                       | Laut Tagebuch dreimal nötig geworden, jedes Mal mit gefundenen Abweichungen   |

**Zielbild:** thematisch getrennte Bereiche, kurze Einstiegsdatei, ausgelagerte Historie — und ein Mechanismus, der die Pflege nicht der Disziplin überlässt.

### Vom Nutzer entschieden

| Frage         | Entscheidung                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------- |
| Tagebuch      | Aufteilen — **nach Kalenderwochen** (`docs/tagebuch/2026-kw33.md`), plus Wochenindex            |
| TODO          | Nach Zustand + Bereich; Erledigtes wandert nach `docs/erledigt.md`                              |
| Doku-Pflege   | Skill `/doku-pflege` **plus** Stop-Hook als Erinnerung (nie blockierend)                        |
| Sitzung       | Neue Sitzung                                                                                    |

---

## Zielstruktur

```
docs/
├── README.md                       Wegweiser — einzige Einstiegsdatei, kurz
├── TODO.md                         Aktueller Schritt + offene Punkte je Themenbereich
├── erledigt.md                     Abgeschlossene Schritte 1–16 (aus TODO ausgelagert)
│
├── architektur/                    Was & warum — fachliche Entscheidungen
│   ├── technologieentscheidungen.md
│   ├── projektstruktur.md
│   ├── datenmodell.md
│   ├── auswertung.md
│   └── prozessgrenzen.md           NEU — Main/Preload/Renderer, IPC-Kanäle, DB-Isolation
│
├── style/                          Visuelle Sprache
│   ├── design-system.md            ← architektur/design-system.md
│   ├── grundlagen.md               ← architektur/styling.md (historische Begründung)
│   └── barrierefreiheit.md         NEU — aus design-system.md herausgelöst
│
├── test/
│   ├── teststrategie.md            ← architektur/teststrategie.md (Ebenen, Zuständigkeit)
│   ├── testpraxis.md               NEU — Konventionen, Muster, Rezepte
│   └── offene-maengel.md           NEU — Register der `it.fails`-Einträge
│
├── workflow/                       NEU — Arbeiten mit Claude Code
│   ├── claude-code-umgang.md       ← docs/claude-code-UMGANG.md
│   ├── setup-empfehlungen.md       ← docs/claude-code-setup-empfehlungen.md
│   └── doku-pflege.md              NEU — Ablageregeln, Pflegeablauf (Grundlage des Skills)
│
├── ablaufplaene/
│   ├── README.md                   NEU — Vorlage + Lebenszyklus (erledigt → erledigt/)
│   ├── schritt17-druckvorschau-drucken.md
│   └── erledigt/                   ← schritt4 … schritt16 (13 Dateien)
│
├── tagebuch/                       NEU
│   ├── README.md                   NEU — Wochenindex mit Kernentscheidungen je Woche
│   └── 2026-kw33.md                ← entwicklungstagebuch.md
│
└── temp/                           Arbeitsdateien, über .gitignore ausgeschlossen
```

**Bewusst keine README je Unterordner** — nur `docs/README.md` als Wegweiser, plus zwei Ausnahmen, die eine echte Zusatzfunktion haben: `ablaufplaene/README.md` (Vorlage und Lebenszyklusregel) und `tagebuch/README.md` (Index über die Wochen). Fünf fast leere Bereichs-READMEs wären Pflegelast ohne Nutzen.

**Zwei Ordner über die vom Nutzer angelegten hinaus**: `workflow/` (die drei Claude-Code-Dokumente sind heute im Wurzelverzeichnis von `docs/` verstreut und gehören thematisch zusammen) und `tagebuch/` (folgt aus der Aufteilungsentscheidung).

**Alle Kalenderwochen-Einträge liegen derzeit in KW 33** (11.–16.08.2026, ISO-Woche Mo 10.08.–So 16.08.). Die Aufteilung erzeugt also zunächst nur eine Datei — sie legt das Schema für die Zukunft fest, statt jetzt schon zu entzerren. Das ist beabsichtigt und in `tagebuch/README.md` zu vermerken.

---

## Umsetzung

### Phase 1 — Gerüst anlegen

Alle Ordner anlegen, alle künftigen Dateien als Skelett erzeugen: nur `# Überschrift`, die geplanten `##`-Abschnitte und je ein einzeiliger Platzhalter, der sagt, was hineingehört. Noch keine Inhalte verschieben. Ergebnis ist eine begehbare Struktur, an der die Einsortierung in Phase 3 entlanglaufen kann.

### Phase 2 — Verschieben, ohne Inhalte zu ändern

**Ausschließlich `git mv`**, damit die Dateihistorie erhalten bleibt (bei `rm` + `add` geht sie verloren):

| Von                                         | Nach                                    |
| ------------------------------------------- | --------------------------------------- |
| `architektur/design-system.md`              | `style/design-system.md`                |
| `architektur/styling.md`                    | `style/grundlagen.md`                   |
| `architektur/teststrategie.md`              | `test/teststrategie.md`                 |
| `claude-code-UMGANG.md`                     | `workflow/claude-code-umgang.md`        |
| `claude-code-setup-empfehlungen.md`         | `workflow/setup-empfehlungen.md`        |
| `entwicklungstagebuch.md`                   | `tagebuch/2026-kw33.md`                 |
| `ablaufplaene/schritt4…16*.md` (13 Dateien) | `ablaufplaene/erledigt/`                |

Danach **sofort** `npm run test`, `npm run lint`, `npm run typecheck` — die Verschiebung darf nichts am Code brechen (tut sie nicht, aber der Nachweis gehört an diese Stelle, bevor Inhalte angefasst werden).

### Phase 3 — Inhalte sichten und einsortieren (Kern der Aufgabe)

Datei für Datei, **nicht** per Copy-and-paste. Für jeden Abschnitt wird entschieden:

| Befund                                | Handlung                                                                       |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Aktuell und am richtigen Ort          | bleibt, ggf. Formatierung vereinheitlichen (Prosa → Tabelle, wo es trägt)       |
| Aktuell, aber im falschen Bereich     | in die Zieldatei verschieben                                                    |
| Veraltet, Korrektur bekannt           | korrigieren                                                                     |
| Veraltet, Korrektur unklar            | korrigieren **und** mit `> ⚠️ Zu prüfen: …` markieren                           |
| Redundant zu einer anderen Datei      | an einem Ort belassen, an der anderen Stelle verlinken                          |
| Nur noch historisch                   | ins Tagebuch, aus der Sachdatei entfernen                                       |

**Reihenfolge, vom Stabilen zum Beweglichen** — so steht bei jeder Datei schon fest, wohin ausgelagerte Teile gehören:

1. `architektur/technologieentscheidungen.md` (13 Zeilen, stabil) — Referenzformat festlegen
2. `architektur/datenmodell.md` (229) — Abschnitt „Offen" gegen den echten Code-Stand prüfen
3. `architektur/auswertung.md` (57)
4. `architektur/projektstruktur.md` (55) — laut Tagebuch schon zweimal veraltet gewesen; besonders sorgfältig gegen `src/` prüfen, `src/test/` und `e2e/` fehlen dort noch
5. → `architektur/prozessgrenzen.md` **neu schreiben**: die Regeln stehen heute verstreut in `CLAUDE.md`, `teststrategie.md` und `projektstruktur.md` (Renderer ohne `better-sqlite3`, Repositories nehmen die DB als Parameter, `IPC_KANAELE` als einzige Kanalquelle, Preload-`API` als Vertrag)
6. `style/grundlagen.md` + `style/design-system.md` — Überschneidung auflösen: `grundlagen.md` behält die historische Stack-Begründung, `design-system.md` den verbindlichen Ist-Stand
7. → `style/barrierefreiheit.md` herauslösen (Abschnitt „Barrierefreiheit — verbindliche Mindestanforderungen" plus die gemessenen Kontrastwerte)
8. `test/teststrategie.md` — Ebenen und Zuständigkeit behalten; „Konventionen", „Gegenproben", „`it.fails`", „Coverage" nach `testpraxis.md`; den `it.fails`-Eintrag zusätzlich in `offene-maengel.md` registrieren
9. `workflow/claude-code-umgang.md` + `setup-empfehlungen.md` — Überholtes im Empfehlungsbericht ist bereits durchgestrichen; jetzt konsolidieren statt weiter durchstreichen
10. `tagebuch/2026-kw33.md` — **inhaltlich nicht umschreiben** (chronologisches Dokument, rückwirkende Korrektur wäre falsch, siehe die entsprechende Festlegung im Eintrag vom 12.08.), nur Tagesüberschriften vereinheitlichen und `tagebuch/README.md` mit Index füllen
11. Die 13 erledigten Ablaufpläne — nur Kopfzeile „abgeschlossen am …" ergänzen, sonst unverändert

### Phase 4 — Querverweise reparieren

Rund **120 relative Links** in `docs/` zeigen nach der Verschiebung ins Leere, dazu:

- **5 Codekommentare** mit Doku-Pfaden: `src/renderer/src/lib/planAnsicht.ts:5`, `src/renderer/src/pages/TeamPage.test.tsx:10`, `e2e/druckausgabe.e2e.test.ts:99`, `vitest.config.ts:5`, `vitest.e2e.config.ts:5`
- **8 Verweise in `CLAUDE.md`** (Zeilen 11, 16, 32, 45, 50, 59, 67)

Systematisch durchgehen, nicht stichprobenartig. Abschluss ist ein Linkcheck (Phase 7).

### Phase 5 — TODO.md und erledigt.md neu

`erledigt.md`: Schritte 1–16 mit je Titel, Datum, Ergebnis in zwei bis drei Zeilen und Verweis auf Ablaufplan und Tagebuchwoche. Nicht die vollständigen Checklisten übernehmen — die stehen im Ablaufplan.

`TODO.md` neu, nach Zustand und Bereich:

```markdown
# TODO

## Aktueller Schritt
Schritt 17: Druckvorschau/Drucken → Ablaufplan, Fortschritt als Checkliste

## Fachfunktionen        offene Features
## Technik & Infrastruktur   CI, Packaging, Build
## Dokumentation         Doku-bezogene Aufgaben
## Bekannte Mängel       verweist auf test/offene-maengel.md
## Ideen / Später        unpriorisiert
```

Kein Punkt doppelt: Bekannte Mängel stehen im Register, die TODO verlinkt nur dorthin.

### Phase 6 — Pflege absichern

**`docs/workflow/doku-pflege.md`** — die inhaltliche Grundlage: Welche Änderung am Code zieht welche Doku-Aktualisierung nach sich, was gehört in welchen Ordner, was gehört ins Tagebuch statt in eine Sachdatei.

**Skill `.claude/skills/doku-pflege/SKILL.md`** — mit `disable-model-invocation: true` (nur per `/doku-pflege`, weil er schreibt). Ablauf: Commits seit der letzten Doku-Änderung ermitteln → betroffene Bereiche nach den Regeln oben bestimmen → jede betroffene Datei gegen den Code prüfen → TODO und Tagebuch nachziehen → Änderungen zusammengefasst vorlegen. Erledigt damit den „Dokumentationsdurchgang", der laut Tagebuch schon dreimal von Hand gemacht wurde.

**Stop-Hook in `.claude/settings.json`** — meldet beim Sitzungsende, wenn `src/` geändert wurde, `docs/` aber nicht. Reine Erinnerung, blockiert nie.

> **Plugin-Einsatz** (explizit gefragt): Für das Schreiben von Skill und Hook die Skills `plugin-dev:skill-development` und `plugin-dev:hook-development` aus dem bereits aktivierten `plugin-dev`-Plugin nutzen, für `settings.json` die Skill `update-config`. Das Plugin `hookify` ist **nicht** installiert und wird nicht gebraucht.

### Phase 7 — Verifikation

| Prüfung                                                     | Erwartung                                            |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| Linkcheck über alle `.md` in `docs/`, `CLAUDE.md`, `README.md` | kein toter relativer Link                            |
| `grep -rn "docs/" src/ e2e/ *.ts`                            | alle Pfade zeigen auf existierende Dateien           |
| `npm run test`, `npm run lint`, `npm run typecheck`          | unverändert grün (174 Tests)                         |
| `git log --follow` auf einer verschobenen Datei              | Historie erhalten (Nachweis, dass `git mv` griff)    |
| `/doku-pflege` einmal aufrufen                               | erkennt den Stand korrekt, meldet keine Falschbefunde |
| Stop-Hook: Testdatei in `src/` ändern                        | Erinnerung erscheint; nach Doku-Änderung nicht mehr  |

---

## Abgrenzung

- **Keine inhaltliche Neubewertung des Tagebuchs.** Chronologische Einträge beschreiben den Stand zu ihrem Zeitpunkt; rückwirkendes Korrigieren würde die Nachvollziehbarkeit zerstören. Nur Aufteilung und Formatvereinheitlichung.
- **`test/teststrategie.md` wurde am 16.08.2026 frisch geschrieben** und ist inhaltlich aktuell — hier nur die Aufteilung Strategie/Praxis, keine Überarbeitung.
- **Kein Umbenennen der Ablaufplan-Dateien.** Die Namen sind in Tagebuch und TODO vielfach verlinkt.
- **Kein Löschen.** Was nicht mehr passt, wandert ins Tagebuch oder wird als „historisch" markiert — nicht entfernt.
- **Ein Commit je Phase**, damit ein Fehlgriff einzeln rückgängig zu machen ist. Nicht pushen ohne Rückfrage.

---

## Startprompt für die neue Sitzung

```
Ich möchte den docs/-Ordner des Projekts neu strukturieren. Der vollständige,
bereits mit mir abgestimmte Plan liegt unter:
C:\Users\Jeremy\.claude\plans\vast-whistling-donut.md

Lies zuerst diesen Plan vollständig, dann CLAUDE.md und docs/README.md, und
arbeite die sieben Phasen der Reihe nach ab. Committe nach jeder Phase einzeln,
pushe nicht ohne Rückfrage.

Vier Punkte sind bereits entschieden und nicht neu zu diskutieren:
1. Das Entwicklungstagebuch wird nach ISO-Kalenderwochen aufgeteilt
   (docs/tagebuch/2026-kw33.md) — aktuell fällt alles in KW 33, das Schema
   ist für die Zukunft gedacht.
2. Die neue TODO.md gliedert nach Zustand + Bereich, Erledigtes wandert nach
   docs/erledigt.md.
3. Die Doku-Pflege wird über eine Skill /doku-pflege plus einen Stop-Hook als
   Erinnerung abgesichert — der Hook blockiert nie.
4. Für Skill und Hook die Skills plugin-dev:skill-development,
   plugin-dev:hook-development und update-config verwenden.

Zwei Dinge sind mir besonders wichtig:
- Beim Verschieben ausschließlich `git mv`, damit die Dateihistorie erhält.
- Phase 3 ist die eigentliche Arbeit: Inhalte nicht kopieren, sondern bewerten.
  Veraltetes korrigieren, Unsicheres zusätzlich mit "> ⚠️ Zu prüfen: …"
  markieren, Prosa in Tabellen überführen wo es trägt, Redundanz auflösen.
  Besonders docs/architektur/projektstruktur.md prüfen — die war laut Tagebuch
  schon zweimal veraltet und kennt src/test/ und e2e/ noch nicht.

Vergiss Phase 4 nicht: rund 120 relative Links in docs/ brechen durch die
Verschiebung, dazu 5 Codekommentare (planAnsicht.ts, TeamPage.test.tsx,
druckausgabe.e2e.test.ts, vitest.config.ts, vitest.e2e.config.ts) und 8
Verweise in CLAUDE.md.

Zum Schluss die Verifikation aus Phase 7 durchführen und mir das Ergebnis
zusammenfassen. Kommunikation auf Deutsch, nicht gendern.
```
