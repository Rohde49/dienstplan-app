# Team-Verwaltung

Rein fachlicher Kontext zu diesem Funktionsbereich, losgelöst von der konkreten Umsetzung in diesem Projekt (Electron/React/SQLite) — als Grundlage für ein neues Projekt. Die technische Umsetzung hier im Repo steht in [`../architektur/datenmodell.md`](../architektur/datenmodell.md) und [`../erledigt.md`](../erledigt.md).

## Zweck

Stammdatenpflege der Mitarbeiter einer einzelnen Wohngruppe/eines einzelnen Teams: anlegen, anzeigen, bearbeiten, löschen. Bildet die Grundlage, auf der alle anderen Funktionsbereiche aufbauen (Zuordnung von Diensten, Rufbereitschaft und Auswertung beziehen sich immer auf einen Mitarbeiter).

Es gibt bewusst keine eigene Team-/Gruppen-Entität — die Anwendung bildet nur ein einzelnes Team ab.

## Datenfelder/Entitäten

Ein Mitarbeiter besteht aus:

- **Vorname, Name**
- **Rolle**: fester, kleiner Wertebereich (in diesem Projekt: Erzieher, Praktikant, Wirtschaftskraft). Bewusst als geschlossene Liste, keine frei verwaltbare Rollentabelle — passend zu einer kleinen, im Voraus bekannten Rollenmenge.
- **Wochenarbeitszeit**: eine Zeitdauer (z. B. 39-Stunden-Woche), Anzeige/Eingabe als Stunden:Minuten, fachlich aber eine reine Dauer, keine Uhrzeit.
- **Farbe**: zur Unterscheidbarkeit im Dienstplan-Raster. Auswahl aus einer festen, vordefinierten Palette statt freier Farbwahl, damit Lesbarkeit und Unterscheidbarkeit aller Mitarbeiter garantiert sind. Jede Farbe braucht zusätzlich einen sprechenden Namen (nicht nur den Farbwert), sonst ist die Auswahl für Screenreader-Nutzer nicht nachvollziehbar.

## Geschäftsregeln

- **Eingaben werden validiert**, bevor sie dauerhaft gespeichert werden.
- **Löschregel**: Ein Mitarbeiter, der bereits irgendwo eingeteilt wurde (regulärer Diensteintrag oder Rufbereitschaft), darf nicht gelöscht werden — nur wer nie eingeteilt war, lässt sich entfernen. Das ist eine bewusste Entscheidung zum Schutz der Planungshistorie, hat aber die Nebenwirkung, dass sich aktive, bereits verplante Mitarbeiter praktisch nicht mehr löschen lassen.
- **Speicherung**: Daten müssen lokal und dauerhaft gespeichert werden (kein Datenverlust beim Beenden/Neustart der Anwendung).
- Nur die Rolle **Erzieher** ist später für Rufbereitschaft und für die Auswertungstabelle relevant (siehe [`eintraege-setzen.md`](./eintraege-setzen.md) und [`auswertungstabelle.md`](./auswertungstabelle.md)) — Praktikanten und Wirtschaftskräfte werden dort nicht berücksichtigt.

## Offene Punkte / bewusst zurückgestellt

- **„Inaktiv setzen" statt Löschen**: Für ausgeschiedene Mitarbeiter mit bestehender Planungshistorie wäre ein Status „inaktiv" das fachlich passendere Werkzeug als die harte Löschregel oben — bewusst nicht umgesetzt, blieb eine unpriorisierte Idee.

## Quelle

`docs/erledigt.md` (Schritt 4), `docs/tagebuch/2026-kw33.md`, `docs/architektur/datenmodell.md` (Abschnitt „TeamMember"), `docs/TODO.md` (Abschnitt „Ideen und Später").
