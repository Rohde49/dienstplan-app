# Auswertungsansicht (Berechnete Kennzahlen)

Eine Auswertung über die in [`datenmodell.md`](./datenmodell.md) definierten Entitäten. Sie führt keine eigene, persistierte Entität ein — alle Werte werden aus vorhandenen `TeamMember`-, `Planeintrag`-, `Rufbereitschaft`- und `Dienstplantag`-Datensätzen abgeleitet; daher die Trennung von `datenmodell.md`.

| Aspekt             | Stand                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| Berechnung         | [`src/shared/auswertung.ts`](../../src/shared/auswertung.ts), reine Funktionen, alle 15 Zeilen      |
| Anzeige            | `AuswertungDialog` — Dialog-Overlay in der Planungsansicht, keine eigene Route                      |
| Datenquelle        | der **aktuelle Entwurf**, nicht der gespeicherte Stand — die Werte ändern sich live vor „Speichern" |
| Wiederverwendet in | `PlanungsGrid` (fünf der Zeilen) und `VerkuerzteAnsicht` (Ist/Soll)                                 |

## Darstellung

Tabelle: zeilenweise die 15 Kennzahlen unten, spaltenweise eine Spalte pro `TeamMember` mit `rolle: 'Erzieher'`. Praktikanten und Wirtschaftskräfte werden nicht aufgenommen.

## Die 15 Zeilen

1. Anzahl SN/F-Dienste
2. Anzahl freier Samstage
3. Anzahl freier Sonntage und Feiertage
4. Gearbeitete Stunden an Sonntagen und Feiertagen
5. Arbeitszeit gesamt im Monat
6. Nachtbereitschaft gesamt im Monat
7. Arbeitszeit ohne Nachtbereitschaft gesamt im Monat
8. Nachtarbeit gesamt im Monat
9. Nachtzuschlag von 20 Prozent in Stunden
10. Nachtbereitschaftszuschlag von 25 Prozent in Stunden
11. Anzahl Rufbereitschaften
12. Anzahl Arbeitstage
13. Ist-Arbeitszeit
14. Soll-Arbeitszeit
15. Differenz Soll/Ist

## Berechnungsvorschriften

In derselben Reihenfolge wie oben, mit Bezug auf die Feldnamen aus `datenmodell.md`:

**1. Anzahl SN/F-Dienste** = Anzahl gesetzter `Planeintrag`-Datensätze mit `kuerzel === 'SN/F'`, unabhängig von der konkreten Zeit-Variante der zugrunde liegenden `Eintragsdefinition` (siehe dort, `kuerzel` ist nicht eindeutig).

