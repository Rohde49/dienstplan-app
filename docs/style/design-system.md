# Design-System

Der **verbindliche** Stand der visuellen Sprache: Woran neue UI sich zu halten hat. Zwei Nachbardateien ergänzen ihn:

| Datei                                          | Enthält                                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| [`grundlagen.md`](./grundlagen.md)             | die historische Begründung — warum Tailwind, warum shadcn, wie die Palette entstand |
| [`barrierefreiheit.md`](./barrierefreiheit.md) | Mindestanforderungen und alle gemessenen Kontrastwerte                              |

Bei Widersprüchen gilt diese Datei. Entstanden aus einer Konsolidierung nach Schritt 16 (Audit, visuelle Überprüfung, WCAG-2.1-AA-Prüfung, Umsetzung); der Verlauf steht im [Tagebuch](../tagebuch/2026-kw33.md).

## Leitgedanke: Werkzeug, nicht Dashboard

Die App hat eine einzige Kernaufgabe: einen Monat Dienstplan für ein kleines Team aufbauen, die Kennzahlen prüfen und das Ergebnis auf einer A4-Seite ausgeben. Alles andere (Team-Verwaltung, Eintrag-Verwaltung) ist Vorbereitung dafür.

1. **Das Raster hat Vorrang vor der Umrahmung.** Kopfbereiche, Polsterungen und Titelgrößen bleiben knapp, damit möglichst viele Tage sichtbar sind.
2. **Blau bedeutet Interaktion.** `--primary`, `--accent` und `--ring` markieren ausschließlich Bedienbarkeit und Zustand. Flächen (`--background`, `--card`, `--muted`, `--secondary`) sind neutral, damit die Tönung nicht mit den zehn Mitarbeiterfarben im Raster konkurriert. Ausnahme mit bekanntem Restrisiko: `TEAM_MEMBER_FARBEN` enthält bereits eine Mitarbeiterfarbe „Blau" — siehe [`grundlagen.md`](./grundlagen.md), Fassung 4.
3. **Zahlen sind Daten, keine Typografie.** Uhrzeiten und Dauern stehen in Tabellenziffern und fluchten spaltenweise.

## Vier Grundprinzipien

Gelten für die gesamte App, nicht nur für einzelne Bereiche. Bei Konflikt gehen die drei Leitgedanken oben vor.

| Prinzip                       | Konkret                                                                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Responsiv**                 | Über den ganzen sinnvollen Fenstergrößenbereich funktionsfähig, nicht nur bei einer angenommenen Zielgröße. Breakpoints gegen die echten Fenstergrößen prüfen (siehe unten). |
| **Zentral statt dupliziert**  | Wiederkehrende Bausteine einmal anlegen und von dort verwenden. Die Kategorie ergibt sich aus [`architektur/projektstruktur.md`](../architektur/projektstruktur.md).         |
| **Konsequente Farbbedeutung** | Jede Farbe behält im gesamten Frontend dieselbe Bedeutung. Vor einem neuen Farbwert prüfen, ob ein bestehendes Token semantisch passt.                                       |
| **Sichtbares Feedback**       | Jede Aktion, die fehlschlagen kann, gibt unmittelbar Rückmeldung — Validierung vor dem Absenden, Fehler am Feld, keine stillen Fehlschläge.                                  |

## Design-Tokens

Definiert in [`src/renderer/src/assets/base.css`](../../src/renderer/src/assets/base.css), über `@theme inline` an Tailwind durchgereicht. Werte referenzieren Tailwinds mitgelieferte Stockfarben-Variablen (`var(--color-blue-600)` usw.) statt handgezogener `oklch()`-Werte. **Kontrastwerte in [`barrierefreiheit.md`](./barrierefreiheit.md) sind seit der Umstellung auf Blau nicht neu gemessen** — dort als veraltet markiert, nicht als Beleg verwendbar.

