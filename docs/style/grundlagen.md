# Styling-Grundlagen (historische Begründung)

> **Diese Datei beschreibt nicht den aktuellen Stand.** Sie hält fest, _warum_ das Styling-Fundament so gewählt wurde und wie die Farbpalette entstanden ist — einschließlich zweier Entscheidungen, die später revidiert wurden. Was heute gilt, steht in [`design-system.md`](./design-system.md) und [`barrierefreiheit.md`](./barrierefreiheit.md). **Bei jedem Widerspruch gilt `design-system.md`.**

Eigene Datei, weil Begründung und Detailtiefe mit den anderen Architekturentscheidungen vergleichbar sind, siehe [`architektur/technologieentscheidungen.md`](../architektur/technologieentscheidungen.md).

## Referenzprojekt

Als Vorlage diente das bestehende Projekt `familienplaner-frontend` (`github.com/Rohde49/WebDev-Familienplaner`). Dort ist ein funktionierendes Setup aus Tailwind, shadcn und `lucide-react` vorhanden, inklusive gelöster Konfigurationsfragen (Pfad-Alias, Theme-Variablen, Komponentenstruktur). Vorbild, nicht Quelle für Codeübernahme.

## Stack-Entscheidung

| Baustein                                 | Warum                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| **Tailwind v4** über `@tailwindcss/vite` | Keine `tailwind.config.js` mehr nötig; Theme über `@theme inline` in der globalen CSS |
| **shadcn**, Style „new-york"             | Kopiert Quellcode ins Projekt statt eine Laufzeit-Abhängigkeit zu sein                |
| **Radix-Primitives**                     | Unterbau einzelner Komponenten, einzeln installiert statt pauschal auf Vorrat         |
| **`lucide-react`**                       | Icons                                                                                 |
| **`clsx` + `tailwind-merge`**            | Eigene `cn()`-Hilfsfunktion                                                           |

Der Konfigurationsaufwand war im Referenzprojekt bereits gelöst und musste nur auf `electron-vite` übertragen werden.

## Was übernommen wurde (Muster, nicht Code)

- Komposition von UI-Komponenten aus mehreren kleinen Teilen statt einem Monolithen, am Beispiel `Card`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` als eigene Funktionen.
- CSS-Variablen-Theme in der globalen Stylesheet-Datei, über das sowohl Tailwind (`@theme inline`) als auch shadcn (`cssVariables: true`) zugreifen.
- Pfad-Alias `@/` für Importe aus dem Renderer-Quellverzeichnis.

## Was bewusst nicht übernommen wurde

| Nicht übernommen                                                                    | Grund                                                                                                              |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `@mui/material`, `@emotion`                                                         | Im Referenzprojekt als Dependency vorhanden, aber nirgends importiert — vermutlich Rest eines früheren Ansatzes    |
| `cn()` nur mit `clsx`                                                               | Ohne `tailwind-merge` gewinnen bei widersprüchlichen Klassen (`p-2` + `p-4`) beide gleichzeitig statt der späteren |
| `axios`, `@tanstack/react-query`, `react-hook-form`, `zod`, `sonner`, `AuthContext` | Backend-nahe Pakete; diese App hat kein Server-Backend, sondern lokale SQLite-Zugriffe über IPC                    |

## Übertragung auf `electron-vite`

- Tailwind/shadcn betreffen ausschließlich `src/renderer`. Main und Preload haben kein UI, das Plugin `@tailwindcss/vite` gehört nur in den Renderer-Teil von `electron.vite.config.ts`.
- Der Pfad-Alias `@/` muss sowohl in `electron.vite.config.ts` (Resolve-Alias) als auch in `tsconfig.web.json` (`paths`) stehen.
- `components.json` verweist auf `src/renderer/src` statt auf ein einfaches `src`-Verzeichnis.

## Wie die Farbpalette entstanden ist

Vier Fassungen in Folge — die Reihenfolge erklärt, warum das heutige Ergebnis so aussieht:

| Fassung                     | Was galt                                                            | Warum verworfen                                                                  |
| --------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 1. Neutral                  | Graustufen, kein Farbakzent                                         | Auf Nutzerwunsch zugunsten eines freundlicheren Schemas ersetzt                  |
| 2. Mint durchgängig         | Alle Tokens auf oklch-Hue ~165, Sättigung steigt mit Interaktivität | Getönte Flächen konkurrierten im Raster mit den zehn Mitarbeiterfarben           |
| 3. Mint nur für Interaktion | Flächen neutral, Mint für `--primary`/`--accent`/`--ring`           | Auf Nutzerwunsch abgelöst — die Oberfläche wirkte überwiegend grau, da nur eine dezente Akzentfarbe und keine Statusfarben existierten |
| 4. Blau + Statusfarben       | Primary/Accent/Ring auf Tailwinds `blue`-Skala, dazu eigene `info`/`success`/`warning`/`destructive`-Statusflächen (je `-subtle`/`-border`/`-foreground`) | **Gilt heute** — Werte in [`design-system.md`](./design-system.md). Bekanntes Restrisiko: `TEAM_MEMBER_FARBEN` enthält bereits eine Mitarbeiterfarbe „Blau" — anders als bei Fassung 2 wurde diese Überschneidung hier bewusst in Kauf genommen, weil Primärfarbe (Bedienelemente) und Mitarbeiterfarbe (Personenkennzeichnung) selten in derselben Fläche zusammentreffen |

Der Zielkonflikt, der sich durch alle drei Fassungen zieht: Zwei der zehn `TeamMember.farbe`-Töne (`#34B37A` Grün, `#7FB236` Lindgrün) liegen selbst im Grünbereich und damit nah am Mint. Aufgelöst wurde er nicht über Farbabstand, sondern über **Kontext und Sättigung**: Mint markiert Bedienbarkeit, die Mitarbeiterfarben unterscheiden Personen. Beide begegnen sich nie in derselben Rolle.

Zwischenstationen, die es nicht in die Endfassung geschafft haben: `--background` wurde nach Schritt 6 einzeln auf einen Slate-Ton gezogen, weil die fast-weiße Mint-Tönung im maximierten Fenster zu grell wirkte — mit Fassung 3 wurde diese Ausnahme gegenstandslos, weil alle Flächen neutral wurden.

## Typografie: warum selbst gehostet

`Inter` (Variable Font) über das npm-Paket `@fontsource-variable/inter` statt über eine Google-Fonts-CDN-Einbindung — damit die App ohne Internetzugriff läuft, konsistent mit der Entscheidung gegen CDN-Abhängigkeiten überhaupt. Global auf `body`-Ebene gesetzt, nicht je Seite, damit die Fachbereiche nicht optisch auseinanderlaufen.

## Eine Lehre, die geblieben ist

Ein gewählter Breakpoint muss gegen die **tatsächliche** Fenstergröße geprüft werden, nicht nur plausibel wirken. `ManagementLayout` nutzte zunächst `lg:` (1024 px) für sein Zwei-Spalten-Layout — bei einer konfigurierten Fensterbreite von 900 px wäre es beim Standardstart nie zweispaltig sichtbar gewesen. Korrigiert auf `md:` (768 px). Die Regel steht heute in [`design-system.md`](./design-system.md).
