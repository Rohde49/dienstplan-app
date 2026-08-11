# Projektstruktur

Grundprinzip: Die Trennung zwischen Main-Prozess (Node.js, Zugriff auf Dateisystem/SQLite) und Renderer (React, reine UI) gibt Electron bereits architektonisch vor. Die Frage ist nur, wie der Main-Prozess intern gegliedert wird.

## Geplante Ordnerstruktur

```
src/
  main/
    db/
      index.ts           # Connection, Schema/Migrationen (bereits vorhanden als db.ts)
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

## Wo was hingehört

**Fachlogik** (Validierung, Berechnung, Regeln wie "keine Nachtschicht nach Spätschicht") gehört in den Main-Prozess, dicht bei den Repositories, nicht in die React-Komponenten.

**Darstellungslogik** (Renderer) sollte möglichst "dumm" bleiben: Daten über die Preload-API abrufen, anzeigen, Formulareingaben zurückschicken. Wenn eine React-Komponente anfängt, fachliche Regeln selbst zu prüfen statt nur Anzeigezustand zu verwalten, ist das ein Signal, die Logik zurück in den Main-Prozess bzw. eine gemeinsame Funktion zu ziehen.

**Entitäten** gehören in `shared/types.ts`: zentrale Interfaces (`TeamMember`, `ShiftType`, `PlanEntry` etc.), die sowohl Main als auch Renderer importieren. Das ist der einzige "Wahrheitsort" für die Datenstruktur, verhindert, dass Main und Renderer mit leicht unterschiedlichen Annahmen über dieselbe Sache arbeiten.

## Inkrementelles Vorgehen ohne SQLite zu verwerfen

Die SQLite-Anbindung ist bereits fertig, getestet und funktioniert (siehe TODO.md, Schritt 1). Sie gegen eine JSON-/Property-Datei auszutauschen, um sie später zurückzubauen, wäre doppelte Arbeit ohne echten Gewinn.

Stattdessen: Repository-Funktionen als schmale Schnittstelle definieren (z. B. `getTeamMembers(): TeamMember[]`, `addTeamMember(data): void`) und diese Funktionen anfangs mit fest codierten Testdaten im Speicher zurückgeben lassen, bevor die echte SQL-Abfrage dahintersteht. Die UI wird gegen diese Funktionssignatur gebaut, nicht gegen die Datenbank direkt. Wenn die Repository-Funktion später auf echtes SQL umgestellt wird, ändert sich für den Renderer nichts.

Damit ergibt sich folgende Reihenfolge für neue Fachbereiche:

1. Entität(en) in `shared/types.ts` entwerfen
2. Repository-Funktionssignaturen festlegen, zunächst mit Testdaten gefüllt
3. UI gegen die Repository-Funktionen bauen
4. Repository-Funktionen an die echte SQLite-Anbindung anschließen
