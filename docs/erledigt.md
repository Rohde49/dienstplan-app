# Erledigt

Abgeschlossene Schritte, ausgelagert aus [`TODO.md`](./TODO.md), damit dort nur noch steht, was offen ist. Je Schritt das Ergebnis in zwei bis drei Zeilen — die vollständigen Checklisten stehen im jeweiligen Ablaufplan, die Begründungen im [Tagebuch](./tagebuch).

Alle Schritte fielen bisher in [KW 33/2026](./tagebuch/2026-kw33.md).

## Überblick

| Schritt | Titel                             | Abgeschlossen | Tests danach |
| ------- | --------------------------------- | ------------- | ------------ |
| 1       | Grundgerüst aufsetzen             | 11.08.2026    | —            |
| 2       | Styling-Fundament                 | 12.08.2026    | —            |
| 3       | Startseite mit Navigation         | 12.08.2026    | —            |
| 4       | Team-Verwaltung                   | 12.08.2026    | 31           |
| 5       | Eintrag-Verwaltung                | 12.08.2026    | 67           |
| 6       | Planungsansicht – Gerüst          | 12.08.2026    | 78           |
| 7       | Dienstplan anlegen und speichern  | 13.08.2026    | 93           |
| 8       | Planeintrag setzen und bearbeiten | 13.08.2026    | 113          |
| 9       | Rufbereitschaft setzen            | 13.08.2026    | 122          |
| 10      | Bemerkung setzen und bearbeiten   | 13.08.2026    | 131          |
| 11      | Berechnete Kennzahlen             | 13.08.2026    | 156          |
| 12      | TeamMember löschen                | 13.08.2026    | 159          |
| 13      | Eintragsdefinition löschen        | 13.08.2026    | 161          |
| 14      | Dienstplan löschen                | 13.08.2026    | 163          |
| 15      | AuswertungsPage                   | 13.08.2026    | 167          |
| 16      | Verkürzte Ansicht                 | 14.08.2026    | 167          |

## Die Schritte im Einzelnen

### Schritt 1: Grundgerüst aufsetzen — 11.08.2026

Projekt mit `electron-vite` gescaffoldet (Electron + Vite + React + TypeScript), ESLint/Prettier eingerichtet, Repository auf GitHub verbunden. IPC zwischen Renderer und Main über das Preload-Skript bestätigt, SQLite-Anbindung über `better-sqlite3` im Main-Prozess isoliert getestet (`src/main/db.ts`, WAL-Modus, Datei unter `app.getPath('userData')`).

Kein Ablaufplan — der Schritt entstand vor der Einführung dieses Formats.

### Schritt 2: Styling-Fundament — 12.08.2026

Tailwind v4 über `@tailwindcss/vite`, shadcn im Style „new-york", `lucide-react`, eigene `cn()`-Funktion als `twMerge(clsx(...))`. Erste Primitives `Card` und `Button` von Hand nachgebaut, keine Codeübernahme aus dem Referenzprojekt.

Die hier festgelegte Farbpalette wurde später zweimal revidiert; die Herleitung steht in [`style/grundlagen.md`](./style/grundlagen.md), der heutige Stand in [`style/design-system.md`](./style/design-system.md).

### Schritt 3: Startseite mit Navigation — 12.08.2026

React Router mit `HashRouter` eingehängt (Begründung in [`architektur/technologieentscheidungen.md`](./architektur/technologieentscheidungen.md)), `StartPage` mit drei Navigations-Cards, drei Platzhalterseiten. Dabei ein Altlast-Bug gefunden: Der Scaffold färbte `body` über eigene Variablen, das neue Theme kam nie im App-Hintergrund an.

### Schritt 4: Team-Verwaltung — 12.08.2026

Erster vollständiger Fachbereich und damit die Blaupause für alle folgenden: Entität → reine Funktionen mit Tests → Repository mit Testdaten → IPC/Preload → UI → echtes SQL. Vitest wurde hier überhaupt erst eingerichtet.

Die wichtigste Weichenstellung fiel nebenbei: `teamRepository.ts` musste die DB-Verbindung als Parameter entgegennehmen, weil der Import der globalen Instanz unter Vitest `app.getPath()` auslöst. Diese Regel gilt seitdem für alle Repositories, siehe [`architektur/prozessgrenzen.md`](./architektur/prozessgrenzen.md).

Plan: [`schritt4-team-verwaltung.md`](./ablaufplaene/erledigt/schritt4-team-verwaltung.md) · Nacharbeit: Umbau nach Nutzer-Mockup (Bearbeiten-Funktion, echte `Table`-Primitive, `ManagementLayout`, globale Inter-Schrift).

### Schritt 5: Eintrag-Verwaltung — 12.08.2026

