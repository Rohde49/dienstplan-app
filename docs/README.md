# docs/

Zentrale Dokumentation der Dienstplan-Desktop-App, gesammelt außerhalb des Root-Verzeichnisses.

## Struktur

- [`TODO.md`](./TODO.md) — Aufgabenliste, gegliedert nach Entwicklungsschritten, wird laufend abgehakt
- [`entwicklungstagebuch.md`](./entwicklungstagebuch.md) — chronologisches Log der Entwicklungsschritte, was wurde wann gemacht und warum
- [`claude-code-UMGANG.md`](./claude-code-UMGANG.md) — Kurzreferenz für die Arbeit mit Claude Code in diesem Projekt
- [`architektur/`](./architektur) — Architektur- und Entwurfsentscheidungen
  - [`projektstruktur.md`](./architektur/projektstruktur.md) — Ordnerstruktur, Trennung von Fachlogik/Darstellungslogik, Entitäten
  - [`datenmodell.md`](./architektur/datenmodell.md) — inhaltliche Entscheidungen zu den Entitäten (`TeamMember`, `Eintragsdefinition`, `Dienstplan`, `Dienstplantag`, `Planeintrag`, `Rufbereitschaft`), Beziehungen und Konventionen
  - [`auswertung.md`](./architektur/auswertung.md) — abgeleitete Auswertungsansicht (Berechnete Kennzahlen), keine eigene Entität
  - [`teststrategie.md`](./architektur/teststrategie.md) — welche Testebenen wo und wie
  - [`technologieentscheidungen.md`](./architektur/technologieentscheidungen.md) — Begründung für Electron, SQLite, Zielplattform
  - [`styling.md`](./architektur/styling.md) — Styling-Fundament (Tailwind, shadcn, lucide-react, Typografie), Referenzprojekt und Übertragung auf electron-vite
  - [`design-system.md`](./architektur/design-system.md) — aktueller Stand der visuellen Sprache: Tokens, Typo-/Abstands-/Elevation-Skalen, Komponenten-Inventar, Barrierefreiheits-Mindestanforderungen, bekannte Abweichungen
- [`ablaufplaene/`](./ablaufplaene) — je Entwicklungsschritt eine Abfolge einzelner Claude-Code-Prompts (Plan Mode → Umsetzung → Prüfung)