| Token                             | Wert (Tailwind-Skala)                                        | Bedeutung                                                     |
| ---------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| `--background`                    | `slate-50`                                                     | Seitenfläche hinter allen Cards                               |
| `--foreground`                    | `slate-900`                                                    | Fließtext                                                     |
| `--card`                          | `white`                                                         | Erhabene Fläche: Card, Dialog, Popover, Rasterhintergrund     |
| `--card-foreground`               | `slate-900`                                                    | Text auf Card                                                 |
| `--primary`                       | `blue-600`                                                      | Aktions-Buttons, Icon-Badges, aktive Markierung               |
| `--primary-foreground`            | `white`                                                         | Beschriftung auf `--primary`                                  |
| `--primary-hover`                 | `blue-700`                                                      | Hover-Zustand von `--primary`                                 |
| `--primary-active`                | `blue-800`                                                      | Gedrückt-Zustand von `--primary`                               |
| `--primary-subtle`                | `blue-50`                                                       | Dezente blaue Fläche                                          |
| `--primary-selected`              | `blue-100`                                                      | Ausgewählte Fläche                                             |
| `--secondary`                     | `slate-100`                                                     | Zurückhaltende Button-Variante                                 |
| `--muted`                         | `slate-100`                                                     | Wochenendzeilen, Kachel-Tönung, Zeilen-Hover in Tabellen       |
| `--muted-foreground`              | `slate-500`                                                     | Sekundärtext, Spaltenüberschriften                             |
| `--accent`                        | `blue-50`                                                       | Hover und Fokus auf Listen-, Menü- und Rasterzellen            |
| `--accent-foreground`             | `blue-900`                                                      | Text auf `--accent`                                            |
| `--destructive`                   | `red-600`                                                       | Ausschließlich Löschen und Fehler                              |
| `--destructive-foreground`        | `white`                                                         | Beschriftung auf `--destructive` (z. B. Löschen-Button)        |
| `--destructive-subtle`            | `red-50`                                                        | Hintergrund gefüllter Fehlerflächen (`FehlerHinweis`)          |
| `--destructive-border`            | `red-200`                                                       | Rahmen gefüllter Fehlerflächen                                 |
| `--destructive-subtle-foreground` | `red-800`                                                       | Text auf `--destructive-subtle`                                |
| `--info` / `-subtle` / `-border` / `-foreground` | `sky-600` / `sky-50` / `sky-200` / `sky-800`     | Hinweisfläche ohne Fehler-/Erfolgscharakter                    |
| `--success` / `-subtle` / `-border` / `-foreground` | `emerald-600` / `emerald-50` / `emerald-200` / `emerald-800` | Erfolgsrückmeldung                          |
| `--warning` / `-subtle` / `-border` / `-foreground` | `amber-600` / `amber-50` / `amber-300` / `amber-900` | Warnung, z. B. ungespeicherte Änderungen, Soll/Ist-Abweichung |
| `--border`                        | `slate-200`                                                     | Trennlinien, Card-Kontur (dekorativ)                            |
| `--border-strong`                 | `slate-300`                                                     | Deutliche Abgrenzungen                                          |
| `--input`                         | unverändert (`oklch(0.62 0.02 200)`)                            | **Nur** Begrenzung von Eingabefeldern                           |
| `--ring`                          | `blue-600`                                                      | Fokusindikator                                                  |
| `--radius`                        | `0.5rem`                                                        | Basis für `--radius-sm/md/lg`                                   |

**Warum `--border` und `--input` auseinanderfallen:** WCAG 1.4.11 verlangt 3:1 für die Begrenzung eines Bedienelements, wenn sie das einzige Erkennungsmerkmal ist — das gilt für Eingabefelder, nicht für dekorative Trennlinien. Beide Tokens auf denselben Wert zu legen zwingt entweder die Trennlinien zu unnötiger Härte oder die Feldrahmen unter die Schwelle. Getrennt lösen sie beides. `--input` wurde bei der Umstellung auf Blau bewusst **nicht** angefasst, um diese bereits gemessene Garantie nicht ohne erneutes Audit zu brechen.

### Statusfarben

Vier Statusfarben (`destructive`, `info`, `success`, `warning`), jede mit demselben Vier-Token-Muster: Basisfarbe (Text/Icon auf neutraler Fläche), `-subtle` (gefüllte Statusfläche), `-border` (Rahmen der Statusfläche), `-foreground` (Text auf `-subtle`). `FehlerHinweis` nutzt `bg-destructive-subtle border-destructive-border text-destructive-subtle-foreground` als Referenzbeispiel für eine gefüllte Statusfläche statt reiner Umrandung. `info` und `success` haben aktuell noch keine Aufrufstelle — die Tokens existieren, damit neue Hinweisflächen nicht wieder auf `text-muted-foreground` ausweichen.

