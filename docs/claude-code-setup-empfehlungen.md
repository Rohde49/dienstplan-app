# Claude-Code-Setup: Analyse und Empfehlungen

Momentaufnahme vom 15.08.2026. Grundlage der Analyse: `CLAUDE.md`, `.claude/`, die globale Konfiguration unter `~/.claude/settings.json`, `package.json`, die Projektstruktur unter `src/` sowie die Dokumentation unter [`docs/`](./README.md).

Ergänzt die Bedienungs-Kurzreferenz [`claude-code-UMGANG.md`](./claude-code-UMGANG.md): dort steht, _wie man Claude Code bedient_, hier steht, _wie das Projekt für Claude Code eingerichtet ist_ und was daran fehlt.

Dieses Dokument beschreibt nur — es wurde nichts davon installiert oder konfiguriert.

> **Nachtrag 16.08.2026:** Der Abschnitt zu Prüfsignalen (5.) ist inzwischen teilweise überholt. Die Teststrategie wurde grundlegend überarbeitet und auf fünf Ebenen ausgebaut (Komponententests, IPC-Vertragstest und Playwright-E2E inklusive automatisierter Druckprüfung sind eingerichtet). Erledigte Punkte sind unten durchgestrichen; die Skill-Empfehlung `app-screenshot` ist damit entfallen. Der aktuelle Stand steht in [`architektur/teststrategie.md`](./architektur/teststrategie.md). Die Zahlen im Ist-Zustand (17 Testdateien) beziehen sich weiterhin auf den 15.08.2026.

---

## 1. Ist-Zustand

| Bereich                 | Status                                                                                                 | Bewertung |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | --------- |
| `CLAUDE.md`             | 5,7 KB, verweist auf `docs/` statt zu duplizieren, Workflow-Konventionen enthalten                     | ✅        |
| Projektdokumentation    | `docs/` mit TODO, Tagebuch, 7 Architekturdokumenten, 14 Ablaufplänen                                   | ✅        |
| Prüfsignale (lokal)     | `typecheck` (node + web getrennt), `lint`, `test` (17 Testdateien), `build`                            | ✅        |
| Aktive Plugins          | `plugin-dev`, `frontend-design`, `claude-code-setup`, `code-review` (global aktiviert)                 | ✅        |
| Permission-Modus        | global `defaultMode: "auto"`                                                                           | ✅        |
| Projekt-`settings.json` | existiert nicht — nur `.claude/settings.local.json` mit einem einzigen, veralteten Eintrag             | ⚠️        |
| Hooks                   | keine                                                                                                  | ❌        |
| Projekt-Skills          | keine (`.claude/skills/` fehlt)                                                                        | ❌        |
| Subagenten              | keine (`.claude/agents/` fehlt)                                                                        | ❌        |
| MCP-Server              | keine (`.mcp.json` fehlt)                                                                              | ⚠️        |
| CI                      | kein `.github/` — trotz GitHub-Remote laufen alle Prüfungen nur lokal und nur, wenn jemand daran denkt | ❌        |
| Wiederkehrender Ablauf  | „TODO-Schritt → Ablaufplan → Umsetzung → Tagebuch → Commit" ist dokumentiert, aber nicht automatisiert | ⚠️        |

**Kernbefund:** Die _Dokumentation_ des Projekts ist überdurchschnittlich gut, die _Automatisierung_ praktisch bei null. Alles, was in `CLAUDE.md` und `claude-code-UMGANG.md` als Regel steht, muss aktuell in jeder Session neu gelesen und freiwillig befolgt werden. Hooks und Skills sind genau der Mechanismus, um daraus erzwungenes bzw. abrufbares Verhalten zu machen.

---

## 2. Projektprofil

| Kategorie      | Erkannt                                                            | Wirkt sich aus auf         |
| -------------- | ------------------------------------------------------------------ | -------------------------- |
| Laufzeit       | Electron 39, Node/Chromium, Windows-only                           | Hooks, Screenshot-Workflow |
| Sprache        | TypeScript 5.9, zwei getrennte tsconfigs (node/web)                | Typecheck-Hook             |
| Frontend       | React 19, React Router 7 (`HashRouter`), Tailwind v4, shadcn/Radix | Design-Subagent, context7  |
| Datenhaltung   | `better-sqlite3` 13, ausschließlich im Main-Prozess                | IPC-Subagent               |
| Prozessgrenzen | Main / Preload / Renderer strikt getrennt                          | IPC-Subagent (wichtigster) |
| Tests          | Vitest 4, fünf Ebenen inkl. jsdom und Playwright-E2E               | Test-Hook, CI              |
| Formatierung   | Prettier 3.7 + ESLint 9 (mit `--cache`)                            | Format-/Lint-Hook          |
| Remote         | `github.com/Rohde49/dienstplan-app`                                | GitHub MCP, CI             |
| Packaging      | `electron-builder`, nur `build:win` relevant                       | —                          |

