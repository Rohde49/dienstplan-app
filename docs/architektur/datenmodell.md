# Datenmodell

Die inhaltlichen Entscheidungen zu den einzelnen Entitäten: warum ein Feld so aussieht, wie es aussieht. Die Typen selbst liegen in [`src/shared/types.ts`](../../src/shared/types.ts), ihre Einordnung in die Ordnerstruktur in [`projektstruktur.md`](./projektstruktur.md).

## Entitäten im Überblick

Die App bildet nur ein einzelnes Team ab, deshalb gibt es keine eigene `Team`-Entität. Alle sechs Entitäten sind inzwischen als Typ **und** als SQLite-Tabelle umgesetzt:

| Entität              | Tabelle                | Eindeutig über                               | Früherer Name |
| -------------------- | ---------------------- | -------------------------------------------- | ------------- |
| `TeamMember`         | `team_members`         | `id`                                         | —             |
| `Eintragsdefinition` | `eintragsdefinitionen` | `id` (`kuerzel` bewusst **nicht** eindeutig) | `ShiftType`   |
| `Dienstplan`         | `dienstplaene`         | `id` (mehrere Pläne je Monat zulässig)       | —             |
| `Dienstplantag`      | `dienstplantage`       | `id`                                         | —             |
| `Planeintrag`        | `planeintraege`        | `UNIQUE (dienstplantagId, teamMemberId)`     | `PlanEntry`   |
| `Rufbereitschaft`    | `rufbereitschaften`    | `UNIQUE (dienstplantagId)`                   | —             |

