# Styling-Fundament

> **Hinweis:** Diese Datei hält die ursprüngliche Begründung der Grundsatzentscheidungen fest
> (warum Tailwind, warum shadcn, wie die Palette entstanden ist). Für den **aktuell gültigen**
> Stand — Token-Werte, Typo-/Abstands-/Elevation-Skalen, Zustände, Komponenten-Inventar und
> Barrierefreiheits-Vorgaben — siehe [`design-system.md`](./design-system.md). Bei Widersprüchen
> gilt `design-system.md`; die konkreten Farbwerte und Kontraste unten wurden dort nach einer
> WCAG-Prüfung überarbeitet.

Entscheidung zu Schritt 2 aus [`TODO.md`](../TODO.md). Eigene Datei, weil Begründung und Detailtiefe vergleichbar mit den anderen Architekturentscheidungen sind, siehe [`technologieentscheidungen.md`](./technologieentscheidungen.md) und [`projektstruktur.md`](./projektstruktur.md).

## Referenzprojekt

Als Vorlage dient das bestehende Projekt `familienplaner-frontend` (`github.com/Rohde49/WebDev-Familienplaner`, Ordner `familienplaner-frontend`). Dort ist bereits ein funktionierendes Setup aus Tailwind, shadcn und `lucide-react` vorhanden, inklusive gelöster Konfigurationsfragen (Pfad-Alias, Theme-Variablen, Komponentenstruktur). Dieses Setup dient als Vorbild, nicht als Quelle für direkte Codeübernahme, siehe Abschnitt „Was bewusst nicht übernommen wird".

## Stack-Entscheidung

- **Tailwind v4** über das Vite-Plugin `@tailwindcss/vite`. Tailwind v4 benötigt keine separate `tailwind.config.js`/`.ts` mehr, das Theme (Farben, Radius etc.) wird direkt in der globalen CSS-Datei über `@theme inline` und CSS-Variablen definiert. Das unterscheidet sich von älteren Tailwind-Anleitungen (v3), die noch eine JS-Konfigurationsdatei voraussetzen.
- **shadcn**, Style „new-york", mit `components.json` zur Konfiguration (Pfad-Aliase, Basisfarbe, CSS-Variablen an/aus). shadcn kopiert Komponenten-Quellcode direkt ins Projekt (`src/renderer/src/components/ui/`), es ist keine Laufzeit-Dependency im klassischen Sinn.
- **Radix-Primitives** als Unterbau einzelner shadcn-Komponenten (z. B. `@radix-ui/react-dialog`, `@radix-ui/react-slot`), je nach Bedarf einzeln installiert, nicht pauschal alle auf Vorrat.
- **`lucide-react`** für Icons.
- **`clsx` + `tailwind-merge`** für eine eigene `cn()`-Hilfsfunktion.

Begründung: Das Setup ist im Referenzprojekt bereits gelöst und funktioniert dort produktiv. Der Konfigurationsaufwand (Pfad-Alias, Tailwind-v4-Einrichtung, shadcn-Anbindung an ein Nicht-Next.js-Projekt) muss dadurch nicht neu erarbeitet werden, nur auf `electron-vite` übertragen.

## Grundprinzipien für die UI-Entwicklung

Vier Vorgaben, die für die gesamte App und alle künftigen Fachbereiche gelten, nicht nur für das in Schritt 2 gebaute Fundament:

**Responsives Design**: Die App muss über den gesamten sinnvollen Fenstergrößenbereich hinweg funktionieren, nicht nur bei einer angenommenen Zielgröße, umgesetzt über Tailwinds Breakpoint-Utilities (`md:`, `lg:` usw.). Beispiel: die responsive Card-Grid auf der `StartPage` (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`). Wichtige Lehre aus der Team-Verwaltung (siehe `entwicklungstagebuch.md`): Ein gewählter Breakpoint muss gegen die tatsächliche Standard- und Mindestfenstergröße der App geprüft werden, nicht nur plausibel wirken. `ManagementLayout` nutzte zunächst `lg:` (1024px) für sein Zwei-Spalten-Layout, das Fenster startet aber mit 900px Breite (`minWidth: 640` in `src/main/index.ts`) — das Layout wäre beim Standardstart nie zweispaltig sichtbar gewesen. Korrigiert auf `md:` (768px). Vorgehen seitdem: nach jeder neuen responsiven Layoutentscheidung gegen die tatsächlichen Fenstergrößen in `src/main/index.ts` prüfen, nicht nur im maximierten Fenster testen.

**Zentrale, wiederverwendbare Komponenten statt Duplikation**: Wiederkehrende UI-Bausteine werden einmal zentral angelegt und von dort an allen passenden Stellen verwendet, nicht pro Seite neu gebaut. Konkret in drei Kategorien unter `src/renderer/src/components/` (siehe [`projektstruktur.md`](./projektstruktur.md), Abschnitt „Aktueller Stand"): `ui/` für generische shadcn-Primitives (aktueller Stand: `Card`, `Button`, `Input`, `Label`, `Select`, `Table`, `Collapsible`, jeweils nur nachgebaut, wenn ein konkreter Bedarf bestand, nicht auf Vorrat), `layout/` für seitenübergreifende, fachlich unwissende Layout-Bausteine (gemeinsamer `ManagementHeader`, darauf aufbauend zwei Anordnungsvarianten: `ManagementLayout` mit Liste/Detail nebeneinander, von `TeamPage` genutzt, und `StackedManagementLayout` mit Liste/Detail übereinander, von `EintraegePage` genutzt, weil deren Tabelle zu breit für ein festes Sidebar-Raster ist — siehe `entwicklungstagebuch.md`), und fachspezifische Komponenten für einen einzelnen Bereich (z. B. `TeamMemberForm`/`TeamMemberTable`, `EintragsdefinitionForm`/`EintragsdefinitionTable`). Ob ein neuer UI-Baustein in eine bestehende Kategorie gehört, eine neue Variante (wie `StackedManagementLayout`) oder eine neue Komponente rechtfertigt, wird jeweils im Ablaufplan bzw. anhand des konkreten Bedarfs entschieden (siehe z. B. `ablaufplaene/schritt5-eintrag-verwaltung.md`, Punkt zu fehlenden UI-Primitives).

**Konsequente Farbbedeutung**: Jede Farbe behält im gesamten Frontend dieselbe Bedeutung, unabhängig vom Fachbereich, statt dieselbe visuelle Wirkung mit wechselnder Bedeutung mehrfach zu verwenden. Konkret: `--destructive` ausschließlich für Lösch-/Fehlerzustände, `--primary`/`--accent`/`--ring` ausschließlich für UI-Chrome (Buttons, Fokus, Hover), niemals zur Datenvisualisierung, `TEAM_MEMBER_COLORS` ausschließlich zur Unterscheidung von Personen im späteren Dienstplan-Grid, keine allgemeine Akzentfarbe. Für neue Farbwerte in künftigen Fachbereichen gilt: zuerst prüfen, ob ein bestehendes Theme-Token semantisch passt, bevor ein neuer Farbwert eingeführt wird, wie beim `Select`-Dropdown, das `bg-card` statt eines neuen `--popover`-Tokens nutzt.

**Visuelles Feedback und nachvollziehbare Fehlerzustände**: Jede Nutzeraktion, die fehlschlagen kann (Formular absenden, Validierung, Speichern), muss dem Nutzer unmittelbar eine verständliche Rückmeldung geben, nicht nur im Erfolgsfall. Bereits so umgesetzt in der Team-Verwaltung: Validierungsfehler werden als Liste im Formular angezeigt (`validateTeamMemberInput`), noch bevor ein IPC-Aufruf erfolgt. Für künftige Formulare, etwa in der Eintrag-Verwaltung, gilt dasselbe Muster: Validierung vor dem Absenden, Fehler direkt im Formular sichtbar, keine stillen Fehlschläge.

## Was übernommen wird (Muster, nicht Code)

- Komposition von UI-Komponenten aus mehreren kleinen Teilen statt einem Monolithen, am Beispiel `Card`: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` als eigene Funktionen, die je nach Bedarf kombiniert werden.
- CSS-Variablen-Theme in der globalen Stylesheet-Datei (`--background`, `--foreground`, `--primary` usw.), darüber greift sowohl Tailwind (`@theme inline`) als auch shadcn (`components.json` → `cssVariables: true`) zu.
- Pfad-Alias `@/` für Importe aus dem Renderer-Quellverzeichnis, notwendig für die shadcn-CLI-Konventionen.

## Was bewusst nicht übernommen wird

- **`@mui/material` und `@emotion`**: Im Referenzprojekt als Dependency vorhanden, aber im gesamten Quellcode nirgends importiert, vermutlich Rest eines früheren Ansatzes. Keine Grundlage für eine Übernahme.
- **`cn()` nur mit `clsx`**: Im Referenzprojekt ist `tailwind-merge` zwar installiert, die tatsächliche `cn()`-Funktion nutzt es aber nicht, sondern nur `clsx`. Das ist unvollständig: Ohne `tailwind-merge` werden bei widersprüchlichen Tailwind-Klassen (z. B. Default-Klasse `p-2` einer Komponente und zusätzlich übergebene Klasse `p-4`) beide Klassen gleichzeitig angewendet, statt dass die spätere die frühere ersetzt. Für dieses Projekt wird `cn()` deshalb korrekt als `twMerge(clsx(...))` umgesetzt.
- **Backend-nahe Pakete** wie `axios`, `@tanstack/react-query`, `react-hook-form`, `zod`, `sonner`, `AuthContext`: Das Referenzprojekt spricht mit einem eigenen Backend über eine REST-API. Die Dienstplan-App hat laut [`technologieentscheidungen.md`](./technologieentscheidungen.md) bewusst kein Server-Backend, sondern lokale SQLite-Zugriffe über IPC. Diese Pakete sind für dieses Projekt nicht relevant.

## Übertragung auf `electron-vite`

- Tailwind/shadcn betreffen ausschließlich `src/renderer`. Main- und Preload-Prozess haben kein UI und keine CSS-Abhängigkeit, das Plugin `@tailwindcss/vite` darf nur im Renderer-Teil von `electron.vite.config.ts` eingebunden werden.
- Der Pfad-Alias `@/` muss sowohl in `electron.vite.config.ts` (Renderer-Resolve-Alias) als auch in `tsconfig.web.json` (`paths`) eingetragen werden, analog zur `vite.config.ts`/`tsconfig.app.json`-Kombination im Referenzprojekt.
- `components.json` verweist entsprechend auf `src/renderer/src` statt auf ein einfaches `src`-Verzeichnis wie im Referenzprojekt.

## Theme-Farbpalette (final)

Ruhige, benutzerfreundliche Palette mit dezenten Akzenten, an einem hellen Mint-Grün orientiert (oklch-Hue ~165, zwischen Grün und Türkis), Werte in `assets/base.css` als CSS-Variablen (`--background`, `--foreground`, `--primary` usw.) hinterlegt. Leitprinzip: Sättigung steigt mit der Interaktivität des Elements — passive Flächen (`--background`, `--card`, `--secondary`) bleiben nahezu neutral/ungetönt, nur Elemente mit Bedeutung/Interaktion (`--primary` für Buttons/Icon-Badges/Hover-Rahmen, `--accent` für Hover-Hintergründe, `--ring` für den Fokus-Ring) tragen sichtbar Mint. `--muted` (u. a. Card-Tönung über `bg-muted/60`) liegt dazwischen: blasses Mint-Grau.

Diese Entscheidung ersetzt die ursprünglich rein neutrale Palette (Graustufen ohne Farbakzent) vom Ende von Schritt 2. Zielkonflikt dabei: Zwei der zehn Farben aus der `TeamMember.farbe`-Palette (siehe [`datenmodell.md`](./datenmodell.md)) liegen selbst im Grün-Bereich (`#34B37A` Grün, `#7FB236` Lindgrün) — farblich nah am jetzt gewählten Mint, genau die Verwechslungsgefahr, die die ursprünglich neutrale Wahl vermeiden sollte. Aufgelöst wurde das nicht über Farbabstand im Farbton, sondern über Helligkeit/Sättigung und Kontext: Mint wird ausschließlich als helle, entsättigte Pastellfarbe für UI-Chrome (Buttons, Fokus-Ringe, Hover-Zustände, Icon-Badges) verwendet, nie als kräftige Vollfläche wie später die Mitarbeiterfarben im Dienstplan-Grid. Beide Paletten bleiben damit über Kontext (Interface-Chrome vs. Datenvisualisierung) und Sättigung unterscheidbar, nicht über Farbton. `baseColor: "neutral"` in `components.json` bezieht sich nur auf die shadcn-Komponentenstruktur, nicht auf die tatsächlichen Farbwerte. Dark Mode ist weiterhin nicht gefordert.

**Nachträgliche Ausnahme (nach Schritt 6): `--background` auf Slate statt Mint.** Im maximierten Vollbild-Fenster der Planungsansicht wirkte die fast-weiße Mint-Tönung (`oklch(0.995 0.003 165)`) zu grell/hell. Auf Nutzerwunsch auf einen dezenten Slate-Ton gewechselt (`oklch(0.968 0.007 247.896)`, Tailwinds Standard-Wert `slate-100`, oklch-Hue ~248 statt 165). Bewusst **nur** `--background` geändert, `--card`/`--secondary`/`--muted`/`--primary`/`--accent`/`--ring` bleiben unverändert bei Mint (Hue 165) — die Theme-Palette ist damit nicht mehr über einen einzigen Hue-Wert durchgängig, sondern die am wenigsten auffällige, passive Fläche (`--background`) weicht bewusst leicht ab. Für zukünftige Farbentscheidungen gilt: `--background` zuerst gegen Slate prüfen, nicht mehr automatisch Mint annehmen wie bei den übrigen Tokens.

## Typografie

Schriftart `Inter` (Variable Font), selbst gehostet über das npm-Paket `@fontsource-variable/inter`, importiert in `main.tsx` (`import '@fontsource-variable/inter'`) und global in `assets/base.css` an erster Stelle der `font-family`-Kette gesetzt (`'Inter Variable'`, danach die bisherige System-Font-Fallback-Kette unverändert als Absicherung). Selbst gehostet statt über eine Google-Fonts-CDN-Einbindung, damit die App ohne Internetzugriff läuft, konsistent mit der bereits bestehenden Entscheidung gegen sonstige CDN-Abhängigkeiten in diesem Projekt. Einheitlich für die gesamte App (`body`-Ebene), nicht nur für einzelne Seiten, damit Team-Verwaltung und später weitere Fachbereiche nicht optisch uneinheitlich wirken.
