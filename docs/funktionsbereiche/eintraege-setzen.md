# Planungseinträge im Dienstplan setzen

Rein fachlicher Kontext zu diesem Funktionsbereich, losgelöst von der konkreten Umsetzung in diesem Projekt (Electron/React/SQLite) — als Grundlage für ein neues Projekt. Die technische Umsetzung hier im Repo steht in [`../architektur/datenmodell.md`](../architektur/datenmodell.md) und [`../erledigt.md`](../erledigt.md).

## Zweck

Innerhalb eines Dienstplan-Gerüsts (siehe [`dienstplan-geruest.md`](./dienstplan-geruest.md)) einem Mitarbeiter an einem Tag eine Eintragsart zuweisen (siehe [`eintrag-verwaltung.md`](./eintrag-verwaltung.md)), zusätzlich Rufbereitschaft eintragen und Tagesbemerkungen erfassen. Das eigentliche „Befüllen" des Dienstplans.

## Datenfelder/Entitäten

**Regulärer Planungseintrag** — Zuordnung einer Eintragsart zu einem Mitarbeiter an einem Tag:

- Verweis auf den Tag, den Mitarbeiter und die gewählte Eintragsart.
- Kürzel, Beginn/Ende sowie alle fünf Zeitanteile werden beim Setzen **als Kopie** aus der gewählten Eintragsart übernommen, nicht bei jeder Anzeige live nachgeschlagen (kontrollierte Redundanz, siehe Geschäftsregeln).

**Rufbereitschaft** — einfachere, tagesbezogene Einteilung einer Person zur Rufbereitschaft, ohne eigene fachliche Attribute außer Tag und Person. Eine leere/keine Zuordnung bedeutet „keine Rufbereitschaft an diesem Tag".

**Tagesbemerkung** — ein kurzer Freitext je Kalendertag (in diesem Projekt: max. 40 Zeichen), unabhängig von einzelnen Mitarbeiter-Einträgen.

## Geschäftsregeln

- **Genau ein regulärer Eintrag pro Mitarbeiter und Tag.** Ein Mitarbeiter kann an einem Tag nur eine einzige reguläre Zuordnung haben.
- **Höchstens eine Rufbereitschaft pro Kalendertag**, unabhängig von der Person — anders als beim regulären Eintrag ist hier nicht die Kombination aus Tag und Person die Grenze, sondern der Tag allein.
- **Nur Mitarbeiter mit der Rolle Erzieher dürfen zur Rufbereitschaft eingeteilt werden.**
- **Rufbereitschaft und regulärer Eintrag schließen sich nicht aus**: Dieselbe Person darf an einem Tag beides gleichzeitig haben.
- **Rufbereitschaft fließt fachlich nirgends in Arbeitszeit-, Nachtbereitschafts- oder Zuschlagsberechnungen ein** — sie ist rein organisatorisch und wird in der Auswertung nur als reiner Zähler berücksichtigt (siehe [`auswertungstabelle.md`](./auswertungstabelle.md)).
- **Kontrollierte Redundanz beim regulären Eintrag**: Kürzel, Beginn/Ende und alle Zeitanteile werden beim Setzen aus der gewählten Eintragsart kopiert, nicht dauerhaft mit ihr verknüpft nachgeschlagen. Ändert sich die Eintragsart später (z. B. andere Standardzeiten für „Frühdienst"), bleiben bereits gesetzte Einträge davon unberührt — ein einmal gesetzter Dienstplan soll sich nicht rückwirkend ändern, wenn jemand die Stammdaten korrigiert.
- **Arbeitszeit bei mitarbeiterabhängigen Eintragsarten** wird erst beim Setzen berechnet: Arbeitszeit = Wochenarbeitszeit des Mitarbeiters ÷ 5, gerundet auf die volle Minute (eine exakte halbe Minute wird aufgerundet). Der Wert wird zum Setzzeitpunkt aus dem aktuellen Stand des Mitarbeiters gelesen, danach aber fest gespeichert und ändert sich nicht automatisch mit, falls die Wochenarbeitszeit des Mitarbeiters später geändert wird.
- **Dienste über Mitternacht** werden als zwei getrennte Einträge an den beiden beteiligten Tagen abgebildet (Ende „00:00" am ersten Tag, Beginn „00:00" am Folgetag), typischerweise unter Verwendung zweier Eintragsarten mit demselben Kürzel, aber unterschiedlichen Zeit-Varianten. Die Anwendung erzeugt, ändert oder entfernt den jeweils anderen Eintrag nicht automatisch mit.
- **Beginn/Ende sind rein darstellend**: Es wird weder daraus die Anwesenheits- oder Arbeitszeit berechnet, noch geprüft, ob Ende zeitlich nach Beginn liegt. Fachlich verwendet werden ausschließlich die separaten Zeitanteil-Felder.
- **Formale Prüfung**: Uhrzeiten müssen zwischen „00:00" und „23:59" liegen. Für einzelne Zeitanteile gibt es keine fachliche Höchstgrenze, Monatssummen dürfen 24 Stunden überschreiten. Die fachliche Verantwortung für plausible Werte liegt bei der Teamleitung, nicht bei einer automatischen Prüfung.

## Offene Punkte / bewusst zurückgestellt

- ⚠️ Die Regel „Rufbereitschaft nur für Erzieher" war in diesem Projekt zeitweise nur an der Bedienoberfläche geprüft (Auswahlliste gefiltert), nicht zusätzlich in der dahinterliegenden Verarbeitung — für ein neues Projekt von Anfang an als durchgängige Regel einplanen, nicht nur als UI-Filter.
- Löschregeln für bereits gesetzte Einträge, wenn die zugrunde liegende Eintragsart oder der Mitarbeiter gelöscht wird, sind eng mit den jeweiligen Löschregeln aus [`team-verwaltung.md`](./team-verwaltung.md) und [`eintrag-verwaltung.md`](./eintrag-verwaltung.md) verzahnt: Ein Mitarbeiter mit bestehenden Einträgen lässt sich nicht löschen, eine Eintragsart dagegen schon (wegen der Snapshot-Kopie oben bleiben gesetzte Einträge davon unberührt).

## Quelle

`docs/erledigt.md` (Schritte 8–10, 12–14), `docs/tagebuch/2026-kw33.md` und `2026-kw34.md`, `docs/architektur/datenmodell.md` (Abschnitte „Planeintrag", „Rufbereitschaft", „Fachliche Regeln", „Konventionen").
