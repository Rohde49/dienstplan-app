# Ablaufplan Schritt 7: Dienstplan/Dienstplantag – Anlegen & Speichern

> **Abgeschlossen am 13.08.2026** (Commit `435ecc2`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`../../TODO.md`](../../TODO.md) und [`../../erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Dieser Schritt behandelt ausschließlich das Anlegen, Laden und Speichern von `Dienstplan` und den dazugehörigen `Dienstplantag`-Zeilen (siehe [`architektur/datenmodell.md`](../architektur/datenmodell.md)). Das Setzen von `Planeintrag`/`Rufbereitschaft`, die Bemerkung-Spalte und alle berechneten Kennzahlen (Soll-/Ist-Arbeitszeit, Δ Soll/Ist, Dienste-Zähler) sind ausdrücklich nicht Teil dieses Schritts, siehe [`temp/temp-PlanungPage.md`](../temp/temp-PlanungPage.md) für die zurückgestellten Fragen dazu. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Zustandsmodell der `PlanungsPage` (Referenz für alle Punkte unten)

**Zustand „kein Dienstplan aktiv"** (Startzustand, auch nach „Neu anlegen"): Monat/Jahr-Select frei wählbar, Titel als einfaches, leeres Eingabefeld (kein Vorschlagswert, darf leer bleiben), Button „Erstellen" aktiv, Button „Speichern" deaktiviert, Button „Laden" aktiv. Das Grid zeigt die reinen Kalendertage aus `getKalendertageFuerMonat()` (wie bisher seit Schritt 6, keine Datenbank beteiligt).

**Klick auf „Erstellen"**: Legt in einer Transaktion einen neuen `Dienstplan` (aktuelles Monat/Jahr/Titel) sowie für jeden Kalendertag des Monats eine `Dienstplantag`-Zeile an. Wechselt in den Zustand „Dienstplan aktiv".

**Zustand „Dienstplan aktiv"** (nach „Erstellen" oder nach „Laden"): Monat/Jahr-Select gesperrt (nicht mehr änderbar). Titel wird als Label mit einem Bearbeiten-Button angezeigt (Klick macht das Label zu einem Eingabefeld). Der „Erstellen"-Button wandelt sich in einen „Neu anlegen"-Button (führt zurück in den Startzustand). „Speichern" ist aktiv und aktualisiert den Titel sowie `geaendertAm` des aktiven `Dienstplan`. „Laden" bleibt weiterhin erreichbar.

**„Laden"**: In jedem Zustand erreichbar, öffnet einen Dialog (`@radix-ui/react-dialog`) mit einer Liste aller vorhandenen Dienstpläne (Spalten: ID, Titel, Monat, Jahr, erstellt am, geändert am, sortiert nach `geaendertAm` absteigend). Auswahl eines Eintrags lädt dessen `Dienstplan` plus alle zugehörigen `Dienstplantag`-Zeilen und wechselt in „Dienstplan aktiv". Schließen ohne Auswahl ändert nichts am aktuellen Zustand.

**Ungespeicherte Änderungen**: Wird im Zustand „Dienstplan aktiv" der Titel geändert, ohne dass seitdem „Speichern" ausgelöst wurde, zeigen sowohl „Laden" als auch „Neu anlegen" vor dem eigentlichen Wechsel einen Warnhinweis (`@radix-ui/react-alert-dialog`), der Nutzer entscheidet zwischen Fortfahren (Änderung geht verloren) und Abbrechen.

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. `Dienstplan`/`Dienstplantag`-Typen in `shared/types.ts`

Ergänze beide Interfaces exakt wie in `datenmodell.md` festgelegt. Noch keine Repository- oder UI-Logik. Prüfe mit `npm run typecheck`.

## 2. Repository-Funktionssignaturen mit Testdaten

Lege `src/main/db/dienstplanRepository.ts` an mit:

- `getDienstplaene(): Dienstplan[]` — für die Laden-Liste, ohne die zugehörigen Tage.
- `getDienstplanMitTagen(id: number): { dienstplan: Dienstplan; tage: Dienstplantag[] } | null` — für den Ladevorgang.
- `createDienstplan(data: { monat: number; jahr: number; titel: string }): { dienstplan: Dienstplan; tage: Dienstplantag[] }` — legt den `Dienstplan` sowie eine `Dienstplantag`-Zeile je Kalendertag des Monats an (nutze `getKalendertageFuerMonat()` aus `src/renderer/src/lib/kalendertage.ts` für die Tagesliste, ggf. an einen für Main-Prozess und Renderer gemeinsam nutzbaren Ort verschieben, falls der direkte Import aus `renderer/` nicht sauber möglich ist — prüfen und Entscheidung dokumentieren). `erstelltAm`/`geaendertAm` auf den aktuellen Zeitpunkt (ISO-Zeichenkette).
- `updateDienstplanTitel(id: number, titel: string): Dienstplan` — aktualisiert `titel` und setzt `geaendertAm` neu.

Fülle alle vier Funktionen zunächst mit fest codierten Testdaten im Speicher, noch kein SQL. Achte darauf, dass `createDienstplan` mehrere Dienstpläne mit demselben Monat/Jahr zulässt (keine Unique-Prüfung darauf, nur `id` ist eindeutig, siehe `datenmodell.md`-Diskussion).

## 3. IPC-Handler und Preload-API

Lege `src/main/ipc/dienstplanHandlers.ts` an mit `dienstplan:list`, `dienstplan:get`, `dienstplan:create`, `dienstplan:updateTitel`. Erweitere Preload-API (`src/preload/index.ts` + `index.d.ts`) um `api.dienstplan.list()`, `.get(id)`, `.create(data)`, `.updateTitel(id, titel)`, nach demselben Muster wie `api.team`/`api.eintragsdefinition`.

## 4. Kopfbereich: Zustandslogik, Erstellen/Speichern/Neu-anlegen, Titel

Baue das oben beschriebene Zustandsmodell in `PlanPage.tsx`: lokaler State für den aktiven `Dienstplan` (`null` im Startzustand), Titel-Eingabe/-Anzeige je nach Zustand, Monat/Jahr-Select-Sperre sobald ein Dienstplan aktiv ist, Buttons „Erstellen"/„Neu anlegen" (gleicher Button, wechselnde Beschriftung und Aktion je Zustand), „Speichern" (aktiv nur mit aktivem Dienstplan, ruft `dienstplan.updateTitel()`). Lokalen Flag für „ungespeicherte Titeländerung seit letztem Speichern" mitführen (einfacher Vergleich mit dem zuletzt gespeicherten Titel reicht, kein generisches Dirty-Tracking nötig, da in diesem Schritt nur der Titel editierbar ist). „Laden"-Button vorerst ohne Funktion (kommt in Punkt 5). Screenshot-Bestätigung: alle Button-/Feld-Zustände in beiden Zuständen, „Erstellen" legt sichtbar einen Dienstplan an (Zustand wechselt), „Speichern" aktualisiert den Titel.

## 5. Laden-Dialog

Ergänze die shadcn-artige `Dialog`-Primitive (`components/ui/dialog.tsx`, `@radix-ui/react-dialog`, Hintergrund gedimmt/unscharf wie im übrigen Projekt für Overlays vorgesehen), analog zum bisherigen Vorgehen bei neuen UI-Primitives (z. B. `Collapsible` in Schritt 5: von Hand nachgebaut, keine Codeübernahme). Der „Laden"-Button öffnet den Dialog mit der Liste aus `dienstplan.list()` (ID, Titel, Monat, Jahr, erstellt am, geändert am, sortiert nach `geaendertAm` absteigend, sinnvoll formatiert). Auswahl eines Eintrags ruft `dienstplan.get(id)`, übernimmt `dienstplan` und `tage` in den PlanPage-State, schließt den Dialog. Schließen ohne Auswahl ändert nichts. Screenshot-Bestätigung: Dialog öffnet sich mit Liste aus zuvor angelegten Testdienstplänen, Laden wechselt sichtbar Monat/Jahr/Titel/Zustand.

## 6. Warnhinweis bei ungespeicherten Änderungen

Ergänze die `AlertDialog`-Primitive (`components/ui/alert-dialog.tsx`, `@radix-ui/react-alert-dialog`). Bevor „Laden" den Dialog aus Punkt 5 öffnet bzw. bevor „Neu anlegen" in den Startzustand wechselt: wenn der Flag aus Punkt 4 gesetzt ist, zuerst den Warnhinweis zeigen („Änderungen gehen verloren, fortfahren?"), erst nach Bestätigung fortfahren, bei Abbruch bleibt alles unverändert. Screenshot-Bestätigung: Titel ändern ohne zu speichern, dann „Laden" bzw. „Neu anlegen" auslösen, Warnhinweis erscheint, beide Wege (Fortfahren/Abbrechen) prüfen.

## 7. PlanungsGrid mit Dienstplantag-Zeilen verknüpfen

Erweitere `PlanungsGrid`, sodass sie zusätzlich zu den reinen `Kalendertag`-Daten weiß, ob und mit welcher `Dienstplantag.id` ein Tag verknüpft ist, sobald ein Dienstplan aktiv ist (Zuordnung über `datum`). Reine Anzeige-Vorbereitung für spätere Schritte (Planeintrag/Bemerkung brauchen die `dienstplantagId`), in diesem Schritt selbst noch keine sichtbare Änderung am Grid außer ggf. einem dezenten Hinweis, ob gerade ein gespeicherter oder ein unverbindlicher Vorschau-Zustand angezeigt wird (dein Ermessen, kein Pflichtbestandteil — bei Unsicherheit im Plan Mode nachfragen). Typecheck/Screenshot-Bestätigung.

## 8. Echte SQLite-Anbindung

Stelle `dienstplanRepository.ts` auf echte SQLite-Tabellen um: `dienstplaene` (id, monat, jahr, titel, erstelltAm, geaendertAm) und `dienstplantage` (id, dienstplanId als Fremdschlüssel, datum, bemerkung nullable). `createDienstplan` muss Dienstplan- und alle Dienstplantag-Inserts in einer `better-sqlite3`-Transaktion (`db.transaction(fn)`) ausführen, damit nie ein Dienstplan ohne seine Tage entsteht. DB-Verbindung wie bei den bestehenden Repositories als Parameter entgegennehmen, nicht global importieren. Testdaten entfernen.

## 9. Repository-Tests gegen In-Memory-SQLite

Vitest-Tests für alle vier Funktionen gegen `new Database(':memory:')`, analog zu `teamRepository.test.ts`/`eintragsdefinitionRepository.test.ts`. Besonderes Augenmerk: `createDienstplan` legt tatsächlich genau so viele `Dienstplantag`-Zeilen an wie der Monat Tage hat (28–31, je nach Monat/Schaltjahr), zwei Dienstpläne mit identischem Monat/Jahr lassen sich unabhängig anlegen.

## 10. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan erstellen, Titel ändern und speichern, App neu starten, per „Laden" den Dienstplan wiederfinden und öffnen, Persistenz von Titel/`geaendertAm` bestätigen (Screenshot vorher/nachher). Zusätzlich den Warnhinweis-Flow einmal im laufenden Fenster durchspielen. Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren, Nummerierung an den tatsächlichen Stand anpassen) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen (wichtigste Entscheidungen, Abweichungen vom Plan).
