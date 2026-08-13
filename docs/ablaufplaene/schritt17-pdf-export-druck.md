# Ablaufplan Schritt 17: PDF-Export/Druck-Funktion

Annahme zum Umfang: Aktiviert den bestehenden, bisher deaktivierten „Drucken"-Button aus Schritt 16 (`PlanPage.tsx`, neben dem Planform-Umschalter) über den nativen Windows-Druckdialog (`window.print()`), der „Microsoft Print to PDF" ohnehin als Druckerziel anbietet — kein zweiter „Als PDF exportieren"-Button, keine eigene PDF-Erzeugung im Code. Grundlage ist die in Schritt 16 gebaute `VerkuerzteAnsicht`, die dafür um einen dauerhaft sichtbaren Papier-Rahmen, den Dienstplan-Titel und einen Signaturblock „Freigabe und Unterschrift" ergänzt wird. Für den eigentlichen Druck/PDF-Export soll der komplette Dienstplan unabhängig von Mitarbeiter- und Tagesanzahl auf eine A4-Seite im Hochformat passen, die Bildschirmansicht selbst bleibt dabei wie bisher scrollbar. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Kein neuer IPC-Kanal, kein main-process-seitiger Druckaufruf**: `window.print()` im Renderer löst in Electron direkt den nativen Windows-Druckdialog aus, Chromium respektiert dabei die `@page`-CSS-Regeln (Seitenformat/-ausrichtung) der gedruckten Seite. Reine Browser-Standard-API, keine Electron-spezifische `webContents.print()`-Verdrahtung nötig.

**„Drucken"-Button nur aktiv bei `ansicht === 'druckvorschau'` und geöffnetem Dienstplan** (`aktiverDienstplan !== null`), analog zu „Speichern"/„Auswertung".

**Bildschirmansicht bleibt scrollbar, bekommt aber einen dauerhaften Papier-Rahmen**: `VerkuerzteAnsicht` wird optisch als Blatt gerahmt (deutlicherer Rand/Schatten als der bisherige `border`, eigener Hintergrund gegen die App-Fläche abgesetzt) — reine Anlehnung ans Papier, keine exakte A4-Pixel-Proportion auf dem Bildschirm. Innerhalb des Rahmens bleibt die Tabelle wie bisher scroll- und sticky-fähig, das Layout der übrigen App ändert sich nicht.