**Regel für neue Farbwerte:** zuerst prüfen, ob ein bestehendes Token semantisch passt. Erst wenn keines passt, ein neues Token in `base.css` anlegen — nie einen rohen Farbwert oder eine Tailwind-Standardfarbe (`bg-slate-500` o. ä.) in eine Komponente schreiben.

### Mitarbeiterfarben

`TEAM_MEMBER_FARBEN` in [`src/shared/types.ts`](../../src/shared/types.ts) — zehn Werte, jeweils mit deutschem Namen. Der Name gehört zur Datenstruktur, nicht in einen Kommentar: die Farbauswahl braucht ihn als Beschriftung, sonst sagt der Screenreader den Hex-Code an.

Diese Palette ist **Datenvisualisierung** und strikt getrennt vom Theme: sie unterscheidet Personen, nie Bedienzustände.

Dargestellt werden sie über `mitarbeiterSpaltenStil()` in [`src/renderer/src/lib/planAnsicht.ts`](../../src/renderer/src/lib/planAnsicht.ts) als **Oberkante in Vollton plus 16-%-Tönung mit dunkler Schrift** — nicht als gesättigte Vollfläche mit weißer Schrift. Der Grund ist ein Kontrastbefund, siehe [`barrierefreiheit.md`](./barrierefreiheit.md). Nebeneffekt: die hellen Tönungen drucken auf A4 zuverlässiger als Volltonflächen.

## Typografie

`Inter Variable`, selbst gehostet über `@fontsource-variable/inter` (kein CDN, die App muss offline laufen). Global in `base.css` gesetzt.

**Tabellenziffern sind global aktiv** (`font-variant-numeric: tabular-nums` auf `body`). Ohne sie ist in Inter die „1" 5,70 px und die „4" 9,05 px breit — Uhrzeitspalten fluchten dann nie. Mit ihnen sind alle Ziffern 9,08 px breit. In einer App, die fast nur aus Uhrzeiten und Dauern besteht, ist das kein Detail.

| Rolle                     | Klassen                                             | Verwendung                             |
| ------------------------- | --------------------------------------------------- | -------------------------------------- |
| Seitentitel               | `text-xl font-semibold tracking-tight`              | `ManagementHeader`, als `h1`           |
| Startseiten-Titel         | `text-2xl font-semibold tracking-tight`             | einzige Ausnahme, `StartPage` als `h1` |
| Card-Titel                | `text-base font-semibold` (Default von `CardTitle`) | alle übrigen Cards, als `h2`           |
| Fließtext                 | `text-sm`                                           | Formulare, Tabellen, Rasterzellen      |
| Sekundärtext              | `text-sm text-muted-foreground`                     | `CardDescription`                      |
| Spalten-/Metabeschriftung | `text-xs font-medium tracking-wide uppercase`       | Tabellenköpfe                          |

`CardTitle` bringt seine Größe selbst mit und rendert eine echte Überschrift; die Ebene steuert das `as`-Prop (`h1` | `h2` | `h3`, Default `h2`). Vorher war es ein `<div>` ohne Größe — das Dokument hatte dadurch keine einzige Überschrift, und jede Aufrufstelle erfand ihre eigene Größe.

**Achtung beim Ergänzen:** `base.css` setzt `font-weight: normal` auf `*, ::before, ::after`. Das ist Absicht (es neutralisiert unter anderem das Standard-Fettgewicht von `<th>`), heißt aber: **jede** Betonung muss explizit gesetzt werden, auch bei Überschriften.

Größen unterhalb von `text-xs` (12 px) sind nicht Teil der Skala. Die verbleibenden `text-[9px]`/`text-[11px]` sind bekannte Abweichungen (siehe unten).

## Abstände, Radius, Elevation

