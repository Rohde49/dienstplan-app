# Entwicklungstagebuch

Chronologisches Log der Entwicklungsschritte: was wurde wann gemacht und warum. Ergänzt die TODO.md (die zeigt nur den aktuellen Stand) um den Verlauf und die Begründungen.

## 2026-08-11

**Projektplanung und Technologieentscheidung.** Stack festgelegt: Electron + Vite + React + TypeScript, lokale SQLite-Datenbank über `better-sqlite3`, Zielplattform nur Windows. Electron wurde Tauri vorgezogen, um den gesamten Stack in TypeScript zu halten und keinen zusätzlichen Rust-Lernaufwand parallel zum Studienprojekt aufzubauen (siehe [`architektur/technologieentscheidungen.md`](./architektur/technologieentscheidungen.md)). Diese Entscheidung wurde später noch einmal explizit hinterfragt und bestätigt.

**Grundgerüst aufgesetzt.** Projekt mit `electron-vite` gescaffoldet (Template Electron + React + TypeScript), Git-Repository initialisiert, ESLint/Prettier eingerichtet. Minimales Fenster mit Hot Reload per Screenshot bestätigt. IPC-Test zwischen Renderer und Main-Prozess über das Preload-Skript erfolgreich (Button "Send IPC" löst `pong`-Log im Main-Prozess aus).

**SQLite-Anbindung getestet.** `src/main/db.ts` öffnet die Datenbank unter `app.getPath('userData')/dienstplan.db` im WAL-Modus. Smoke-Test (Tabelle anlegen, Insert, Select) beim App-Start bestätigt per Log und Datei auf der Platte.

**Git-Repository auf GitHub verbunden.** Repository `github.com/Rohde49/dienstplan-app` angelegt, erster Commit ("Initial scaffold: Electron + Vite + React + TypeScript") gepusht, `main` mit `origin/main` synchron.

**Architektur für die nächsten Schritte besprochen.** Vor dem Einstieg in Team-Verwaltung und Planungsansicht wurde die Projektstruktur geklärt: Trennung von Fachlogik (Main-Prozess, nahe an den Repositories) und Darstellungslogik (Renderer, möglichst "dumm"), zentrale Entitäten in `shared/types.ts`, Repository-Pattern um SQLite zu kapseln. Teststrategie festgelegt: Fachlogik als reine Funktionen unit-testen (höchste Priorität), Repository-Layer gegen In-Memory-SQLite testen, UI-/E2E-Tests vorerst zurückstellen. Details siehe [`architektur/projektstruktur.md`](./architektur/projektstruktur.md) und [`architektur/teststrategie.md`](./architektur/teststrategie.md).

**Dokumentation konsolidiert.** `docs/`-Ordner angelegt, bisher im Root verstreute `TODO.md` und `claude-code-UMGANG.md` dorthin verschoben, Architektur-Erkenntnisse in eigene Dateien unter `docs/architektur/` festgehalten.

## 2026-08-12

**Styling-Fundament eingerichtet (Schritt 2).** Tailwind v4 über `@tailwindcss/vite` im Renderer eingerichtet (kein `tailwind.config.js`, Theme über `@theme inline` in `assets/base.css`), shadcn im Style „new-york" mit `components.json` und Pfad-Alias `@/` → `src/renderer/src` (ersetzt den bis dahin im Code ungenutzten `@renderer`-Alias in `electron.vite.config.ts` und `tsconfig.web.json`). `cn()`-Hilfsfunktion korrekt als `twMerge(clsx(...))` angelegt (`src/renderer/src/lib/utils.ts`), im Gegensatz zum unvollständigen `cn()` im Referenzprojekt `familienplaner-frontend`, das nur `clsx` nutzt. Erste UI-Primitives `Card` (inkl. `CardDescription`) und `Button` (mit `asChild`/`@radix-ui/react-slot`) von Hand nachgebaut, keine Codeübernahme. Details und Begründung siehe [`architektur/styling.md`](./architektur/styling.md).

**Theme-Farbpalette vorgeschlagen, zunächst nicht final.** Neutrale, zurückhaltende Palette gewählt (Graustufen + neutraler Primary-Ton), damit die später noch festzulegende `TeamMember.farbe`-Palette im Dienstplan-Grid nicht mit einem "lauten" App-Akzent konkurriert. Konkrete Werte in `assets/base.css`, Verknüpfung mit der offenen Frage in [`architektur/datenmodell.md`](./architektur/datenmodell.md) dokumentiert.

**Zwei Nachbesserungen nach erster Umsetzung.** `.editorconfig` war bei der Umsetzung ungewollt verändert worden (Zeilenumbrüche normalisiert) — Ursache war ein stale `.git/index.lock`, das den Restore zunächst blockierte, nach Entfernen des Locks per `git checkout -- .editorconfig` zurückgesetzt. Die Randfarbe von `Card` und der `outline`-Variante von `Button` nutzte anfangs nur die Tailwind-Utility `border` ohne `border-border`, wodurch `currentColor` statt der Theme-Variable `--border` griff; behoben über einen globalen `@layer base`-Reset in `base.css` (`*, ::before, ::after { border-color: var(--border); outline-color: var(--ring) }`) statt lokaler Einzelklassen an jeder Komponente — passt zum shadcn-Standardmuster und ist robuster für künftige Primitives in Schritt 3+.

**Verifikation.** `npm run typecheck` und `npm run lint` sauber. CSS-Verdrahtung (Tailwind → `@theme inline` → generierte Utilities) zusätzlich per `npm run dev` und Screenshot bestätigt (testweise gesetzte Klasse `bg-accent` auf der bestehenden Demo-Seite sichtbar wirksam, danach wieder entfernt) — gleiches Prüfmuster wie in Schritt 1.

**Schritt 2 abgeschlossen: Farbpaletten final entschieden.** Der letzte offene Punkt aus Schritt 2 wurde nachgezogen: Theme-Palette (neutral, s. o.) als final bestätigt, und die bis dahin komplett offene `TeamMember.farbe`-Palette in [`architektur/datenmodell.md`](./architektur/datenmodell.md) festgelegt — zehn kräftige, gut unterscheidbare Hex-Farbtöne, bewusst ohne Grauton (für UI-Chrome reserviert) und mit Abstand zum `--destructive`-Rotton (Verwechslungsgefahr mit Fehler-/Lösch-Zuständen). Die eigentliche `TeamMember`-Entität samt `shared/types.ts` wird erst bei der Umsetzung der Team-Verwaltung angelegt (siehe `architektur/projektstruktur.md`, Entität erst bei Bedarf), nur die Farbwerte selbst sind jetzt schon fixiert. Schritt 2 damit vollständig abgehakt, Schritt 3 (Startseite mit Navigation) ist der nächste Schritt.
