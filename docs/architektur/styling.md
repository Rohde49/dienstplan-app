# Styling-Fundament

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

## Offen

- Konkrete Farbwerte für das Theme sind noch nicht festgelegt. Das verbindet sich mit der in [`datenmodell.md`](./datenmodell.md) offenen Frage nach der Farbpalette für `TeamMember.farbe`, beides sollte zusammen entschieden werden.
- Dark Mode ist nicht gefordert und nicht Teil dieses Schritts.