| Skala                 | Werte                   | Regel                                                  |
| --------------------- | ----------------------- | ------------------------------------------------------ |
| Card-Polsterung       | `p-6`                   | Standard aller `Card*`-Teile                           |
| Kopfbereich           | `p-5`                   | `ManagementHeader` — bewusst knapper als die Card-Norm |
| Abstand Kopf ↔ Inhalt | `mt-6`, Spalten `gap-5` | beide Management-Layouts                               |
| Radius Flächen        | `rounded-lg`            | Card, Dialog, AlertDialog, Rastercontainer             |
| Radius Bedienelemente | `rounded-md`            | Button, Input, SelectTrigger, Popover, SelectContent   |
| Radius Listeneinträge | `rounded-sm`            | Einträge innerhalb von Popover und Select              |
| Elevation 1           | `shadow-sm`             | Cards und Eingabefelder im Fluss                       |
| Elevation 2           | `shadow-md`             | schwebende Auswahlflächen: Popover, SelectContent      |
| Elevation 3           | `shadow-lg`             | modale Ebenen: Dialog, AlertDialog                     |

Vorher lag `Popover` auf `rounded-lg`/`shadow-lg` und damit optisch auf Modal-Ebene, obwohl es ein kleines Dropdown ist.

## Zustände

Eine Regel je Zustand — vorher existierten fünf Abstufungen für denselben Hover (`bg-accent/40`, `/50`, `/60`, `bg-muted/50`, `/60`).

| Zustand            | Klassen                                                                                                     | Gilt für                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Hover Bedienfläche | `hover:bg-accent`                                                                                           | Listeneinträge, Menüeinträge, Rasterzellen              |
| Hover Datenzeile   | `hover:bg-muted`                                                                                            | Zeilen in `Table`                                       |
| Ausgewählt         | `bg-accent border-l-2 border-l-primary`                                                                     | markierte Zeile in Team-/Eintragstabelle                |
| Fokus              | `outline-none focus-visible:ring-2 focus-visible:ring-ring`                                                 | **alle** fokussierbaren Elemente                        |
| Fokus innenliegend | zusätzlich `focus-visible:ring-inset`                                                                       | Rasterzellen (Ring darf die Zelle nicht verlassen)      |
| Fehlerhaft         | `aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-destructive/30` | `Input`, `SelectTrigger`                                |
| Deaktiviert        | `disabled:opacity-50 disabled:pointer-events-none`                                                          | Button; Felder zusätzlich `disabled:cursor-not-allowed` |

Der Fokusring ist überall `ring-2`. Vorher schwankte er zwischen `ring-1` und `ring-2`, und `Button` definierte gar keinen — dort griff der Browser-Standardring, der optisch aus der Reihe fiel.

Der Fehler-Zustand ist neu: Validierungsfehler standen zuvor nur als Liste unter dem Formular, das betroffene Feld selbst zeigte nichts an. Das Grundprinzip „sichtbares Feedback" war damit nur zur Hälfte umgesetzt.

## Komponenten-Inventar

Alle unter `src/renderer/src/components/ui/`, jeweils mit `cn()`-Merge und durchgereichten Props.

| Komponente    | Varianten / Teile                                                                                 | Besonderheit                                            |
| ------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `Button`      | `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` × `default`, `sm`, `lg`, `icon` | `asChild` für Links; einzige Quelle für Button-Optik    |
| `Card`        | `Card`, `Header`, `Title`, `Description`, `Content`, `Footer`                                     | `Title` mit `as`-Prop, Default-Größe `text-base`        |
| `Input`       | —                                                                                                 | Fehler-Zustand über `aria-invalid`                      |
| `Label`       | —                                                                                                 | reagiert auf `peer-disabled`                            |
| `Select`      | `Trigger`, `Content`, `Item`, `Value`                                                             | nutzt `bg-card` statt eigenem `--popover`-Token         |
| `Table`       | `Header`, `Body`, `Row`, `Head`, `Cell`                                                           | `TableHead` setzt `scope="col"` selbst                  |
| `Dialog`      | `Trigger`, `Content`, `Header`, `Title`, `Description`                                            | Schließen-Schaltfläche eingebaut                        |
| `AlertDialog` | `Content`, `Header`, `Footer`, `Title`, `Description`, `Action`, `Cancel`                         | `Action` nimmt `variant` entgegen                       |
| `Popover`     | `Trigger`, `Content`                                                                              | Elevation 2                                             |
| `Collapsible` | `Trigger`, `Content`                                                                              | **reiner Durchreicher ohne eigene Optik** (siehe unten) |

