# Claude-Code-Setup: Stand und Empfehlungen

Wie das Projekt für Claude Code eingerichtet ist und was daran fehlt. Ergänzt die Bedienungs-Kurzreferenz [`claude-code-umgang.md`](./claude-code-umgang.md): dort steht, _wie man Claude Code bedient_, hier, _wie das Projekt dafür eingerichtet ist_.

Ursprünglich eine Momentaufnahme vom 15.08.2026. Beim Doku-Umbau am 16.08.2026 konsolidiert: Erledigte Punkte sind nicht mehr durchgestrichen, sondern in die Statusspalten eingearbeitet, und die Zahlen sind auf den heutigen Stand gebracht.

## 1. Ist-Zustand

| Bereich                 | Status                                                                                          | Bewertung |
| ----------------------- | ----------------------------------------------------------------------------------------------- | --------- |
| `CLAUDE.md`             | verweist auf `docs/` statt zu duplizieren, Workflow-Konventionen enthalten                      | ✅        |
| Projektdokumentation    | `docs/` nach Bereichen gegliedert, siehe [`../README.md`](../README.md)                         | ✅        |
| Prüfsignale (lokal)     | `typecheck` (node + web getrennt), `lint`, `test` (19 Dateien / 174 Fälle), `test:e2e`, `build` | ✅        |
| Testebenen              | fünf, inklusive Komponententests, IPC-Vertragstest und automatisierter Druckprüfung             | ✅        |
| Aktive Plugins          | `plugin-dev`, `frontend-design`, `claude-code-setup`, `code-review` (global aktiviert)          | ✅        |
| Permission-Modus        | global `defaultMode: "auto"`                                                                    | ✅        |
| Projekt-`settings.json` | angelegt beim Doku-Umbau, enthält den Stop-Hook zur Doku-Erinnerung                             | ✅        |
| Projekt-Skills          | `/doku-pflege` vorhanden; `schritt-start`/`schritt-abschluss` weiterhin offen                   | ⚠️        |
| Hooks                   | Stop-Hook für die Doku-Erinnerung; Prettier-/Typecheck-Hooks weiterhin offen                    | ⚠️        |
| Subagenten              | keine (`.claude/agents/` fehlt)                                                                 | ❌        |
| MCP-Server              | keine (`.mcp.json` fehlt)                                                                       | ⚠️        |
| CI                      | kein `.github/` — trotz GitHub-Remote laufen alle Prüfungen nur lokal                           | ❌        |

**Kernbefund, unverändert gültig:** Die _Dokumentation_ des Projekts ist überdurchschnittlich gut, die _Automatisierung_ hinkt hinterher. Was in `CLAUDE.md` als Regel steht, muss in jeder Session neu gelesen und freiwillig befolgt werden. Hooks und Skills sind der Mechanismus, um daraus erzwungenes bzw. abrufbares Verhalten zu machen — mit `/doku-pflege` und dem Stop-Hook ist der erste Schritt getan, der größte verbleibende Hebel ist CI.

## 2. Projektprofil

| Kategorie      | Erkannt                                                            | Wirkt sich aus auf         |
| -------------- | ------------------------------------------------------------------ | -------------------------- |
| Laufzeit       | Electron 39, Node/Chromium, Windows-only                           | Hooks, E2E-Ebene           |
| Sprache        | TypeScript 5.9, zwei getrennte tsconfigs (node/web)                | Typecheck-Hook             |
| Frontend       | React 19, React Router 7 (`HashRouter`), Tailwind v4, shadcn/Radix | Design-Subagent, context7  |
| Datenhaltung   | `better-sqlite3` 13, ausschließlich im Main-Prozess                | IPC-Subagent               |
| Prozessgrenzen | Main / Preload / Renderer strikt getrennt                          | IPC-Subagent (wichtigster) |
| Tests          | Vitest 4, fünf Ebenen inkl. jsdom und Playwright-E2E               | Test-Hook, CI              |
| Formatierung   | Prettier 3.7 + ESLint 9 (mit `--cache`)                            | Format-/Lint-Hook          |
| Remote         | `github.com/Rohde49/dienstplan-app`                                | GitHub MCP, CI             |
| Packaging      | `electron-builder`, nur `build:win` relevant                       | —                          |

## 3. Hooks

Hooks laufen unabhängig davon, ob Claude sie „im Kopf hat". Genau deshalb sind sie der größte Hebel: Sie machen aus Konventionen harte Zusagen.

