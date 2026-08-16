# Ablaufplan Schritt 6: Planungsansicht – Gerüst

> **Abgeschlossen am 12.08.2026** (Commit `31bae38`). Historisches Dokument: Der Prompt-Verlauf bleibt unverändert, auch wo der Code sich seitdem weiterentwickelt hat. Aktueller Stand siehe [`TODO.md`](../../TODO.md) und [`erledigt.md`](../../erledigt.md).

Annahme zum Umfang: Schritt 6 baut ausschließlich das Grundgerüst der `PlanungsPage` (bestehende Platzhalterdatei `PlanPage.tsx`, Datei- und Routenname bleiben unverändert, nur der Seiteninhalt wird ersetzt). Es werden noch keine `Planeintrag`- oder `Rufbereitschaft`-Datensätze gesetzt, und `Dienstplan`/`Dienstplantag` werden nicht persistiert — die Kalendertage werden für die Anzeige rein berechnet, nicht in der Datenbank angelegt. Berechnete Kennzahlen, die eine Formel statt reiner Anzeige brauchen (allen voran Soll-Arbeitszeit je Mitarbeiter), sind bewusst nicht Teil dieses Schritts, sondern eines eigenen Folgeschritts. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

Grundlage ist das vom Nutzer gelieferte Mockup (schematische Planungstabelle: Kopfbereich mit Monat/Jahr-Auswahl, Umschalter „Vollständige Planform"/„Verkürzte Form" und Button „Auswertung"; darunter eine Tabelle mit Datum-Spalte, je Mitarbeiter einem farbigen Spaltenblock aus Eintrag/Beginn/Ende, einer Rufbereitschafts- und einer Bemerkung-Spalte, Wochenende-/Feiertags-Färbung). Die im Mockup gezeigte Navigationsleiste links gehört nicht zum Projekt (andere Navigationsarchitektur, siehe `architektur/projektstruktur.md`), ebenso wenig die Legende (bewusst weggelassen, siehe Begründung unten) und die Kennzahlen-Boxen/Ist-Arbeitszeit-Zeile (gehören zum Folgeschritt).

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Kalendertage-Funktion (reine Funktion inkl. Feiertagsberechnung)

Schreibe eine reine Funktion `getKalendertageFuerMonat(jahr: number, monat: number)` in `src/renderer/src/lib/kalendertage.ts`, die ein Array von Objekten zurückgibt:

```typescript
interface Kalendertag {
  datum: string // "JJJJ-MM-TT", Konvention aus datenmodell.md
  wochentag: 'Mo' | 'Di' | 'Mi' | 'Do' | 'Fr' | 'Sa' | 'So'
  istWochenende: boolean
  istFeiertag: boolean
  feiertagsname: string | null
}
```

Feiertagsberechnung nach § 2 Absatz 1 des Brandenburgischen Feiertagsgesetzes, wie in `docs/architektur/datenmodell.md` (Abschnitt „Fachliche Regeln") festgelegt: zwölf gesetzliche Feiertage, feste und vom Osterdatum abhängige, Ostersonntag und Pfingstsonntag zählen mit, ein Tag, der zugleich Sonntag und Feiertag ist, wird nur einmal gezählt. Wichtig: Die genaue Liste der zwölf Feiertage vor der Umsetzung gegen den aktuellen Gesetzestext prüfen (z. B. über die offizielle Fassung auf bravors.brandenburg.de), nicht aus Trainingsdaten raten — Feiertagsgesetze ändern sich gelegentlich. Osterdatum über einen etablierten Algorithmus (z. B. Gaußsche Osterformel) berechnen, nicht fest verdrahten.

Ergänze Vitest-Unit-Tests: mindestens ein Monat mit bekanntem Feiertag (z. B. Dezember mit Weihnachtsfeiertagen), ein Monat mit beweglichem Feiertag (z. B. Monat mit Ostern oder Pfingsten in einem bekannten Jahr), korrekte Anzahl Tage in Schaltjahr-Februar, korrekte `wochentag`-Zuordnung. Prüfe mit `npm run test` und `npm run typecheck`.

## 2. PlanungsPage: Kopfbereich

Ersetze den Platzhalter-Inhalt in `src/renderer/src/pages/PlanPage.tsx` durch den Kopfbereich: Überschrift, Monat-Auswahl (`Select`, Monate ausgeschrieben) und Jahr-Auswahl (sinnvoller Wertebereich, z. B. aktuelles Jahr ±2), Umschalter „Vollständige Planform"/„Verkürzte Form" (rein optisch, deaktiviert, „Vollständige Planform" aktiv voreingestellt) und Button „Auswertung" (deaktiviert). Kein Titel-Feld in diesem Schritt (kommt erst mit der Persistenz in einem späteren Schritt). Bestehenden Rückweg-Link beibehalten. Auswahl von Monat/Jahr hält lokalen React-State, noch ohne Wirkung auf eine Tabelle (folgt in Punkt 4/5). Screenshot-Bestätigung: Kopfbereich vorhanden, Umschalter und Auswertung-Button sichtbar aber nicht klickbar.

## 3. Grid-/Scroll-Grundstruktur mit Platzhalterdaten

Lege eine neue, seitenübergreifende Layout-Komponente an (z. B. `components/layout/PlanungsGrid.tsx`, nicht `ManagementLayout`/`StackedManagementLayout` wiederverwenden, da strukturell ein Datengrid statt Liste+Formular). Baue zunächst nur mit fest codierten Platzhalterdaten (z. B. drei erfundene Mitarbeiter, zehn erfundene Tage), um das schwierige CSS-Verhalten isoliert zu prüfen, bevor echte Daten dazukommen:

- Tabellenkörper scrollt vertikal innerhalb eines Containers mit begrenzter Höhe (nicht die ganze Seite), Kopfzeile bleibt beim vertikalen Scrollen sichtbar (`position: sticky`).
- Datum-Spalte bleibt beim horizontalen Scrollen sichtbar (`position: sticky; left: 0`).
- Mitarbeiter-Spaltenblöcke haben feste Breite, bei mehr Mitarbeitenden als in den Container passen horizontaler Scroll (analog zum horizontalen Scroll-Container aus Schritt 5 bei der Eintragsdefinitionen-Tabelle).

Screenshot-Bestätigung mit den Platzhalterdaten: vertikal scrollen (Kopfzeile bleibt oben), horizontal scrollen (Datum-Spalte bleibt links).

## 4. Mitarbeiter-Spaltengruppen mit echten Daten

Ersetze die Platzhalter-Mitarbeiter aus Punkt 3 durch echte `TeamMember`-Daten über die bestehende `team.list()`-API (aus Schritt 4, keine neue IPC-Schnittstelle nötig). Je Mitarbeiter ein farbiger Spaltenblock (`TeamMember.farbe`) mit Name als Blocküberschrift und den drei Unterspalten Eintrag/Beginn/Ende, Zellinhalt vorerst überall „–" (noch kein `Planeintrag`). Screenshot-Bestätigung mit den echten Testdaten aus der Team-Verwaltung.

## 5. Kalendertage-Zeilen mit echten Daten

Ersetze die Platzhalter-Tage aus Punkt 3 durch echte Zeilen aus `getKalendertageFuerMonat()` (Punkt 1), gesteuert über die Monat-/Jahr-Auswahl aus Punkt 2 (Änderung der Auswahl aktualisiert die Zeilen live, ohne Speichern). Datum-Spalte zeigt Tag und Wochentag, Wochenende- und Feiertags-Zeilen farblich abgesetzt (angelehnt an die Mockup-Färbung, auch ohne die Legende selbst zu übernehmen), Feiertags-Zeilen zusätzlich mit Feiertagsname oder -Kennzeichnung. Screenshot-Bestätigung: kompletter Monat wird angezeigt, Monatswechsel aktualisiert die Zeilenzahl korrekt (28–31 Tage), Wochenende/Feiertag optisch erkennbar.

## 6. Platzhalter-Spalten Rufbereitschaft und Bemerkung

Ergänze die beiden Spalten „Rufbereitschaft" und „Bemerkung" rechts der Mitarbeiter-Spaltenblöcke, beide vorerst leer und ohne Funktion (kein Dropdown, kein Eingabefeld) — reine Layout-Reservierung für einen späteren Schritt, in dem `Rufbereitschaft` bzw. `Dienstplantag.bemerkung` tatsächlich angebunden werden. Screenshot-Bestätigung: Spalten sichtbar, Tabellenbreite/Scroll-Verhalten aus Punkt 3 weiterhin korrekt.

## 7. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. Per Screenshot-Serie gegen das Mockup vergleichen (Kopfbereich, Spaltenfarben, Sticky-Verhalten, Wochenende-/Feiertags-Färbung). Anschließend `docs/TODO.md` aktualisieren (Schritt 6 als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen (wichtigste Entscheidungen, insbesondere zur Feiertagsberechnung und zum Sticky-Grid-Aufbau, sowie Abweichungen vom Plan).