`AlertDialogAction` hat seit der Konsolidierung eine `variant`-Prop. Vorher baute jede der drei Aufrufstellen die destruktive Optik identisch inline nach.

## Layout-Bausteine

Unter `src/renderer/src/components/layout/`.

| Baustein                  | Anordnung                                                               | Genutzt von     | Auswahlkriterium                             |
| ------------------------- | ----------------------------------------------------------------------- | --------------- | -------------------------------------------- |
| `ManagementHeader`        | Zurück / Titel / Aktion                                                 | beide Layouts   | —                                            |
| `ManagementLayout`        | Liste und Detail nebeneinander (`md:grid-cols-[1fr_380px]`)             | `TeamPage`      | Detailformular passt in 380 px               |
| `StackedManagementLayout` | Liste und Detail übereinander, `detailPosition` steuert die Reihenfolge | `EintraegePage` | Tabelle zu breit für ein festes Seitenraster |

Beide Layouts rendern ein `<main>`-Element und tragen damit die Landmark der Seite. `PlanPage` nutzt keines von beiden — sie ist ein Datengrid, kein Liste-plus-Formular.

**Der Breakpoint ist `md:` (768 px), nicht `lg:`.** Maßgeblich ist dabei nicht das gestartete Fenster, sondern die **Mindestgröße 640 × 480 px** aus `src/main/index.ts`: Das Fenster wird zwar beim Anzeigen maximiert, lässt sich aber bis auf diese Grenze verkleinern. Jede neue responsive Entscheidung dagegen prüfen, nicht nur im maximierten Fenster.

## Barrierefreiheit

Die verbindlichen Mindestanforderungen stehen in [`barrierefreiheit.md`](./barrierefreiheit.md). Sie sind Teil dieses Design-Systems, nicht ein nachgelagerter Prüfschritt — die kürzeste Zusammenfassung: **jedes Klickziel ist ein echtes Bedienelement, und Kontrast wird gemessen, nicht geschätzt.**

## Bekannte Abweichungen

Bewusst offen gelassen, jeweils mit Grund:

- **`Collapsible` hat keine eigene Optik.** Reicht die Radix-Primitives ohne `cn()` durch; das Aussehen entsteht vollständig an der einzigen Aufrufstelle (`EintraegePage`). Solange es dabei bleibt, wäre eine Vereinheitlichung Vorratsarbeit. Bei der zweiten Aufrufstelle nachziehen.
- **Kein `--popover`-Token.** Popover, Select und Dialog nutzen `bg-card`. Solange es nur eine erhabene Flächenfarbe gibt, wäre ein zweites Token ohne Unterschied.
- **`text-[9px]` und `text-[11px]`** in `PlanungsGrid` (viermal) und `VerkuerzteAnsicht` (einmal). Sie stammen aus der Platznot der Kennzahlen-Kopfzeile. Bei der Umstellung auf die Druckansicht (PDF-Export) prüfen, ob sie noch nötig sind.
- **`PlanungsGrid` und `VerkuerzteAnsicht` liegen in `layout/`, sind aber fachlich wissend.** Siehe [`architektur/projektstruktur.md`](../architektur/projektstruktur.md), Abschnitt „Bekannte Abweichungen".
- **Zwei Tabellensysteme.** `Table` für Stammdaten, handgebaute `<table>` für Raster und Auswertung (nötig wegen `colgroup` und `sticky`). Die Kopfzellen-Optik ist in beiden gleich, aber nicht geteilt.

## Geteilte Darstellungslogik

[`src/renderer/src/lib/planAnsicht.ts`](../../src/renderer/src/lib/planAnsicht.ts) hält, was `PlanungsGrid` und `VerkuerzteAnsicht` gemeinsam brauchen: `FEIERTAG_FARBE`, `WOCHENENDE_FARBE`, `DATUM_SPALTE_BREITE`, `RUFBEREITSCHAFT_SPALTE_BREITE`, `formatTagUndMonat()` und `mitarbeiterSpaltenStil()`.

Vorher lag all das wortgleich in beiden Dateien. Zusammengeführt wurde es **vor** dem PDF-Export, weil der Umbau von `VerkuerzteAnsicht` zu `DruckAnsicht` sonst die dritte Kopie erzeugt hätte.