| Empfehlung                                  | Warum hier relevant                                                                                                     | Stand                          |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Stop: Doku-Erinnerung**                   | `src/` geändert, `docs/` nicht — genau das Muster, das dreimal einen manuellen Dokumentationsdurchgang nötig machte     | ✅ eingerichtet, blockiert nie |
| **PostToolUse: Prettier**                   | Prettier ist eingerichtet, läuft aber nur manuell. Nach jeder Bearbeitung formatieren beendet Formatier-Diffs im Commit | offen, hohe Priorität          |
| **PostToolUse: Typecheck**                  | Stärkstes Prüfsignal, das nicht von selbst anspringt. Ein Fehler wird beim Verursachen sichtbar, nicht Schritte später  | offen, hohe Priorität          |
| **PreToolUse: `docs/TODO.md` schützen**     | Einziger Fortschritts-Wahrheitsort; eine Bestätigungspflicht verhindert stilles Abhaken                                 | offen, mittel                  |
| **PreToolUse: `package-lock.json` blocken** | Generierte Datei; händische Änderungen sind nie beabsichtigt                                                            | offen, mittel                  |
| **PostToolUse: betroffene Tests**           | Testdateien liegen neben ihrem Modul; nach Änderung an `x.ts` gezielt `vitest run x.test.ts`                            | offen, mittel                  |

Für den Typecheck-Hook empfiehlt sich ein kleines Skript, das nur bei `.ts`/`.tsx` anspringt und je nach Pfad die passende Variante aufruft (`src/main`, `src/preload` → `typecheck:node`; `src/renderer` → `typecheck:web`) — ein voller `npm run typecheck` nach jeder Bearbeitung wäre zu langsam.

> Beim Einrichten helfen die Skills `update-config` und `plugin-dev:hook-development`.

## 4. Skills

Das Projekt hat einen stark wiederholten Arbeitsablauf, der heute in Prosa in `docs/ablaufplaene/` und `CLAUDE.md` steht. Genau das gehört in eine Skill: einmal formuliert, per `/name` abrufbar.

| Empfehlung              | Warum hier relevant                                                                                                                       | Aufruf     | Stand                     |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------------- |
| **`doku-pflege`**       | Ersetzt den Dokumentationsdurchgang, der bis dahin dreimal von Hand nötig war                                                             | nur Nutzer | ✅ eingerichtet           |
| **`schritt-start`**     | Ersetzt das immer gleiche Anfangs-Prompt: `TODO.md` lesen, Schritt bestimmen, Ablaufplan laden, betroffene Architekturdokumente mitnehmen | nur Nutzer | offen, **hohe** Priorität |
| **`schritt-abschluss`** | Die drei Abschlussarbeiten (Häkchen, Tagebucheintrag, Commit) werden heute einzeln angewiesen und gehen leicht vergessen                  | nur Nutzer | offen, **hohe** Priorität |
| **`neuer-ablaufplan`**  | Die Dateien unter `docs/ablaufplaene/` folgen erkennbar demselben Aufbau; eine Vorlage macht daraus eine Minute statt einer Viertelstunde | nur Nutzer | offen, mittel             |
| **`neues-repository`**  | Repository + IPC-Handler + Preload-Typen + `shared/types.ts` folgen einem festen Muster über vier Dateien und drei Prozessgrenzen hinweg  | nur Nutzer | offen, mittel             |

`disable-model-invocation: true` bedeutet: nur per Slash-Befehl aufrufbar, Claude startet den Ablauf nicht von sich aus. Für alles, was schreibt oder committet, ist das zwingend.