**2. Freie Samstage** = Anzahl eindeutiger Samstage mit gesetztem `Planeintrag` mit `kuerzel === '/'`. **3. Freie Sonntage und Feiertage** = Anzahl eindeutiger Sonntage oder gesetzlicher Feiertage (siehe `datenmodell.md`, Abschnitt „Fachliche Regeln") mit gesetztem `Planeintrag` mit `kuerzel === '/'` (ein Tag, der beides ist, zählt einmal). Leere Zellen und Abwesenheiten zählen nicht.

**4. Gearbeitete Stunden an Sonntagen und Feiertagen** = Summe von `arbeitszeitMinuten` aller `Planeintrag`-Datensätze einer Person an Tagen, die Sonntag oder gesetzlicher Feiertag sind (ein Tag, der beides ist, zählt einmal). Maßgeblich ist ausschließlich das gespeicherte Feld `arbeitszeitMinuten` des `Planeintrag`, nicht der Wert der `Eintragsdefinition`.

**5.–8. Monatssummen** (`arbeitszeitMinuten`, `arbeitszeitOhneNachtbereitschaftMinuten`, `nachtbereitschaftMinuten`, `nachtarbeitMinuten` gesamt im Monat) sind jeweils die Summe des entsprechenden Felds aller `Planeintrag`-Datensätze der Person im Monat. `anwesenheitszeitMinuten` wird je Eintrag gespeichert, ist aber nicht Teil dieser 15 Zeilen.

**9. Nachtzuschlag 20 %** = Nachtarbeit gesamt im Monat (Zeile 8) × 0,20. **10. Nachtbereitschaftszuschlag 25 %** = Nachtbereitschaft gesamt im Monat (Zeile 6) × 0,25. Beide werden aus der vollständigen Monatssumme berechnet, nicht aus gerundeten Einzelwerten, und erst das Endergebnis wird gerundet (Rundungsregel siehe `datenmodell.md`, Konventionen). Sie werden separat angezeigt und nicht zur Ist-Arbeitszeit addiert.

**11. Anzahl Rufbereitschaften** = Anzahl der einer Person im Monat zugeordneten `Rufbereitschaft`-Datensätze.

**12. Anzahl Arbeitstage** = Anzahl der Tage von Montag bis Freitag im Monat abzüglich der gesetzlichen Feiertage in Brandenburg, die auf Montag bis Freitag fallen. Der Wert ergibt sich ausschließlich aus Monat, Jahr und Feiertagskalender, ist für alle Erzieher desselben Monats identisch und wird von `Planeintrag`/`Rufbereitschaft` nicht verändert.

**13. Ist-Arbeitszeit** = Arbeitszeit gesamt im Monat (Zeile 5). Beide Zeilen zeigen denselben Zahlenwert: „Arbeitszeit" bezeichnet den Wert eines einzelnen `Planeintrag`, „Arbeitszeit gesamt im Monat" die Monatssumme, „Ist-Arbeitszeit" denselben Monatswert als Vergleichsgröße zur Soll-Arbeitszeit.

**14. Soll-Arbeitszeit** = Anzahl Arbeitstage (Zeile 12) × `TeamMember.wochenarbeitszeitMinuten` / 5, gerundet auf die volle Minute (Beispiel: 21 × 39:00 / 5 = 163:48). Für alle Erzieher wird dieselbe Anzahl Arbeitstage verwendet, aber die jeweils eigene Wochenarbeitszeit.

**15. Differenz Soll/Ist** = Ist-Arbeitszeit (Zeile 13) − Soll-Arbeitszeit (Zeile 14). Darstellung mit Vorzeichen: positiv mit `+` (Soll überschritten), `0:00` bei Ausgleich, negativ mit `−` (Soll noch nicht erreicht).

## Welche Zeilen wo erscheinen

Nicht jede Ansicht zeigt alle 15 Zeilen. Dieselbe Funktion `berechneKennzahlenFuerMitarbeiter()` liefert alle Werte, die Ansichten greifen nur unterschiedlich viel davon ab:

| Zeile                            | `AuswertungDialog` | `PlanungsGrid`         | `VerkuerzteAnsicht` |
| -------------------------------- | ------------------ | ---------------------- | ------------------- |
| 1 SN/F-Dienste                   | ja                 | Kopfzeile              | nein                |
| 2–12                             | ja                 | nein                   | nein                |
| 13 Ist-Arbeitszeit               | ja                 | Fußzeile „Ist"         | Fußzeile            |
| 14 Soll-Arbeitszeit              | ja                 | Fußzeile „Soll"        | Fußzeile            |
| 15 Differenz Soll/Ist            | ja                 | Kopfzeile „Δ Soll/Ist" | nein                |
| „Freie Tage" (nicht Teil der 15) | nein               | Kopfzeile              | nein                |

Unterschiedlich ist auch, wer überhaupt eine Spalte bekommt: `AuswertungDialog` zeigt **nur** Erzieher, `PlanungsGrid` zeigt alle Rollen und schreibt „n/A" in die Kennzahlenzellen der Nicht-Erzieher, `VerkuerzteAnsicht` zeigt ebenfalls alle Rollen, lässt deren Fußzeilen aber leer.

> ⚠️ Zu prüfen: Der PDF-Export baut `VerkuerzteAnsicht` zu `DruckAnsicht` um. Diese Spalte danach umbenennen und nachsehen, ob die Fußzeilen unverändert geblieben sind.

- **„Freie Tage" ist ein eigener, einfacherer Wert** und bewusst nicht die Summe aus „Freie Samstage" (Zeile 2) und „Freie Sonntage und Feiertage" (Zeile 3): Anzahl der `Planeintrag`-Datensätze eines `TeamMember` mit `kuerzel === '/'`, unabhängig vom Wochentag. Er gehört deshalb nicht zu den 15 Zeilen, sondern nur ins Raster. Die beiden engeren Zeilen 2 und 3 bleiben davon unberührt.
- **Farbliche Hervorhebung von „Δ Soll/Ist"**: `sollIstFarbe()` in [`src/renderer/src/lib/sollIstFarbe.ts`](../../src/renderer/src/lib/sollIstFarbe.ts) — `text-primary` bei exaktem Ausgleich, sonst eine aus `--destructive` abgeleitete Tönung. Dieselbe Funktion in Dialog und Raster, keine zweite Farblogik.