**Neue, dauerhaft sichtbare Bestandteile im Rahmen**: oben der Dienstplan-Titel (`titelEntwurf` aus `PlanPage`, live wie der Rest der Ansicht, Fallback „Ohne Titel"), unterhalb der Tabelle ein Signaturblock „Freigabe und Unterschrift" mit zwei beschrifteten Linien („Datum", „Unterschrift / Freigabe") ohne Funktion — beides nicht nur beim Drucken sichtbar, sondern immer, wenn `ansicht === 'druckvorschau'`.

**Skalierung auf eine A4-Seite per DOM-Messung statt fester Formel**: Unmittelbar vor dem Druck (`beforeprint`-Event) wird die tatsächliche, ungestauchte Breite/Höhe des Druckbereichs per `getBoundingClientRect()` gemessen, der verfügbaren A4-Druckfläche (Seitenmaß abzüglich Rand, angenähert über 96 CSS-Pixel pro Zoll) gegenübergestellt und daraus ein einzelner Skalierungsfaktor (`Math.min(Breitenverhältnis, Höhenverhältnis)`) berechnet, per `transform: scale(...)` auf den gesamten Druckbereich angewendet. Verhält sich wie „Auf eine Seite skalieren" in Excel/Word: weniger Mitarbeiter/Tage vergrößern die Darstellung, mehr verkleinern sie, ohne feste Unter- oder Obergrenze — funktioniert automatisch für beliebige Team- und Monatsgrößen, nicht nur für die als Referenz genannten 8 Mitarbeiter/31 Tage. `afterprint` setzt den Faktor wieder zurück, damit er nicht in die normale Bildschirmansicht durchschlägt.

**Verhältnisrechnung als eigene, unit-getestete Funktion ausgelagert**, die eigentliche DOM-Messung bleibt Komponentencode (nicht sinnvoll unit-testbar ohne echtes Rendering).

**Wichtiger Hinweis zur Prüfbarkeit**: Der native Windows-Druckdialog und das Ergebnis eines PDF-Exports lassen sich nicht per CDP-Skript automatisiert screenshotten wie die bisherigen In-App-Prüfungen. Ab Punkt 3 ist deshalb ein manueller Test nötig (Dienstplan wirklich drucken/als PDF exportieren, erzeugte Datei öffnen und ansehen).

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung.

## 1. Papier-Rahmen, Titel und Signaturblock in `VerkuerzteAnsicht`

Ergänze eine neue Pflicht-Prop `dienstplanTitel: string`, in `PlanPage.tsx` mit `titelEntwurf` befüllt. Baue den bisherigen äußeren Container (`bg-card relative min-h-0 w-full flex-1 overflow-hidden rounded-lg border`) zu einem deutlich als Papier erkennbaren Rahmen um (stärkerer Schatten/Rand, Innenabstand, gegen die App-Fläche abgesetzter Hintergrund), darin oben eine Titelzeile mit `dienstplanTitel || 'Ohne Titel'`, darunter unverändert die bestehende scroll- und sticky-fähige Tabelle, darunter ein neuer Signaturblock mit zwei Spalten „Datum" und „Unterschrift / Freigabe", jeweils eine kurze horizontale Linie mit Beschriftung darunter, kein Input, kein State. Screenshot-Bestätigung: Druckvorschau zeigt Rahmen, Titel und Signaturzeile dauerhaft (unabhängig vom Druckvorgang selbst), Tabelle bleibt bei vielen Mitarbeitern weiterhin scrollbar, restliche App unverändert.

## 2. Reine Skalierungsfunktion inkl. Unit-Tests

Lege `shared/druckSkalierung.ts` mit einer reinen Funktion an, die aus benötigter Breite/Höhe des Druckinhalts und verfügbarer Breite/Höhe der Druckfläche einen einzelnen Skalierungsfaktor berechnet (`Math.min` aus beiden Verhältnissen, siehe Design-Entscheidung oben). Unit-Tests: identische Größe ergibt Faktor 1, kleinerer Inhalt als Fläche ergibt einen Faktor größer 1 (vergrößert), größerer Inhalt ergibt einen Faktor kleiner 1 (verkleinert), ein Fall mit ungleichem Breiten-/Höhenverhältnis wählt den kleineren der beiden Werte.

## 3. Print-Stylesheet und dynamische Skalierung verdrahten

Ergänze `@media print`-Regeln (gleiche Datei/Muster wie die bestehende globale CSS), die außerhalb des Papier-Rahmens alles ausblenden (Kopfbereich, Buttons, Navigation) und `@page { size: A4 portrait; margin: ... }` setzen. Registriere in `VerkuerzteAnsicht` (oder `PlanPage`) `beforeprint`/`afterprint`-Listener: bei `beforeprint` den Druckbereich unskaliert vermessen, verfügbare A4-Fläche berechnen, `berechneDruckSkalierungsfaktor(...)` aus Punkt 2 aufrufen, Ergebnis als CSS-Variable auf den Druckbereich setzen (im Print-Stylesheet über `transform: scale(var(...))` konsumiert); bei `afterprint` die Variable zurücksetzen. Prüfung (manuell, siehe Hinweis oben): Testweise über den Druckdialog als PDF exportieren, einmal mit einem Dienstplan mit 8 Mitarbeitern und vollem Monat (passt vollständig auf eine A4-Seite Hochformat), einmal mit deutlich weniger Mitarbeitern (füllt die Seite sichtbar größer aus).

## 4. „Drucken"-Button aktivieren

Entferne `disabled` vom bestehenden Button in `PlanPage.tsx`, setze stattdessen `disabled={ansicht !== 'druckvorschau' || aktiverDienstplan === null}`, `onClick={() => window.print()}`. Screenshot-Bestätigung: Button optisch deaktiviert außerhalb der Druckvorschau oder ohne geöffneten Dienstplan, in der Druckvorschau mit geöffnetem Dienstplan klickbar; Klick öffnet nachweislich den nativen Windows-Druckdialog (manuell bestätigt).

## 5. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan mit acht Mitarbeitern (Referenzfall) und einen zweiten mit deutlich weniger Mitarbeitern aufbauen, jeweils in die Druckvorschau wechseln (Rahmen, Titel, Signaturblock prüfen), über „Drucken" als PDF exportieren, beide erzeugten Dateien öffnen und mit der Bildschirmansicht abgleichen (alle Werte vollständig und lesbar auf einer A4-Seite Hochformat, keine abgeschnittenen Spalten/Zeilen). Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren, aus „Geplante nächste Schritte" entfernen) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen.
