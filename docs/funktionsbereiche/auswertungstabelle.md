# Auswertungstabelle für die Mitarbeiter

Rein fachlicher Kontext zu diesem Funktionsbereich, losgelöst von der konkreten Umsetzung in diesem Projekt (Electron/React/SQLite) — als Grundlage für ein neues Projekt. Die technische Umsetzung hier im Repo steht in [`../architektur/auswertung.md`](../architektur/auswertung.md) und [`../erledigt.md`](../erledigt.md).

## Zweck

Kennzahlen je Mitarbeiter berechnen und tabellarisch gegenüberstellen: eine Zeile pro Kennzahl, eine Spalte pro Mitarbeiter. Führt keine eigene, dauerhaft gespeicherte Entität ein — alle Werte werden aus den bereits vorhandenen Stammdaten und gesetzten Einträgen abgeleitet (siehe [`team-verwaltung.md`](./team-verwaltung.md), [`eintraege-setzen.md`](./eintraege-setzen.md)).

**Wichtige Anforderung an die Datenquelle**: Die Auswertung muss live aus dem **aktuellen, noch ungespeicherten Bearbeitungsstand** rechnen, nicht nur aus bereits gespeicherten Daten — sie soll sich sichtbar mitändern, während der Dienstplan gerade bearbeitet wird, nicht erst nach dem Speichern.

## Wer ausgewertet wird

Nur Mitarbeiter mit der Rolle, die auch für Rufbereitschaft infrage kommt (in diesem Projekt: Erzieher). Andere Rollen (in diesem Projekt: Praktikant, Wirtschaftskraft) werden in der eigentlichen Auswertungstabelle nicht mit eigenen Werten geführt.

## Die Kennzahlen

Fünfzehn Kennzahlen-Zeilen je Mitarbeiter für den betrachteten Monat:

1. Anzahl bestimmter, über Mitternacht laufender Dienste (in diesem Projekt: „SN/F"-Dienste), unabhängig von der konkreten Zeit-Variante der zugrunde liegenden Eintragsart.
2. Anzahl freier Samstage (Tage mit einem als „frei" gekennzeichneten Eintrag).
3. Anzahl freier Sonntage und Feiertage (ein Tag, der beides ist, zählt einmal; leere Zellen und andere Abwesenheiten zählen nicht mit).
4. Gearbeitete Stunden an Sonntagen und Feiertagen (Summe der Arbeitszeit aller Einträge an solchen Tagen).
5. Arbeitszeit gesamt im Monat.
6. Nachtbereitschaft gesamt im Monat.
7. Arbeitszeit ohne Nachtbereitschaft gesamt im Monat.
8. Nachtarbeit gesamt im Monat.
9. Nachtzuschlag (in diesem Projekt: 20 % der Nachtarbeit gesamt).
10. Nachtbereitschaftszuschlag (in diesem Projekt: 25 % der Nachtbereitschaft gesamt).
11. Anzahl Rufbereitschaften im Monat.
12. Anzahl Arbeitstage im Monat (Werktage abzüglich gesetzlicher Feiertage — für alle Mitarbeiter desselben Monats identisch, unabhängig von deren individuellen Einträgen).
13. Ist-Arbeitszeit (identisch mit Zeile 5, als Vergleichsgröße zur Soll-Arbeitszeit).
14. Soll-Arbeitszeit (Anzahl Arbeitstage × individuelle Wochenarbeitszeit ÷ 5, gerundet).
15. Differenz Soll/Ist (Ist minus Soll, mit Vorzeichen: positiv bei Überschreitung, negativ wenn das Soll noch nicht erreicht ist).

Zusätzlich, aber bewusst **nicht** Teil dieser 15 Zeilen: eine einfachere Kennzahl „Freie Tage" — Anzahl aller als „frei" markierten Einträge unabhängig vom Wochentag. Sie ist keine Summe aus den Zeilen 2 und 3 und wird separat geführt.

## Geschäftsregeln

- **Zuschläge (Zeilen 9–10) werden aus der vollständigen, ungerundeten Monatssumme berechnet**, nicht aus bereits gerundeten Einzelwerten — erst das Endergebnis wird gerundet. Sie fließen nicht in die Ist-Arbeitszeit ein, sondern werden separat ausgewiesen.
- **Soll-Arbeitszeit** nutzt für alle Mitarbeiter dieselbe Anzahl Arbeitstage, aber jeweils die individuelle Wochenarbeitszeit.
- **Rundung**: Berechnete Zeitdauern werden auf die nächstgelegene volle Minute gerundet, eine exakte halbe Minute wird aufgerundet — einheitlich für Soll-Arbeitszeit und beide Zuschläge.
- **Nicht jede Ansicht der Anwendung muss alle 15 Zeilen zeigen.** In diesem Projekt greifen unterschiedliche Ansichten (voller Auswertungsdialog, Planungsraster, Kompakt-/Druckansicht) nur unterschiedlich viele der 15 Zeilen ab, berechnet aber immer mit derselben zugrunde liegenden Logik — es gibt keine zweite, abweichende Berechnung für eine schlankere Ansicht.
- **Farbliche Hervorhebung der Differenz Soll/Ist**: neutral bei exaktem Ausgleich, auffällig bei Abweichung — dieselbe Regel überall dort, wo die Differenz angezeigt wird.

## Offen Punkte / bewusst zurückgestellt

- ⚠️ Benennung und Abgrenzung der „Kompakt-/Druckansicht" waren in diesem Projekt im Fluss (Umbenennung angekündigt) — fachlich unverändert bleibt, dass eine schlankere Ansicht nur eine Teilmenge der 15 Zeilen zeigt, siehe oben.

## Quelle

`docs/architektur/auswertung.md` (vollständige Berechnungsvorschriften und Zeilen-Zuordnung je Ansicht), `docs/erledigt.md` (Schritte 11, 15).