Die Empfehlung `app-screenshot` ist **entfallen**: Druckausgabe, Durchstich und Prozessgrenze sind seit dem 16.08.2026 über die E2E-Ebene automatisiert. Was bleibt, ist die schnelle Sichtprüfung — deren eine Regel („laufende Dev-Instanz weiterverwenden") steht jetzt in [`../test/testpraxis.md`](../test/testpraxis.md).

## 5. Subagenten

| Empfehlung                  | Warum hier relevant                                                                                                                                                                  | Priorität |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| **`ipc-pruefer`**           | Die wichtigste Architekturregel ist unsichtbar: Ein Verstoß gegen die Prozessgrenzen fällt weder Typecheck noch Tests auf, sondern erst zur Laufzeit                                 | **hoch**  |
| **`design-system-pruefer`** | Tokens, Skalen und Barrierefreiheits-Mindestanforderungen sind verbindlich festgelegt; ein Agent, der UI-Änderungen dagegen prüft, hält das Design-System nach Schritt 17 ff. stabil | mittel    |

Beide Prompts sollten auf die zuständigen Dokumente verweisen ([`../architektur/prozessgrenzen.md`](../architektur/prozessgrenzen.md) bzw. [`../style/design-system.md`](../style/design-system.md)), statt die Regeln zu wiederholen — sonst entsteht eine dritte Fassung, die veraltet.

## 6. MCP-Server

| Empfehlung     | Warum hier relevant                                                                                                                                                                                             | Priorität |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| **context7**   | Der Stack ist durchgehend sehr neu: Electron 39, React 19, Tailwind v4 (kein `tailwind.config.js` mehr), React Router 7, Vitest 4. Bei genau diesen Versionen ist Halbwissen aus dem Training am gefährlichsten | **hoch**  |
| **GitHub MCP** | Remote existiert, CI ist geplant — Nutzen entsteht aber erst, sobald mit Issues/PRs gearbeitet wird                                                                                                             | niedrig   |

```bash
claude mcp add context7
```

**Nicht nötig:** Ein Browser-/Playwright-MCP (für eine Electron-App mit `file://`-Renderer der falsche Weg; die E2E-Ebene über Playwrights `_electron`-API leistet das) und ein Datenbank-MCP (die Datei liegt in `userData`, die Repositories sind über Ebene 2 abgedeckt).

## 7. Konfigurationshygiene

| Punkt                                   | Befund                                                                                                    | Stand                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `.claude/settings.json` fehlt           | Es existierte nur `settings.local.json`, die vom Repository ausgeschlossen ist                            | ✅ angelegt und eingecheckt                                        |
| Toter Permission-Eintrag                | `settings.local.json` erlaubt einen `node cdp.mjs eval …`-Aufruf; die Datei existiert im Repository nicht | offen — die Datei ist nicht eingecheckt, Nutzer entscheidet        |
| Keine Permission-Allowlist              | `npm run test`, `lint`, `typecheck`, `build` sind harmlos und werden ständig gebraucht                    | offen                                                              |
| `.gitignore` deckte `.claude/` nicht ab | Funktionierte nur wegen der globalen Ignore-Datei des Nutzers                                             | ✅ `.claude/settings.local.json` steht in der Projekt-`.gitignore` |

Vorschlag für die Allowlist:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run test:*)",
      "Bash(npm run lint)",
      "Bash(npm run typecheck:*)",
      "Bash(npm run format)",
      "Bash(npx vitest run:*)"
    ]
  }
}
```

> Die Skill `fewer-permission-prompts` leitet eine solche Liste aus den bisherigen Sitzungsprotokollen ab, statt sie zu raten.

## 8. Größter verbleibender Einzelzugewinn: CI

`CLAUDE.md` fordert selbst: „Wo möglich eine Prüfmöglichkeit schaffen." Die Signale existieren, laufen aber nur, wenn jemand sie manuell startet — ein Commit kann mit gebrochenem Typecheck oder roten Tests auf `main` landen, ohne dass es auffällt.

`.github/workflows/ci.yml` mit `npm ci && npm run lint && npm run typecheck && npm run test` bei Push und PR, dazu `npm run build && npm run test:e2e` auf einem Windows-Runner.

## 9. Priorisierte Reihenfolge

| Welle | Maßnahme                                               | Nutzen                                                     |
| ----- | ------------------------------------------------------ | ---------------------------------------------------------- |
| 1     | Hook: Prettier nach `Edit`/`Write`                     | Keine Formatier-Diffs mehr in Commits                      |
| 1     | Hook: gezielter Typecheck nach `.ts`/`.tsx`-Änderungen | Fehler sofort statt Schritte später sichtbar               |
| 1     | `claude mcp add context7`                              | Verlässliche Doku für Tailwind v4 / React 19 / Electron 39 |
| 1     | Permission-Allowlist in `.claude/settings.json`        | Weniger Rückfragen ohne Risiko                             |
| 2     | Skills `schritt-start` + `schritt-abschluss`           | Der häufigste Ablauf wird zu zwei Slash-Befehlen           |
| 2     | Subagent `ipc-pruefer`                                 | Sichert die Architekturregel ohne automatisches Signal ab  |
| 2     | CI-Workflow                                            | Prüfsignal unabhängig von Disziplin                        |
| 3     | Subagent `design-system-pruefer`                       | Hält das Design-System langfristig stabil                  |
| 3     | Skills `neuer-ablaufplan`, `neues-repository`          | Beschleunigt wiederkehrende Dateimuster                    |
| 3     | Hook: betroffene Tests nach Modul-Änderung             | Feineres, schnelleres Testsignal                           |

## 10. Was bewusst nicht empfohlen wird

| Nicht empfohlen                    | Begründung                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Playwright-/Browser-MCP            | Für Electron mit `file://`-Renderer der falsche Weg; die E2E-Ebene deckt es ab                            |
| Datenbank-MCP (SQLite)             | DB liegt in `userData`, Zugriff bewusst auf den Main-Prozess beschränkt, Tests decken die Repositories ab |
| Weitere Einträge in `CLAUDE.md`    | Die Datei ist auf Verweise ausgelegt; zusätzliche Regeln gehören nach `docs/` oder in eine Skill          |
| Linear-/Slack-/Jira-MCP            | Einzelentwickler-Studienprojekt, keine Teamwerkzeuge im Einsatz                                           |
| `disable-model-invocation` überall | Nur für Skills mit Nebenwirkungen sinnvoll; sonst schränkt es unnötig ein                                 |