---

## 3. Empfehlungen

### ⚡ 3.1 Hooks — `.claude/settings.json`

Hooks laufen unabhängig davon, ob Claude sie „im Kopf hat". Genau deshalb sind sie hier der größte Hebel: Sie machen aus Konventionen harte Zusagen.

| Empfehlung                                  | Warum hier relevant                                                                                                                                                              | Aufwand | Priorität |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------- |
| **PostToolUse: Prettier**                   | Prettier ist eingerichtet, wird aber nur manuell über `npm run format` ausgeführt. Nach jeder Bearbeitung formatieren beendet Formatier-Diffs im Commit endgültig.               | klein   | hoch      |
| **PostToolUse: Typecheck**                  | Stärkstes verfügbares Prüfsignal, das nicht automatisch anspringt. Ein Fehler wird dadurch beim Verursachen sichtbar, nicht erst Schritte später.                                | klein   | hoch      |
| **PreToolUse: `docs/TODO.md` schützen**     | Die Datei ist laut `CLAUDE.md` der einzige Fortschritts-Wahrheitsort. Eine Bestätigungspflicht verhindert stilles Abhaken noch nicht erledigter Punkte.                          | klein   | mittel    |
| **PreToolUse: `package-lock.json` blocken** | 398 KB generierte Datei; händische Änderungen daran sind nie beabsichtigt.                                                                                                       | klein   | mittel    |
| **PostToolUse: betroffene Tests**           | 17 Testdateien liegen direkt neben ihrem Modul (`x.ts` ↔ `x.test.ts`). Nach Änderung an `x.ts` gezielt `vitest run x.test.ts` laufen lassen ist schnell und sehr aussagekräftig. | mittel  | mittel    |