Weitere Entitäten sind bewusst zurückgestellt und werden erst bei Bedarf ergänzt. Zusätzlich zu den Entitäten gibt es fachliche Regeln, die mehrere Entitäten verbinden (siehe [„Fachliche Regeln"](#fachliche-regeln)), sowie durchgängige Darstellungs- und Speicherkonventionen (siehe [„Konventionen"](#konventionen)).

Neben den Entitäten stehen in `shared/types.ts` vier abgeleitete Hilfstypen, die keine eigene Tabelle haben und nur den Weg durch die IPC-Grenze beschreiben: `PlaneintragSnapshot` (ein `Planeintrag` ohne `id` und Fremdschlüssel) sowie `PlaneintragAenderung`, `RufbereitschaftAenderung` und `BemerkungAenderung` — die drei Änderungslisten, die der Renderer beim Speichern übergibt (`null` bedeutet jeweils „entfernen").

**Fremdschlüssel sind dokumentiert, aber nicht erzwungen.** Die `REFERENCES`-Klauseln stehen im Schema, `PRAGMA foreign_keys` ist jedoch nicht eingeschaltet — SQLite prüft sie deshalb nicht. Referenzielle Integrität stellt ausschließlich der Anwendungscode her (Verwendungsprüfung beim Löschen eines `TeamMember`, kaskadierende Transaktion beim Löschen eines `Dienstplan`). Wer eine dieser Regeln ändert, kann sich nicht auf die Datenbank als zweites Netz verlassen.

## TeamMember

```typescript
interface TeamMember {
  id: number
  vorname: string
  name: string
  rolle: 'Erzieher' | 'Praktikant' | 'Wirtschaftskraft'
  wochenarbeitszeitMinuten: number // z. B. 39h-Woche = 2340, Anzeige/Eingabe als "39:00"
  farbe: string // Hex-Wert aus fester Palette, z. B. "#3A8DFF"
}
```

### Entscheidungen und Begründung

**`id: number`**: Ergibt sich aus der bestehenden `better-sqlite3`-Anbindung, die standardmäßig einen auto-increment Integer als Primärschlüssel (rowid) vergibt. Keine offene Entscheidung, sondern Konsequenz aus Schritt 1.

**`rolle` als fester Union Type**: Die drei bekannten Rollen (Erzieher, Praktikant, Wirtschaftskraft) werden als TypeScript Union Type abgebildet, nicht als eigene Datenbanktabelle. Passt zu einer kleinen, aktuell bekannten Rollenliste. Falls künftig Rollen frei durch den Nutzer verwaltet werden sollen, ist das ein bewusster späterer Umbau zu einer eigenen Entität.

**`wochenarbeitszeitMinuten` als Zahl in Minuten**: Zeitwerte werden in der gesamten App im Format HH:MM dargestellt und eingegeben, das betrifft aber nur Anzeige und Eingabe. Intern wird die Wochenarbeitszeit als Minutenzahl gespeichert (z. B. 39h = 2340), weil spätere Berechnungen (Soll-/Ist-Vergleich, Summenbildung über einen Monat) mit einer Zahl fehlerfrei möglich sind, während ein String wie `"39:00"` bei jeder Rechnung neu geparst werden müsste. Die Umrechnung HH:MM ↔ Minuten erfolgt an der UI-Grenze (Renderer).

**`farbe` als Hex-String aus fester Palette**: Auswahl aus einer vordefinierten Palette statt freier Farbwahl, um Lesbarkeit und Unterscheidbarkeit der Mitglieder im Dienstplan zu garantieren. Zehn kräftige, gut unterscheidbare Farbtöne, bewusst getrennt vom Theme-Akzent — kein Grauton (für UI-Chrome reserviert) und keine zu große Nähe zum `--destructive`-Rotton (um Verwechslung mit Fehler-/Lösch-Zuständen zu vermeiden). Herleitung der Palette siehe [`style/grundlagen.md`](../style/grundlagen.md), ihre Darstellung im Raster siehe [`style/design-system.md`](../style/design-system.md).

**Der Farbname gehört zur Datenstruktur, nicht in einen Kommentar.** Die Palette liegt deshalb als Objektliste vor, nicht als Liste von Hex-Werten — die Farbauswahl braucht den Namen als Beschriftung, sonst sagt der Screenreader den Hex-Code an und die Auswahl ist rein farblich erkennbar:

```typescript
export const TEAM_MEMBER_FARBEN = [
  { wert: '#3A8DFF', name: 'Blau' },
  { wert: '#34B37A', name: 'Grün' },
  { wert: '#F2994A', name: 'Orange' },
  { wert: '#9B6BDE', name: 'Violett' },
  { wert: '#2FB6C4', name: 'Türkis' },
  { wert: '#E15A97', name: 'Pink' },
  { wert: '#C9A227', name: 'Oliv-Gelb' },
  { wert: '#5C6BC0', name: 'Indigo' },
  { wert: '#C1662F', name: 'Terrakotta' },
  { wert: '#7FB236', name: 'Lindgrün' }
] as const

export const TEAM_MEMBER_COLORS = TEAM_MEMBER_FARBEN.map((farbe) => farbe.wert)
export function teamMemberFarbName(wert: string): string
```

`TEAM_MEMBER_COLORS` ist die daraus abgeleitete reine Wertliste und bleibt der Prüfwert für die Validierung; `teamMemberFarbName()` liefert den Namen zu einem Wert. Die zehn Werte selbst sind final.

## Eintragsdefinition

Zentrale Verwaltung der Stammdaten der Einträge, die einem `Planeintrag` zugewiesen werden können. Dazu zählen Dienste mit fester, mitarbeiterunabhängiger Zeit sowie weitere Einträge (z. B. Urlaub oder Krankheit) mit mitarbeiterabhängiger Zeit, deren Wert sich aus der Wochenarbeitszeit des Mitarbeiters ableitet.

```typescript
interface Eintragsdefinition {
  id: number
  kuerzel: string
  name: string
  berechnungsart: 'fest' | 'mitarbeiterabhaengig'
  beginn: string | null // Uhrzeit "HH:MM", optional
  ende: string | null // Uhrzeit "HH:MM", optional
  anwesenheitszeitMinuten: number
  arbeitszeitMinuten: number
  arbeitszeitOhneNachtbereitschaftMinuten: number
  nachtbereitschaftMinuten: number
  nachtarbeitMinuten: number
}
```

### Entscheidungen und Begründung

**Name `Eintragsdefinition` statt ursprünglich `ShiftType`**: Passt zur bereits in Schritt 3 angelegten Route „Eintrag-Verwaltung" (`EintraegePage`) und deckt nicht nur Dienste, sondern auch mitarbeiterabhängige Einträge wie Urlaub oder Krankheit ab, für die „ShiftType" (Schichttyp) fachlich zu eng wäre.

**Zwei Kategorien über `berechnungsart`**: `'fest'` für Einträge mit fester, mitarbeiterunabhängiger Zeit (z. B. Frühdienst), `'mitarbeiterabhaengig'` für Einträge, deren Arbeitszeit sich aus der Wochenarbeitszeit des jeweiligen Mitarbeiters ableitet (z. B. Urlaub, Krankheit). Wie schon bei `TeamMember.rolle` als fester Union Type statt eigener Datenbanktabelle abgebildet, da die Unterscheidung nur diese zwei Werte kennt.

**`beginn`/`ende` als `string | null` im Format `"HH:MM"`, nicht als Minutenzahl**: Korrigiert gegenüber einer ersten Fassung dieses Dokuments, die hier fälschlich Minuten seit Mitternacht vorsah. Es gilt die in [„Konventionen"](#konventionen) festgelegte Unterscheidung: `beginn`/`ende` sind Zeitpunkte (Uhrzeiten), keine Zeitdauern, und werden deshalb durchgängig als `"HH:MM"`-Zeichenkette geführt, nicht in Minuten umgerechnet. Beide Felder sind optional, unabhängig von der Berechnungsart — auch eine Eintragsdefinition mit `berechnungsart: 'fest'` kann ohne konkrete Uhrzeit sein (z. B. eine ganztägige Fortbildung mit fester Dauer, aber ohne festen Beginn).

**Fünf Zeitwerte als unabhängig eingegebene Werte, nicht berechnet**: `anwesenheitszeitMinuten`, `arbeitszeitMinuten`, `arbeitszeitOhneNachtbereitschaftMinuten`, `nachtbereitschaftMinuten` und `nachtarbeitMinuten` sind Zeitdauern (siehe Konventionen), intern als Minuten geführt. Sie gliedern dieselbe an einem Dienst geleistete Zeit in Anteile:

- `nachtarbeitMinuten` ist ein Anteil von `arbeitszeitOhneNachtbereitschaftMinuten`.
- `arbeitszeitOhneNachtbereitschaftMinuten` ist die Arbeitszeit ohne `nachtbereitschaftMinuten` (reine Arbeitszeit inklusive Nachtarbeit).
- `arbeitszeitMinuten` = `arbeitszeitOhneNachtbereitschaftMinuten` + `nachtbereitschaftMinuten`.
- `anwesenheitszeitMinuten` = `arbeitszeitMinuten` + Pausen (die Pausendauer selbst hat kein eigenes Feld, sie ergibt sich als Differenz).

Die Teamleitung trägt alle fünf Werte bei der Stammdatenpflege unabhängig voneinander ein. Die Anwendung prüft nur das Eingabeformat, nicht die rechnerische Konsistenz zwischen den Werten. Ein eigenes Feld für die „reine" Arbeitszeit ohne Nachtanteile gibt es bewusst nicht, sie wird fachlich nirgends eigenständig benötigt.

**`arbeitszeitMinuten` bei `berechnungsart: 'mitarbeiterabhaengig'` ohne Aussagekraft auf Stammdatenebene**: Der tatsächliche Wert wird erst beim Anlegen eines `Planeintrag` aus der zu diesem Zeitpunkt aktuellen `TeamMember.wochenarbeitszeitMinuten` berechnet und dort gespeichert (siehe `Planeintrag`), nicht auf der Eintragsdefinition selbst. Da dieser Wert auf Stammdatenebene keine Bedeutung hat, ist er hier keine Ausnahme gegenüber den anderen vier Zeitwerten: Alle fünf Zeitwerte sowie `beginn`/`ende` sind für diese Berechnungsart auf `0` bzw. `null` gesetzt und in der Eingabemaske deaktiviert. Die Teamleitung legt für einen mitarbeiterabhängigen Eintrag damit nur `kuerzel`, `name` und `berechnungsart` fest.

**`kuerzel` ist nicht eindeutig**: Mehrere Eintragsdefinitionen können dasselbe Kürzel tragen, wenn sie unterschiedliche Zeit-Varianten desselben fachlichen Eintrags abbilden — z. B. ein über Mitternacht laufender Dienst „SN/F", der laut `Planeintrag` als zwei separate Einträge mit je eigenem `beginn`/`ende` erfasst wird, aber beide dasselbe Kürzel „SN/F" tragen sollen. Unterschieden werden solche Datensätze über `beginn`/`ende` (der fachliche Unterschied) und über `id` (der technische Schlüssel, wie bei jeder Entität, siehe Konventionen) — nicht über `kuerzel`. Auswertungen, die nach Kürzel filtern (siehe [`auswertung.md`](./auswertung.md)), müssen das berücksichtigen und dürfen sich nicht auf Eindeutigkeit von `kuerzel` verlassen.

## Dienstplan

Monatsplan der Wohngruppe.

```typescript
interface Dienstplan {
  id: number
  monat: number // 1-12
  jahr: number
  titel: string
  erstelltAm: string // ISO-Zeitstempel
  geaendertAm: string // ISO-Zeitstempel
}
```

### Entscheidungen und Begründung

**Kein Verweis auf eine Wohngruppen-Entität**: Analog zur Begründung bei `TeamMember`, dass es keine eigene `Team`-Entität gibt, die App bildet nur eine einzelne Wohngruppe ab.

**`monat`/`jahr` als eigene Zahlenfelder statt eines Datums**: Ein Dienstplan bezieht sich immer auf einen ganzen Kalendermonat, nicht auf ein einzelnes Datum. Zwei separate Zahlenfelder sind für Abfragen wie „alle Dienstpläne eines Jahres" einfacher als ein künstlicher Tag (z. B. immer der Erste des Monats).

**`erstelltAm`/`geaendertAm`**: Für die spätere Übersicht mehrerer Dienstpläne (Liste, Sortierung nach zuletzt bearbeitet), fachlich nicht für die Planung selbst relevant.

## Dienstplantag

Ein einzelner Kalendertag innerhalb eines Monatsplans.

```typescript
interface Dienstplantag {
  id: number
  dienstplanId: number // FK auf Dienstplan.id
  datum: string // ISO-Datum, z. B. "2026-09-01"
  bemerkung: string | null
}
```

### Entscheidungen und Begründung

**`dienstplanId`**: Fehlte in der ursprünglichen Notiz, ergänzt, weil ein `Dienstplantag` immer „innerhalb eines Monatsplans" existiert und diese Zuordnung als expliziter Fremdschlüssel abgebildet wird, nicht implizit über `datum` gegen `Dienstplan.monat`/`jahr` abgeleitet werden soll.

**Wochentag-, Wochenend- und Feiertagsstatus nicht gespeichert**: Werden aus `datum` abgeleitet, keine Redundanz in der Datenbank.

## Planeintrag

Zuordnung einer `Eintragsdefinition` zu einem `TeamMember` an einem `Dienstplantag`. Ehemals als `PlanEntry` bezeichnet, hier umbenannt auf den deutschen Begriff, konsistent mit `Eintragsdefinition`.

```typescript
interface Planeintrag {
  id: number
  dienstplantagId: number // FK auf Dienstplantag.id
  teamMemberId: number // FK auf TeamMember.id
  eintragsdefinitionId: number // FK auf Eintragsdefinition.id, Herkunft des Snapshots
  kuerzel: string // Snapshot aus Eintragsdefinition.kuerzel zum Zeitpunkt des Setzens
  beginn: string | null // Uhrzeit "HH:MM", Snapshot, rein darstellend
  ende: string | null // Uhrzeit "HH:MM", Snapshot, rein darstellend
  anwesenheitszeitMinuten: number
  arbeitszeitMinuten: number
  arbeitszeitOhneNachtbereitschaftMinuten: number
  nachtbereitschaftMinuten: number
  nachtarbeitMinuten: number
}
```

### Entscheidungen und Begründung

**`eintragsdefinitionId` als Fremdschlüssel, obwohl in der ursprünglichen Notiz nicht explizit aufgeführt**: Ergänzt aus demselben Grund wie `dienstplanId` bei `Dienstplantag` — die Notiz beschreibt den `Planeintrag` selbst als „Zuordnung einer Eintragsdefinition zu einem Mitarbeiter an einem Dienstplantag", das setzt einen Verweis auf die gewählte `Eintragsdefinition` voraus, unabhängig vom zusätzlichen Snapshot der Werte.

**Kontrollierte Redundanz**: `kuerzel`, `beginn`, `ende` und die fünf Zeitwerte werden beim Anlegen des `Planeintrag` aus der gewählten `Eintragsdefinition` in den `Planeintrag` kopiert, nicht live über `eintragsdefinitionId` nachgeschlagen. Ändert sich die `Eintragsdefinition` später (z. B. andere Standardzeiten für „Frühdienst"), bleiben bereits gesetzte `Planeintrag`-Datensätze davon unberührt. Das ist beabsichtigt: Ein einmal gesetzter Dienstplan soll sich nicht rückwirkend ändern, wenn jemand die Stammdaten korrigiert.

**`arbeitszeitMinuten` bei `berechnungsart: 'mitarbeiterabhaengig'`**: Wird beim Setzen des `Planeintrag` aus der zu diesem Zeitpunkt aktuellen `TeamMember.wochenarbeitszeitMinuten` bestimmt, nach der Formel `arbeitszeitMinuten = wochenarbeitszeitMinuten / 5`, gerundet auf die volle Minute (Rundungsregel siehe Konventionen). Die Quelle ist damit zum Setzzeitpunkt „live" aus `TeamMember` gelesen, das Ergebnis wird aber anschließend fest auf dem `Planeintrag` gespeichert (kontrollierte Redundanz, siehe oben) und ändert sich nicht mehr automatisch mit, falls sich die Wochenarbeitszeit des Mitarbeiters später ändert. Die vier anderen Zeitwerte erhalten `0`, `beginn`/`ende` bleiben `null`.

**Über Mitternacht laufende Dienste als zwei getrennte Einträge**: Ein `Planeintrag` gehört immer zu genau einem Kalendertag. Ein Dienst, der über Mitternacht geht (z. B. „SN/F"), wird durch zwei manuell gesetzte `Planeintrag`-Datensätze an den beiden beteiligten Tagen abgebildet (Ende `"00:00"` am ersten Tag, Beginn `"00:00"` am Folgetag), typischerweise unter Verwendung zweier `Eintragsdefinition`-Datensätze mit demselben Kürzel, aber unterschiedlichen Zeit-Varianten (siehe `Eintragsdefinition`). Die Anwendung erzeugt, ändert oder entfernt keinen Folgeeintrag automatisch.

**`beginn`/`ende` rein darstellend**: Es wird weder daraus die Anwesenheits- oder Arbeitszeit berechnet, noch geprüft, ob `ende` zeitlich nach `beginn` liegt. Die fachlich verwendeten Zeitdauern sind ausschließlich die fünf separaten Minutenfelder.

**Genau ein regulärer Eintrag pro Mitarbeiter und Tag**: `(dienstplantagId, teamMemberId)` muss eindeutig sein, als `UNIQUE`-Constraint auf Datenbankebene, nicht nur clientseitig geprüft. „Regulär" grenzt hier gegen `Rufbereitschaft` ab, die unabhängig davon zusätzlich bestehen kann (siehe unten und [„Fachliche Regeln"](#fachliche-regeln)).

## Rufbereitschaft

Tagesbezogene Einteilung einer Person zur Rufbereitschaft.

```typescript
interface Rufbereitschaft {
  id: number
  dienstplantagId: number // FK auf Dienstplantag.id
  teamMemberId: number // FK auf TeamMember.id, muss rolle: 'Erzieher' sein
}
```

### Entscheidungen und Begründung

**Keine eigenen fachlichen Attribute außer den Fremdschlüsseln**: Der Tag und die eingeteilte Person ergeben sich vollständig aus `dienstplantagId` und `teamMemberId`. Eine leere/keine Zuordnung bedeutet „keine Rufbereitschaft an diesem Tag" und wird durch das Fehlen einer Zeile abgebildet, nicht durch einen Nullwert in einer Spalte.

**Nur `TeamMember` mit `rolle: 'Erzieher'` zulässig**: Fachliche Regel, die über die reine Typstruktur (`teamMemberId: number`) hinausgeht.

> ⚠️ Zu prüfen: Diese Regel ist nur in der Auswahl-UI umgesetzt (`RufbereitschaftAuswahl` filtert die Liste auf Erzieher). Der Main-Prozess prüft sie nicht — ursprünglich stand hier, sie „muss auch bei der Verarbeitung im Main-Prozess geprüft werden", was den Code nie beschrieben hat. Praktisch folgenlos, solange die UI die einzige Eingabequelle ist; festgehalten in [`test/offene-maengel.md`](../test/offene-maengel.md).

**Höchstens eine Rufbereitschaft pro Kalendertag**: Anders als bei `Planeintrag` ist hier `dienstplantagId` allein eindeutig (`UNIQUE`), nicht die Kombination mit `teamMemberId` — pro Tag ist unabhängig von der Person nur eine einzige Rufbereitschaft zulässig.

**Kombinierbar mit `Planeintrag`**: Dieselbe Person darf an einem Tag sowohl einen regulären `Planeintrag` als auch die `Rufbereitschaft` haben. Rufbereitschaften fließen nicht in Arbeitszeit-, Nachtbereitschafts- oder Zuschlagsberechnungen ein, sie sind rein organisatorisch und werden nur als Zähler in der Auswertungsansicht berücksichtigt (siehe [`auswertung.md`](./auswertung.md)).

## Beziehungen

Kompakte Übersicht der Kardinalitäten zwischen den Entitäten, als Ergänzung zu den einzelnen Fremdschlüsseln oben:

- `Dienstplan` (1) — `Dienstplantag` (0..*): ein Dienstplan hat mehrere Tage, jeder `Dienstplantag` gehört zu genau einem `Dienstplan`.
- `Dienstplantag` (1) — `Planeintrag` (0..*): ein Tag kann mehrere Planeinträge haben (einer pro Mitarbeiter), jeder `Planeintrag` gehört zu genau einem `Dienstplantag`.
- `TeamMember` (1) — `Planeintrag` (0..*): ein Mitarbeiter kann über die Zeit viele Planeinträge haben, aber höchstens einen pro Tag (zusammengesetzte Eindeutigkeit über `Dienstplantag` + `TeamMember`).
- `Eintragsdefinition` (1) — `Planeintrag` (0..*): eine Eintragsdefinition kann Vorlage für viele Planeinträge gewesen sein, ohne lebende Bindung (Snapshot, siehe oben).
- `Dienstplantag` (1) — `Rufbereitschaft` (0..1): höchstens eine Rufbereitschaft pro Tag.
- `TeamMember`, nur `rolle: 'Erzieher'` (1) — `Rufbereitschaft` (0..*): ein Erzieher kann an mehreren Tagen Rufbereitschaft haben.

## Fachliche Regeln

Regeln, die mehrere Entitäten verbinden und sich nicht allein als Kardinalität ausdrücken lassen:

- **Gesetzliche Feiertage**: Die Anwendung berechnet automatisch die zwölf gesetzlichen Feiertage nach § 2 Absatz 1 des Brandenburger Feiertagsgesetzes (feste und vom Osterdatum abhängige Feiertage, einschließlich Ostersonntag und Pfingstsonntag als Feiertage). Ein Tag, der zugleich Sonntag und Feiertag ist, wird nur einmal berücksichtigt. Gedenk-, Trauer- und religiöse Feiertage außerhalb dieser gesetzlichen Liste sowie benutzerdefinierte Feiertage gehören nicht zum Mindestumfang. Gesetzesänderungen erfordern eine spätere Aktualisierung. Der Feiertagsstatus wird, wie Wochentag und Wochenende, aus dem Datum abgeleitet und nicht auf `Dienstplantag` gespeichert (siehe dort).

## Konventionen

Durchgängige Regeln für die Darstellung und Speicherung, die für mehrere Entitäten gleichermaßen gelten:

- **Zeitpunkte** (z. B. `beginn`/`ende` bei `Eintragsdefinition` und `Planeintrag`) werden als Uhrzeit im Format `"HH:MM"` geführt, auch intern — keine Umrechnung in Minuten.
- **Zeitdauern** (z. B. `wochenarbeitszeitMinuten`, `anwesenheitszeitMinuten`, `arbeitszeitMinuten`) werden intern durchgängig in Minuten geführt. Das Format Stunden:Minuten (z. B. `"6:30"` für sechseinhalb Stunden) wird nur für Darstellung und Eingabe verwendet, über `parseHHMMToMinutes`/`formatMinutesToHHMM` aus [`src/shared/time.ts`](../../src/shared/time.ts).
- **Rundung an einer Stelle**: `rundeAufVolleMinute()` in [`src/shared/rundeAufVolleMinute.ts`](../../src/shared/rundeAufVolleMinute.ts) ist die einzige Umsetzung der Rundungsregel unten und wird von der mitarbeiterabhängigen Arbeitszeit, der Soll-Arbeitszeit und beiden Zuschlägen gemeinsam genutzt.
- **Rundung**: Berechnete Zeitdauern (z. B. `arbeitszeitMinuten` bei mitarbeiterabhängigen Einträgen, Soll-Arbeitszeit) werden auf die nächstgelegene volle Minute gerundet, eine exakte halbe Minute wird aufgerundet.
- **Datumsangaben** (z. B. `Dienstplantag.datum`) werden im Format `"JJJJ-MM-TT"` geführt.
- **Zeitstempel** (z. B. `Dienstplan.erstelltAm`/`geaendertAm`) werden als ISO-Zeichenkette geführt.
- Jede Entität hat einen eindeutigen `id: number` als Schlüssel (auto-increment über `better-sqlite3`, siehe `TeamMember`).
- **Formale Prüfung von Uhrzeiten und Zeitdauern** (überall, wo diese Wertetypen vorkommen, insbesondere bei `Eintragsdefinition` und `Planeintrag`): Uhrzeiten müssen zwischen `"00:00"` und `"23:59"` liegen (`"00:00"` ist als `beginn` oder `ende` zulässig). Zeitdauern werden im Format Stunden:Minuten eingegeben und angezeigt, intern als nichtnegative ganze Minutenzahl gespeichert; es wird nicht geprüft, ob `ende` zeitlich nach `beginn` liegt. Für einzelne Werte gibt es keine fachliche Höchstgrenze, Monatssummen dürfen 24 Stunden überschreiten. Diese Prüfungen sind rein formal, die fachliche Verantwortung für die eingegebenen Werte liegt bei der Teamleitung.

## Offen

Keine offenen Modellierungsfragen. Alle sechs Entitäten sind entworfen, als Typ angelegt und an SQLite angebunden.

Zwei Punkte sind bewusst **nicht** Teil dieses Dokuments:

- Die **berechneten Kennzahlen** führen keine eigene Entität ein, sondern leiten alles aus den bestehenden Datensätzen ab — siehe [`auswertung.md`](./auswertung.md).
- Ein **„inaktiv"-Status** für ausgeschiedene Mitarbeiter existiert nicht. Da das Löschen eines `TeamMember` blockiert wird, sobald er in einem `Planeintrag` oder einer `Rufbereitschaft` vorkommt, lässt sich praktisch nur entfernen, wer nie eingeteilt war. Diese Nebenwirkung ist bekannt und wurde beim Entwurf der Löschfunktion offen benannt; ein Status-Feld wäre das passendere Werkzeug, ist aber nie beauftragt worden.