Stammdatenpflege der `Eintragsdefinition` inklusive der berechnungsart-abhängigen Feldsteuerung. Dabei eine fachliche Korrektur am Datenmodell: Bei `mitarbeiterabhaengig` sind **alle fünf** Zeitwerte auf `0` zu setzen, nicht nur vier — der Wert entsteht erst beim `Planeintrag`.

Zweite Layout-Variante `StackedManagementLayout`, weil die elfspaltige Tabelle das feste Seitenraster sprengte.

Plan: [`schritt5-eintrag-verwaltung.md`](./ablaufplaene/erledigt/schritt5-eintrag-verwaltung.md)

### Schritt 6: Planungsansicht – Gerüst — 12.08.2026

Kalendertage-Berechnung inklusive der zwölf Brandenburger Feiertage als reine Funktion (Osterformel, gegen die offizielle Gesetzesfassung geprüft statt aus dem Gedächtnis übernommen). Sticky-Grid als natives `<table>` mit `colgroup`, zwei- später dreistufig sticky Kopf und sticky Datum-Spalte.

Noch ohne Persistenz und ohne Setzen von Einträgen — bewusst nur das Anzeigegerüst.

Plan: [`schritt6-planungsansicht-geruest.md`](./ablaufplaene/erledigt/schritt6-planungsansicht-geruest.md)

### Schritt 7: Dienstplan anlegen und speichern — 13.08.2026

`Dienstplan`/`Dienstplantag` mit echter SQLite-Anbindung, alle Tageszeilen entstehen in einer Transaktion beim Erstellen. Zustandsmodell mit „Erstellen"/„Speichern"/„Laden" statt Autosave, damit jederzeit erkennbar ist, ob ein gespeicherter Stand oder ein Entwurf bearbeitet wird. Warnhinweis bei ungespeicherten Änderungen.

`getKalendertageFuerMonat()` wanderte hier nach `shared/`, weil jetzt auch der Main-Prozess sie braucht.

Plan: [`schritt7-dienstplan-anlegen-speichern.md`](./ablaufplaene/erledigt/schritt7-dienstplan-anlegen-speichern.md)

### Schritt 8: Planeintrag setzen und bearbeiten — 13.08.2026

Popover je Zellengruppe, lokaler Entwurf gegen eine Baseline, Persistenz gesammelt über „Speichern". Das Entwurf/Baseline-Muster aus diesem Schritt tragen alle folgenden Schritte weiter.

Nebenbei die dauerhafte Ursache der wiederkehrenden `.editorconfig`-Verfälschung gefunden (system-weites `core.autocrlf=true`) und über `.gitattributes` behoben.

Plan: [`schritt8-planeintrag-setzen.md`](./ablaufplaene/erledigt/schritt8-planeintrag-setzen.md)

### Schritt 9: Rufbereitschaft setzen, ändern und entfernen — 13.08.2026

Dasselbe Muster wie Schritt 8, aber einfacher: kein zusammengesetzter Schlüssel, kein Snapshot. `UNIQUE` allein auf `dienstplantagId` — höchstens eine Rufbereitschaft pro Kalendertag.

Plan: [`schritt9-rufbereitschaft-setzen.md`](./ablaufplaene/erledigt/schritt9-rufbereitschaft-setzen.md)

### Schritt 10: Bemerkung setzen und bearbeiten — 13.08.2026

Inline-Textfeld statt Popover, maximal 40 Zeichen. Keine neue Tabelle und keine neue Lade-Logik nötig, da `bemerkung` bereits ein Feld von `Dienstplantag` ist.

Plan: [`schritt10-bemerkung-setzen.md`](./ablaufplaene/erledigt/schritt10-bemerkung-setzen.md)

### Schritt 11: Berechnete Kennzahlen — 13.08.2026

Die vollständige Logik aller 15 Kennzahlen aus [`architektur/auswertung.md`](./architektur/auswertung.md) als reine Funktionen in `shared/auswertung.ts`, verdrahtet zunächst nur in die fünf Zellen des Rasters.

Die Berechnung liegt in `shared/` statt im Main-Prozess, weil sie live aus dem **ungespeicherten** Entwurf rechnen muss — den kennt der Main-Prozess nicht.

Plan: [`schritt11-kennzahlen-berechnen.md`](./ablaufplaene/erledigt/schritt11-kennzahlen-berechnen.md)

### Schritte 12–14: Löschen — 13.08.2026

Drei getrennte Pläne, weil die Komplexität stark auseinanderging:

| Schritt | Gegenstand           | Besonderheit                                                                          |
| ------- | -------------------- | ------------------------------------------------------------------------------------- |
| 12      | `TeamMember`         | blockiert, sobald die Person in einem Planeintrag oder einer Rufbereitschaft vorkommt |
| 13      | `Eintragsdefinition` | ohne Verwendungsprüfung — der `Planeintrag` trägt einen eigenen Snapshot              |
| 14      | `Dienstplan`         | kaskadierende Transaktion über drei Tabellen, ausgelöst aus der Laden-Liste           |

