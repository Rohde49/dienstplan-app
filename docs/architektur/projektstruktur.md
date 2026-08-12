# Projektstruktur

Grundprinzip: Die Trennung zwischen Main-Prozess (Node.js, Zugriff auf Dateisystem/SQLite) und Renderer (React, reine UI) gibt Electron bereits architektonisch vor. Die Frage ist nur, wie der Main-Prozess intern gegliedert wird.

## Geplante Ordnerstruktur

Ursprüngliche Skizze vor der Umsetzung von Schritt 4, unten unter „Aktueller Stand" mit den tatsächlichen Abweichungen:

```
src/
  main/
    db/
      index.ts           # Connection, Schema/Migrationen
      teamRepository.ts   # Fachlogik + Zugriff für Team-Entitäten
      planRepository.ts   # Fachlogik + Zugriff für Plan-Entitäten
    ipc/
      teamHandlers.ts     # ipcMain.handle(...) registriert Repository-Funktionen
      planHandlers.ts
  preload/
    index.ts              # exponiert typisierte API Richtung Renderer
  renderer/src/
    pages/                # StartPage, TeamPage, PlanPage
    components/           # wiederverwendbare UI-Bausteine
  shared/
    types.ts              # Entitäten: TeamMember, ShiftType, PlanEntry, IPC-Vertrag
```

### Aktueller Stand (nach Schritt 4)

- `src/main/db.ts` blieb als eigenständige Datei bestehen (Connection, Schema-Smoke-Test), wurde nicht nach `db/index.ts` verschoben. `src/main/db/teamRepository.ts` existiert daneben. Kein Umbau vorgesehen, nur zur Klarstellung, dass sich die Skizze und die Umsetzung hier unterscheiden.
- `renderer/src/pages/` enthält zusätzlich `EintraegePage` (Platzhalter) — die ursprüngliche Skizze kannte nur drei Seiten, siehe `entwicklungstagebuch.md`.
- `renderer/src/components/` hat sich in drei Kategorien ausdifferenziert: `components/ui/` für shadcn-Primitives (`Card`, `Button`, `Input`, `Label`, `Select`, `Table`), `components/layout/` für seitenübergreifende, fachlich unwissende Layout-Bausteine (`ManagementLayout`), und fachspezifische Komponenten direkt unter `components/` (`TeamMemberForm.tsx`, `TeamMemberTable.tsx`). Diese Dreiteilung ist noch nicht offiziell festgelegt, hat sich aber in Schritt 4 so ergeben und sollte bei künftigen Fachbereichen (z. B. Eintrag-Verwaltung) fortgesetzt werden, damit `components/` nicht unsortiert wächst.
- `shared/types.ts` enthält aktuell nur `TeamMember` und `TEAM_MEMBER_COLORS` (Code), nicht `ShiftType`/`PlanEntry` — die inzwischen entworfenen Entitäten `Eintragsdefinition`, `Dienstplan`, `Dienstplantag`, `Planeintrag`, `Rufbereitschaft` (siehe [`datenmodell.md`](./datenmodell.md)) sind bisher nur dokumentiert, noch nicht als Code angelegt (folgt bei Umsetzung der Eintrag-Verwaltung, siehe unten „Inkrementelles Vorgehen"). Der „IPC-Vertrag" aus der ursprünglichen Skizze liegt in der Praxis nicht in `shared/types.ts`, sondern in `preload/index.d.ts` (typisierte `window.api`-Deklaration, siehe `api.team` als Beispiel) — `shared/types.ts` enthält nur die reinen Entitäten/Konstanten.

## Wo was hingehört

**Fachlogik** (Validierung, Berechnung, Regeln wie "keine Nachtschicht nach Spätschicht") gehört in den Main-Prozess, dicht bei den Repositories, nicht in die React-Komponenten.

**Darstellungslogik** (Renderer) sollte möglichst "dumm" bleiben: Daten über die Preload-API abrufen, anzeigen, Formulareingaben zurückschicken. Wenn eine React-Komponente anfängt, fachliche Regeln selbst zu prüfen statt nur Anzeigezustand zu verwalten, ist das ein Signal, die Logik zurück in den Main-Prozess bzw. eine gemeinsame Funktion zu ziehen.

**Entitäten** gehören in `shared/types.ts`: zentrale Interfaces (`TeamMember`, `Eintragsdefinition`, `Dienstplan`, `Dienstplantag`, `Planeintrag`, `Rufbereitschaft`, siehe [`datenmodell.md`](./datenmodell.md)), die sowohl Main als auch Renderer importieren. Das ist der einzige "Wahrheitsort" für die Datenstruktur, verhindert, dass Main und Renderer mit leicht unterschiedlichen Annahmen über dieselbe Sache arbeiten.

## Inkrementelles Vorgehen ohne SQLite zu verwerfen

Die SQLite-Anbindung ist bereits fertig, getestet und funktioniert (siehe TODO.md, Schritt 1). Sie gegen eine JSON-/Property-Datei auszutauschen, um sie später zurückzubauen, wäre doppelte Arbeit ohne echten Gewinn.

Stattdessen: Repository-Funktionen als schmale Schnittstelle definieren (z. B. `getTeamMembers(): TeamMember[]`, `addTeamMember(data): void`) und diese Funktionen anfangs mit fest codierten Testdaten im Speicher zurückgeben lassen, bevor die echte SQL-Abfrage dahintersteht. Die UI wird gegen diese Funktionssignatur gebaut, nicht gegen die Datenbank direkt. Wenn die Repository-Funktion später auf echtes SQL umgestellt wird, ändert sich für den Renderer nichts.

Damit ergibt sich folgende Reihenfolge für neue Fachbereiche:

1. Entität(en) in `shared/types.ts` entwerfen
2. Repository-Funktionssignaturen festlegen, zunächst mit Testdaten gefüllt
3. UI gegen die Repository-Funktionen bauen
4. Repository-Funktionen an die echte SQLite-Anbindung anschließen