Beispielkonfiguration für die ersten beiden (in `.claude/settings.json`, eingecheckt):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$CLAUDE_TOOL_INPUT_FILE_PATH\" 2>/dev/null || true"
          }
        ]
      }
    ]
  }
}
```

Für den Typecheck empfiehlt sich ein kleines Skript, das nur bei `.ts`/`.tsx`-Dateien anspringt und je nach Pfad (`src/main`, `src/preload` → `typecheck:node`; `src/renderer` → `typecheck:web`) die passende Variante aufruft — ein voller `npm run typecheck` nach jeder Bearbeitung wäre zu langsam.

> Beim Einrichten hilft die Skill `update-config`; für komplexere Hooks das Plugin `hookify` bzw. die Skill `plugin-dev:hook-development`.

---

### 🎯 3.2 Skills — `.claude/skills/<name>/SKILL.md`

Das Projekt hat einen **stark wiederholten Arbeitsablauf**, der aktuell in Prosa in `docs/ablaufplaene/` und `CLAUDE.md` steht. Genau so etwas gehört in eine Skill: einmal formuliert, per `/name` abrufbar, ohne dass die Regeln erneut erklärt werden müssen.

| Empfehlung              | Warum hier relevant                                                                                                                                                                                                                                                                                                                                                        | Aufruf     | Aufwand | Priorität |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------- | --------- |
| **`schritt-start`**     | Ersetzt das immer gleiche Anfangs-Prompt: `docs/TODO.md` lesen, aktuellen Schritt bestimmen, zugehörigen Ablaufplan unter `docs/ablaufplaene/` laden, betroffene Architekturdokumente mitnehmen. Nach 17 Schritten die am häufigsten wiederholte Handbewegung im Projekt.                                                                                                  | nur Nutzer | klein   | **hoch**  |
| **`schritt-abschluss`** | Die drei Abschlussarbeiten (Häkchen in `TODO.md`, Eintrag in `entwicklungstagebuch.md`, Commit mit passender Nachricht) werden heute jedes Mal einzeln angewiesen und gehen leicht vergessen.                                                                                                                                                                              | nur Nutzer | klein   | **hoch**  |
| ~~`app-screenshot`~~    | **Hinfällig seit dem 16.08.2026.** Druckausgabe, Durchstich und Prozessgrenze sind jetzt über die E2E-Ebene automatisiert (siehe [`teststrategie.md`](./architektur/teststrategie.md)). Was bleibt, ist die schnelle Sichtprüfung während der Entwicklung — dafür genügt eine kurze Skill mit der einen Regel: laufende Dev-Instanz wiederverwenden, keine zweite starten. | beide      | klein   | niedrig   |
| **`neuer-ablaufplan`**  | Die 14 Dateien unter `docs/ablaufplaene/` folgen erkennbar demselben Aufbau. Eine Skill mit Vorlage macht daraus eine Minute statt einer Viertelstunde.                                                                                                                                                                                                                    | nur Nutzer | klein   | mittel    |
| **`neues-repository`**  | Repository + IPC-Handler + Preload-Typen + `shared/types.ts` folgen einem festen Muster über vier Dateien und drei Prozessgrenzen hinweg. Ideal als Vorlagen-Skill.                                                                                                                                                                                                        | nur Nutzer | mittel  | mittel    |

Frontmatter-Muster für `schritt-start`:

```yaml
---
name: schritt-start
description: Startet den nächsten Entwicklungsschritt — liest docs/TODO.md, lädt den Ablaufplan und die betroffenen Architekturdokumente.
disable-model-invocation: true
---
```

`disable-model-invocation: true` bedeutet: nur per `/schritt-start` aufrufbar, Claude startet den Ablauf nicht von sich aus. Für `schritt-abschluss` (schreibt und committet) ist das zwingend.

> Beim Schreiben hilft `anthropic-skills:skill-creator` bzw. `plugin-dev:skill-development`.

---

### 🤖 3.3 Subagenten — `.claude/agents/<name>.md`

| Empfehlung                  | Warum hier relevant                                                                                                                                                                                                                                                                                                              | Aufwand | Priorität |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------- |
| **`ipc-pruefer`**           | Die wichtigste Architekturregel des Projekts ist unsichtbar: `better-sqlite3` darf nie in den Renderer, Repositories nehmen die DB-Verbindung als Parameter, jeder Zugriff läuft über IPC + Preload. Ein Verstoß fällt weder Typecheck noch Tests auf, sondern erst zur Laufzeit. Genau dafür ist ein spezialisierter Prüfer da. | klein   | **hoch**  |
| **`design-system-pruefer`** | [`architektur/design-system.md`](./architektur/design-system.md) legt Tokens, Skalen und Barrierefreiheits-Mindestanforderungen verbindlich fest. Ein Agent, der UI-Änderungen dagegen prüft (harte Farbwerte, Abstände außerhalb der Skala, Kontrast, Fokuszustände), hält das Design-System nach Schritt 17 ff. stabil.        | klein   | mittel    |

Skizze für `ipc-pruefer`:

```yaml
---
name: ipc-pruefer
description: Prüft Änderungen auf Einhaltung der Electron-Prozessgrenzen (Main/Preload/Renderer) und der Repository-Konventionen dieses Projekts.
tools: Read, Grep, Glob
---
```

Der Prompt sollte auf [`architektur/projektstruktur.md`](./architektur/projektstruktur.md) und [`architektur/teststrategie.md`](./architektur/teststrategie.md) verweisen, statt die Regeln zu wiederholen.

---

### 🔌 3.4 MCP-Server

| Empfehlung     | Warum hier relevant                                                                                                                                                                                                                                                              | Aufwand | Priorität |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------- |
| **context7**   | Der Stack ist durchgehend sehr neu: Electron 39, React 19, Tailwind **v4** (kein `tailwind.config.js` mehr, Theme über `@theme inline`), React Router 7, Vitest 4. Bei genau diesen Versionen ist Halbwissen aus dem Training am gefährlichsten — Live-Doku-Abruf beseitigt das. | klein   | **hoch**  |
| **GitHub MCP** | Remote existiert, CI ist geplant. Nutzen entsteht aber erst, sobald tatsächlich mit Issues/PRs gearbeitet wird — im aktuellen Einzelentwickler-Modus mit direkten Commits auf `main` reicht die `gh`-CLI.                                                                        | klein   | niedrig   |

Installation:

```bash
claude mcp add context7
```

**Nicht nötig:** Ein Browser-/Playwright-MCP. Der Desktop-Client bringt bereits Browser-Werkzeuge mit, und für eine Electron-App mit `file://`-Renderer ist das ohnehin nicht der richtige Weg — hier führt die E2E-Ebene über Playwrights `_electron`-API weiter (seit dem 16.08.2026 unter `e2e/` eingerichtet). Datenbank-MCP entfällt ebenfalls: Die SQLite-Datei liegt unter `app.getPath('userData')` und wird über die Repository-Tests gegen In-Memory-SQLite abgedeckt.

