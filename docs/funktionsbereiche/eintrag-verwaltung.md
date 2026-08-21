# Eintrag-Verwaltung (Planungseintragsarten verwalten)

Rein fachlicher Kontext zu diesem Funktionsbereich, losgelöst von der konkreten Umsetzung in diesem Projekt (Electron/React/SQLite) — als Grundlage für ein neues Projekt. Die technische Umsetzung hier im Repo steht in [`../architektur/datenmodell.md`](../architektur/datenmodell.md) und [`../erledigt.md`](../erledigt.md).

## Zweck

Stammdatenpflege der Eintragsarten, die einem Mitarbeiter an einem Tag zugewiesen werden können — z. B. Dienste mit fester Zeit (Frühdienst, Spätdienst) oder Abwesenheiten mit variabler, vom Mitarbeiter abhängiger Zeit (Urlaub, Krankheit). Diese Stammdaten sind die Auswahlliste, aus der beim Setzen eines Eintrags im Dienstplan gewählt wird (siehe [`eintraege-setzen.md`](./eintraege-setzen.md)).

## Datenfelder/Entitäten

Eine Eintragsart besteht aus:

- **Kürzel** und **Name** (Klartextbezeichnung).
- **Berechnungsart**: entweder „fest" (Zeiten sind mitarbeiterunabhängig fest vorgegeben, z. B. Frühdienst) oder „mitarbeiterabhängig" (die Zeit leitet sich erst beim Setzen aus der Wochenarbeitszeit des jeweiligen Mitarbeiters ab, z. B. Urlaub, Krankheit).
- **Beginn/Ende**: Uhrzeiten, optional — auch ein fester Dienst kann ohne konkrete Uhrzeit sein (z. B. eine ganztägige Fortbildung mit fester Dauer, aber ohne festen Beginn).
- Fünf getrennte **Zeitanteile** derselben geleisteten Zeit, die die Teamleitung unabhängig voneinander einträgt:
  - Anwesenheitszeit (Arbeitszeit + Pausen)
  - Arbeitszeit gesamt (Arbeitszeit ohne Nachtbereitschaft + Nachtbereitschaft)
  - Arbeitszeit ohne Nachtbereitschaft (reine Arbeitszeit inklusive Nachtarbeit)
  - Nachtbereitschaft (Anteil der Arbeitszeit gesamt)
  - Nachtarbeit (Anteil der Arbeitszeit ohne Nachtbereitschaft)

  Es gibt bewusst kein eigenes Feld für „reine" Arbeitszeit ohne jeden Nachtanteil — dieser Wert wird fachlich nirgends eigenständig gebraucht.

## Geschäftsregeln

- Bei **„mitarbeiterabhängig"** haben alle fünf Zeitanteile sowie Beginn/Ende keine Bedeutung auf Stammdatenebene: Die Teamleitung legt nur Kürzel, Name und Berechnungsart fest, alle Zeitwerte bleiben leer/null und werden erst beim tatsächlichen Setzen im Dienstplan aus der Wochenarbeitszeit des Mitarbeiters berechnet.
- Die Anwendung prüft nur das **Eingabeformat** der Zeitwerte, nicht deren rechnerische Konsistenz untereinander (z. B. ob „Arbeitszeit gesamt" wirklich der Summe ihrer Teile entspricht) — die fachliche Verantwortung dafür liegt bei der Teamleitung.
- **Kürzel ist nicht eindeutig**: Mehrere Eintragsarten dürfen dasselbe Kürzel tragen, wenn sie unterschiedliche Zeit-Varianten desselben fachlichen Eintrags abbilden. Beispiel: Ein über Mitternacht laufender Dienst wird als zwei Eintragsarten mit demselben Kürzel, aber unterschiedlichen Beginn-/Ende-Zeiten geführt (siehe [`eintraege-setzen.md`](./eintraege-setzen.md)). Auswertungen, die nach Kürzel filtern, dürfen sich deshalb nicht auf dessen Eindeutigkeit verlassen.

## Offene Punkte / bewusst zurückgestellt

Keine offenen fachlichen Punkte bekannt.

## Quelle

`docs/erledigt.md` (Schritt 5), `docs/tagebuch/2026-kw33.md`, `docs/architektur/datenmodell.md` (Abschnitt „Eintragsdefinition").
