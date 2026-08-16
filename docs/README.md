# Dokumentation der Dienstplan-App

Wegweiser. Diese Datei sagt nur, **wo etwas steht** — nichts davon wird hier zusammengefasst, damit es nicht doppelt gepflegt werden muss und auseinanderläuft.

## Wonach suche ich gerade?

| Frage                                        | Datei                                                                |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Was ist als Nächstes zu tun?                 | [`TODO.md`](./TODO.md)                                               |
| Was ist schon fertig?                        | [`erledigt.md`](./erledigt.md)                                       |
| Warum wurde etwas so entschieden?            | [`tagebuch/`](./tagebuch)                                            |
| Wie sieht eine Entität aus?                  | [`architektur/datenmodell.md`](./architektur/datenmodell.md)         |
| Wo gehört neuer Code hin?                    | [`architektur/projektstruktur.md`](./architektur/projektstruktur.md) |
| Was darf der Renderer, was der Main-Prozess? | [`architektur/prozessgrenzen.md`](./architektur/prozessgrenzen.md)   |
| Welche Farbe/Größe/Klasse nehme ich?         | [`style/design-system.md`](./style/design-system.md)                 |
| Auf welcher Ebene teste ich das?             | [`test/teststrategie.md`](./test/teststrategie.md)                   |
| Wie schreibe ich den Test konkret?           | [`test/testpraxis.md`](./test/testpraxis.md)                         |
| Was ist bekannt kaputt?                      | [`test/offene-maengel.md`](./test/offene-maengel.md)                 |

## Die Bereiche

### [`architektur/`](./architektur) — was und warum

| Datei                                                                        | Inhalt                                                           |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| [`technologieentscheidungen.md`](./architektur/technologieentscheidungen.md) | Electron statt Tauri, SQLite statt Server, nur Windows           |
| [`projektstruktur.md`](./architektur/projektstruktur.md)                     | Ordner und ihre Zuständigkeit, Reihenfolge für neue Fachbereiche |
| [`prozessgrenzen.md`](./architektur/prozessgrenzen.md)                       | Main/Preload/Renderer, IPC-Kanäle, DB-Isolation                  |
| [`datenmodell.md`](./architektur/datenmodell.md)                             | Die sechs Entitäten, Beziehungen, Konventionen                   |
| [`auswertung.md`](./architektur/auswertung.md)                               | Die 15 Kennzahlen und ihre Berechnungsvorschriften               |

### [`style/`](./style) — visuelle Sprache

| Datei                                                | Inhalt                                                      |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| [`design-system.md`](./style/design-system.md)       | **Verbindlich**: Tokens, Skalen, Zustände, Komponenten      |
| [`barrierefreiheit.md`](./style/barrierefreiheit.md) | **Verbindlich**: Mindestanforderungen, gemessene Kontraste  |
| [`grundlagen.md`](./style/grundlagen.md)             | Historisch: warum Tailwind/shadcn, wie die Palette entstand |

### [`test/`](./test) — Prüfsignale

| Datei                                           | Inhalt                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| [`teststrategie.md`](./test/teststrategie.md)   | Die fünf Ebenen und ihre Zuständigkeit         |
| [`testpraxis.md`](./test/testpraxis.md)         | Konventionen, Testhilfen, Gegenproben, Rezepte |
| [`offene-maengel.md`](./test/offene-maengel.md) | Register bekannter Mängel                      |

### [`workflow/`](./workflow) — Arbeiten mit Claude Code

| Datei                                                       | Inhalt                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| [`claude-code-umgang.md`](./workflow/claude-code-umgang.md) | Bedienung: Plan Mode, `/clear`, Prüfsignale                 |
| [`setup-empfehlungen.md`](./workflow/setup-empfehlungen.md) | Einrichtung des Projekts: Hooks, Skills, MCP, CI            |
| [`doku-pflege.md`](./workflow/doku-pflege.md)               | Ablageregeln und Pflegeablauf, Grundlage von `/doku-pflege` |

### [`ablaufplaene/`](./ablaufplaene) — Umsetzungspläne je Schritt

Aktueller Plan direkt im Ordner, abgeschlossene unter [`erledigt/`](./ablaufplaene/erledigt). Vorlage und Lebenszyklus siehe [`ablaufplaene/README.md`](./ablaufplaene/README.md).

### [`tagebuch/`](./tagebuch) — Verlauf

Eine Datei je ISO-Kalenderwoche. Wochenindex mit den Kernentscheidungen siehe [`tagebuch/README.md`](./tagebuch/README.md).

## Zwei Regeln für diesen Ordner

**Sachdatei oder Tagebuch?** Eine Sachdatei beschreibt den **Zustand** und wird korrigiert, wenn er sich ändert. Das Tagebuch beschreibt den **Weg** und wird nie rückwirkend korrigiert. Verworfene Alternativen, Fehlschläge und Reihenfolgen gehören ins Tagebuch, nicht in die Sachdatei.

**Was unsicher ist, wird markiert** statt geglättet:

```markdown
> ⚠️ Zu prüfen: …
```

Die vollständigen Ablageregeln stehen in [`workflow/doku-pflege.md`](./workflow/doku-pflege.md); `/doku-pflege` arbeitet sie ab.

`temp/` ist eine Zwischenablage für laufende Arbeiten und über `.gitignore` ausgeschlossen — nichts darin ist Teil der Dokumentation.