Pläne: [`schritt12-teammember-loeschen.md`](./ablaufplaene/erledigt/schritt12-teammember-loeschen.md) · [`schritt13-eintragsdefinition-loeschen.md`](./ablaufplaene/erledigt/schritt13-eintragsdefinition-loeschen.md) · [`schritt14-dienstplan-loeschen.md`](./ablaufplaene/erledigt/schritt14-dienstplan-loeschen.md)

Bekannte Nebenwirkung von Schritt 12: Praktisch löschen lässt sich nur, wer nie eingeteilt war. Siehe [`architektur/datenmodell.md`](./architektur/datenmodell.md), Abschnitt „Offen".

### Schritt 15: AuswertungsPage — 13.08.2026

Trotz des Namens keine eigene Route, sondern ein Dialog-Overlay in der Planungsansicht. Zeigt alle 15 Zeilen, nur für Erzieher, live aus dem Entwurf. Die farbliche Hervorhebung von Δ Soll/Ist wurde hier nachgezogen — auch rückwirkend im Raster.

Plan: [`schritt15-auswertungspage.md`](./ablaufplaene/erledigt/schritt15-auswertungspage.md)

### Schritt 16: Verkürzte Ansicht — 14.08.2026

Aktiviert den Umschalter „Planung"/„Druckvorschau" und ergänzt eine rein lesende Kompaktansicht: eine Spalte je Mitarbeiter statt drei. Keine neuen Tests, da ausschließlich bereits geprüfte Funktionen wiederverwendet werden.

Der „Drucken"-Button blieb ein deaktivierter Platzhalter — die eigentliche Druckfunktion ist Schritt 17.

Plan: [`schritt16-verkuerzte-ansicht.md`](./ablaufplaene/erledigt/schritt16-verkuerzte-ansicht.md)

## Querschnittsarbeiten

Ohne eigene Schrittnummer, aber mit eigenem Ergebnis.

### Design-System konsolidiert — 15.08.2026

Audit über 28 Komponenten, visuelle Überprüfung, WCAG-2.1-AA-Prüfung, Umsetzung. Ergebnis: 14 Konsistenzbefunde und 17 Barrierefreiheitsbefunde, davon 4 kritisch.

Der schwerwiegendste war nicht durch Codelesen vorhersehbar: Die Auswahllisten im Plan waren als `<tr onClick>` gebaut — Planeinträge und Rufbereitschaften ließen sich ohne Maus **gar nicht** setzen. Außerdem vier echte Kontrastverstöße und Mitarbeiterfarben, von denen mit weißer Schrift nur eine von zehn das AA-Minimum erreichte.

Ergebnis in [`style/design-system.md`](./style/design-system.md) und [`style/barrierefreiheit.md`](./style/barrierefreiheit.md).

### Teststrategie auf fünf Ebenen ausgebaut — 16.08.2026

Die alte Strategie nannte drei Ebenen, von denen zwei real existierten. Ungeprüft war die gesamte UI-Schicht, und mangels jsdom war sie nicht einmal testbar; die „dritte Ebene" bestand aus Screenshot-Skripten, die nicht im Repository lagen.

Neu: Komponententests (jsdom, Testing Library), IPC-Vertragstest gegen `shared/ipcKanaele.ts`, Playwright-E2E gegen die gebaute App inklusive automatisierter Druckprüfung über `printToPDF`. 174 Tests in 19 Dateien plus 5 E2E-Fälle.

Die Druckprüfung hat sofort einen Mangel offengelegt: Die Ausgabe verliert den letzten Tag des Monats. Als `it.fails` festgehalten, siehe [`test/offene-maengel.md`](./test/offene-maengel.md).

Ergebnis in [`test/teststrategie.md`](./test/teststrategie.md) und [`test/testpraxis.md`](./test/testpraxis.md).

### docs-Ordner neu strukturiert — 16.08.2026

`docs/` war gewachsen statt geplant: ein Tagebuch mit über 400 Zeilen, eine TODO mit 239 Zeilen und rund 90 % Erledigtem, vier verschiedene Themen unter `architektur/`, 14 Ablaufpläne in einem Ordner.

Neu nach Bereichen getrennt (`architektur/`, `style/`, `test/`, `workflow/`, `tagebuch/`), Erledigtes ausgelagert, Historie nach Kalenderwochen. Beim Abgleich gegen den Code fielen mehrere veraltete Angaben auf, unter anderem in `projektstruktur.md`, die den Stand nach Schritt 6 beschrieb.

Abgesichert über die Skill `/doku-pflege` und einen Stop-Hook, der erinnert, wenn `src/` geändert wurde und `docs/` nicht. Regeln in [`workflow/doku-pflege.md`](./workflow/doku-pflege.md).