---

### 🧩 3.5 Plugins

| Plugin              | Aktiv | Bewertung                                                                                                                           |
| ------------------- | ----- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `code-review`       | ja    | Passt gut. `/code-review` vor jedem Schritt-Commit einsetzen — das ist der einzige derzeit ungenutzte Hebel mit sofortiger Wirkung. |
| `frontend-design`   | ja    | Passend für React/Tailwind/shadcn, besonders für die anstehende Druckvorschau (Schritt 17).                                         |
| `plugin-dev`        | ja    | Nur relevant, wenn die Skills/Agenten aus 3.2/3.3 gebaut werden — dann aber genau das richtige Werkzeug.                            |
| `claude-code-setup` | ja    | Setup-Werkzeug (Quelle dieses Berichts). Kann nach dem Einrichten deaktiviert bleiben.                                              |

Ergänzend interessant: `anthropic-agent-skills` (u. a. `docx`/`pdf`), falls die Studienprojekt-Dokumentation am Ende als Word- oder PDF-Abgabe aus den `docs/`-Markdown-Dateien erzeugt werden soll.

---

## 4. Konfigurationshygiene

| Punkt                                  | Befund                                                                                                                                               | Empfehlung                                                                                                                                           |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/settings.json` fehlt          | Es existiert nur `settings.local.json`, und die ist über die globale Git-Ignore-Regel `**/.claude/settings.local.json` vom Repository ausgeschlossen | Projektweite Einstellungen (Hooks, Permissions) in ein eingechecktes `settings.json` — überlebt Rechnerwechsel und ist Teil der Projektdokumentation |
| Toter Permission-Eintrag               | `settings.local.json` erlaubt einen `node cdp.mjs eval …`-Aufruf; die Datei `cdp.mjs` existiert im Repository nicht (mehr)                           | Eintrag entfernen — der Weg, für den er gedacht war, ist durch die E2E-Ebene abgelöst                                                                |
| Keine Permission-Allowlist             | `npm run test`, `lint`, `typecheck`, `build` sind harmlos und werden ständig gebraucht                                                               | In `.claude/settings.json` erlauben — spart Rückfragen, ohne Risiko                                                                                  |
| `CLAUDE.md`-Länge                      | 5,7 KB, noch im grünen Bereich, aber wachsend                                                                                                        | Bei weiterem Wachstum: Ausgelagerte Details bleiben in `docs/`, `CLAUDE.md` behält nur Verweise — dieses Muster ist bereits richtig angelegt         |
| `.gitignore` deckt `.claude/` nicht ab | Funktioniert derzeit nur wegen der globalen Ignore-Datei des Nutzers                                                                                 | `.claude/settings.local.json` explizit in die Projekt-`.gitignore` aufnehmen — macht das Verhalten unabhängig von der Rechnerkonfiguration           |

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

> Die Skill `fewer-permission-prompts` kann eine solche Liste aus den bisherigen Sitzungsprotokollen ableiten, statt sie zu raten.

---

## 5. Prüfsignale und Prozess

`CLAUDE.md` fordert selbst: „Wo möglich eine Prüfmöglichkeit schaffen — ohne Prüfsignal wird kaputter Code nicht selbst erkannt." Die Signale existieren, laufen aber nur, wenn jemand sie manuell startet.

| Lücke                                     | Auswirkung                                                                                          | Empfehlung                                                                                                                                                                                                                    |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kein CI                                   | Ein Commit kann mit gebrochenem Typecheck oder roten Tests auf `main` landen, ohne dass es auffällt | `.github/workflows/ci.yml`: `npm ci && npm run lint && npm run typecheck && npm run test` bei Push und PR, dazu `npm run build && npm run test:e2e` auf einem Windows-Runner — jetzt der stärkste verbleibende Einzelzugewinn |
| Tests laufen nicht automatisch            | Regressionen werden erst beim nächsten bewussten `npm run test` sichtbar                            | Test-Hook aus 3.1, oder mindestens `npm run test` fest in `schritt-abschluss`                                                                                                                                                 |
| ~~Nur zwei Testebenen vorhanden~~         | ~~UI-Schicht und IPC-Verdrahtung ungeprüft~~                                                        | **Erledigt am 16.08.2026**: fünf Ebenen, zwei Vitest-Projekte (Node/jsdom), Komponententests, IPC-Vertragstest, Playwright-E2E                                                                                                |
| ~~Visuelle Prüfung nicht standardisiert~~ | ~~Druckvorschau nur per Augenmaß prüfbar~~                                                          | **Erledigt am 16.08.2026**: `printToPDF` plus PDF-Auswertung prüft Seitenzahl und Textinhalt automatisiert                                                                                                                    |

---

## 6. Priorisierte Reihenfolge

### Welle 1 — sofort, kleiner Aufwand, sofortige Wirkung

| #   | Maßnahme                                                                      | Nutzen                                                     | Aufwand |
| --- | ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ------- |
| 1   | `.claude/settings.json` anlegen, toten `cdp.mjs`-Eintrag entfernen, Allowlist | Saubere Grundlage für alles Weitere, weniger Rückfragen    | ~10 Min |
| 2   | Hook: Prettier nach `Edit`/`Write`                                            | Keine Formatier-Diffs mehr in Commits                      | ~10 Min |
| 3   | Hook: gezielter Typecheck nach `.ts`/`.tsx`-Änderungen                        | Fehler sofort statt Schritte später sichtbar               | ~20 Min |
| 4   | `claude mcp add context7`                                                     | Verlässliche Doku für Tailwind v4 / React 19 / Electron 39 | ~2 Min  |

### Welle 2 — kurzfristig, größter struktureller Gewinn

| #   | Maßnahme                                     | Nutzen                                                             | Aufwand |
| --- | -------------------------------------------- | ------------------------------------------------------------------ | ------- |
| 5   | Skills `schritt-start` + `schritt-abschluss` | Der am häufigsten wiederholte Ablauf wird zu zwei Slash-Befehlen   | ~45 Min |
| 6   | Subagent `ipc-pruefer`                       | Sichert die Architekturregel ab, die kein automatisches Signal hat | ~20 Min |
| 7   | CI-Workflow `.github/workflows/ci.yml`       | Prüfsignal, das unabhängig von Disziplin läuft                     | ~20 Min |
| 8   | ~~Skill `app-screenshot`~~                   | **Entfallen** — durch die neue E2E-Ebene abgelöst                  | —       |

### Welle 3 — optional, wenn das Projekt weiter wächst

| #   | Maßnahme                                      | Nutzen                                                    |
| --- | --------------------------------------------- | --------------------------------------------------------- |
| 9   | Subagent `design-system-pruefer`              | Hält das konsolidierte Design-System langfristig stabil   |
| 10  | Skills `neuer-ablaufplan`, `neues-repository` | Beschleunigt wiederkehrende Dateimuster                   |
| 11  | Hook: betroffene Tests nach Modul-Änderung    | Feineres, schnelleres Testsignal                          |
| 12  | `anthropic-agent-skills` für die Abgabe       | `docs/`-Markdown → Word/PDF für die Studienprojekt-Abgabe |

---

## 7. Was bewusst _nicht_ empfohlen wird

| Nicht empfohlen                    | Begründung                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Playwright-/Browser-MCP            | Desktop-Client bringt Browser-Werkzeuge mit; für Electron mit `file://`-Renderer ohnehin der falsche Weg      |
| Datenbank-MCP (SQLite)             | DB liegt in `userData`, Zugriff ist bewusst auf den Main-Prozess beschränkt, Tests decken die Repositories ab |
| Weitere Einträge in `CLAUDE.md`    | Die Datei ist auf Verweise ausgelegt; zusätzliche Regeln gehören in `docs/` oder in eine Skill                |
| Linear-/Slack-/Jira-MCP            | Einzelentwickler-Studienprojekt, keine Teamwerkzeuge im Einsatz                                               |
| `disable-model-invocation` überall | Nur für Skills mit Nebenwirkungen (Commit, Schreiben) sinnvoll; sonst schränkt es unnötig ein                 |
