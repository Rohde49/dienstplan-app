# Ablaufplan Schritt 8: Planeintrag – Setzen und Bearbeiten

Annahme zum Umfang: Dieser Schritt behandelt das Setzen, Ändern und Entfernen von `Planeintrag`-Datensätzen im Grid der `PlanungsPage`, aufbauend auf der in Schritt 7 gebauten Dienstplan-Persistenz. `Rufbereitschaft`, die Bemerkung-Spalte und alle berechneten Kennzahlen (Δ Soll/Ist, Dienste-Zähler, Ist-Arbeitszeit-Summen) sind weiterhin nicht Teil dieses Schritts, siehe [`temp/temp-PlanungPage.md`](../temp/temp-PlanungPage.md) für die dafür noch offenen Fragen. Falls das nicht mehr stimmt, bitte vor dem Start korrigieren.

## Design-Entscheidungen (Referenz für alle Punkte unten)

**Speicherverhalten**: Wie in Schritt 7 festgelegt, persistiert ausschließlich der „Speichern"-Button. Das Setzen/Ändern/Entfernen eines Planeintrags in einer Zelle ändert zunächst nur lokalen React-State in `PlanPage` (Entwurf), nicht die Datenbank. Der bestehende `gibtUngespeicherteAenderung`-Flag aus Schritt 7 (bisher nur ein Titel-Vergleich) wird erweitert, sodass er auch bei abweichendem Planeintrag-Entwurf `true` ergibt — er steuert weiterhin den Warnhinweis vor „Laden"/„Neu anlegen"/„Startseite".

**Zellen nur interaktiv mit aktivem Dienstplan**: Die Eintrag-Zellen sind nur klickbar, wenn `aktiverDienstplan !== null` (also nach „Erstellen" oder „Laden"). Im Vorschau-Zustand ohne aktiven Dienstplan gibt es keine `Dienstplantag`-IDs, an die sich ein `Planeintrag` hängen ließe.

**Popover statt Dialog**: Klick auf eine Eintrag/Beginn/Ende-Zellengruppe eines Tages/Mitarbeiters öffnet ein Popover (`@radix-ui/react-popover`, neue Abhängigkeit, als `components/ui/popover.tsx` von Hand nachgebaut, analog zum Vorgehen bei `Dialog`/`AlertDialog` in Schritt 7) mit der Liste aller `Eintragsdefinition`-Einträge (Spalten: Kürzel, Beginn, Ende — `null`-Uhrzeiten als „–" wie in `EintraegePage` üblich), plus einem Eintrag „Kein Eintrag" ganz oben in derselben Liste zum Entfernen. Kein separater „Entfernen"-Button. Beginn/Ende werden aus der gewählten `Eintragsdefinition` übernommen und bleiben danach fest (nicht in der Zelle nachträglich editierbar) — daher sind die drei Unterspalten Eintrag/Beginn/Ende eines Tages/Mitarbeiters eine einzige klickbare Einheit, keine drei unabhängigen Felder.

**Datenquelle für die Auswahl**: Die Popover-Liste nutzt die bereits bestehende `eintragsdefinition.list()`-API aus Schritt 5, keine neue IPC-Schnittstelle nötig.

**Mitarbeiterabhängige Berechnung gehört zu diesem Schritt**: Beim Setzen eines Eintrags mit `berechnungsart: 'mitarbeiterabhaengig'` wird `arbeitszeitMinuten = wochenarbeitszeitMinuten / 5` (gerundet, siehe Konventionen in `datenmodell.md`) sofort beim Auswählen im Popover berechnet und in den lokalen Entwurf übernommen, nicht erst beim Speichern. Die vier anderen Zeitwerte bleiben `0`, `beginn`/`ende` bleiben `null`, `kuerzel` wird übernommen — exakt wie in `datenmodell.md` beschrieben.

**Über Mitternacht laufende Dienste**: Kein besonderer UI-Support. Zwei unabhängige, manuell gesetzte Einträge an den beiden beteiligten Tagen, wie im Datenmodell vorgesehen.

**Visuelle Markierung ungespeicherter Zellen**: Zellen, deren lokaler Entwurf vom zuletzt gespeicherten Stand abweicht, bekommen einen dezenten Indikator (kleiner Punkt), damit erkennbar ist, was „Speichern" als Nächstes persistieren würde.

**Speichervorgang**: „Speichern" schickt Titel und ausschließlich die seit dem letzten Speichern geänderten Zellen (nicht den kompletten Planungsstand) in einem Aufruf an den Main-Prozess, der beides in einer Transaktion verarbeitet: Titel-Update auf `dienstplaene` sowie je geänderter Zelle ein Entfernen der vorhandenen Zeile (falls vorhanden) gefolgt von einem Neu-Einfügen (falls nicht „Kein Eintrag" gewählt wurde) in `planeintraege` — bewusst kein `UPDATE` einzelner Felder, da ein Wechsel der `Eintragsdefinition` ohnehin alle Snapshot-Felder ersetzt. Nach erfolgreichem Speichern wird die lokale Baseline auf den neuen Stand gesetzt (keine Zelle mehr als „ungespeichert" markiert).

Jeder Punkt unten ist ein eigener Prompt für Claude Code: erst im Plan Mode geben, nach Freigabe umsetzen lassen, erst danach zum nächsten Punkt übergehen, jeweils mit der beschriebenen Prüfung. Bei Unsicherheiten zur genauen Aufteilung der Repository-Funktionen (z. B. ob die kombinierte Speicherfunktion in `dienstplanRepository.ts` oder einem neuen `planeintragRepository.ts` landet) im Plan Mode nachfragen, bevor umgesetzt wird — unten steht ein Vorschlag, keine bindende Vorgabe.

## 1. `Planeintrag`-Typ in `shared/types.ts`

Ergänze das Interface exakt wie in `datenmodell.md` festgelegt. Prüfe mit `npm run typecheck`.

## 2. Berechnungsfunktion für mitarbeiterabhängige Arbeitszeit

Reine Funktion (Vorschlag: `src/renderer/src/lib/`), die aus `wochenarbeitszeitMinuten: number` den Wert `arbeitszeitMinuten = wochenarbeitszeitMinuten / 5` berechnet, gerundet auf die volle Minute nach der in `datenmodell.md` (Konventionen) festgelegten Regel (exakte halbe Minute wird aufgerundet). Unit-Tests inklusive eines Falls mit exakt halber Minute.

## 3. Repository-Funktionssignaturen mit Testdaten

Lege `getPlaneintraegeFuerDienstplan(dienstplanId: number): Planeintrag[]` an (Vorschlag: neues Modul `src/main/db/planeintragRepository.ts`) sowie eine kombinierte Speicherfunktion, die Titel und Planeintrag-Änderungen gemeinsam verarbeitet (Vorschlag: `speicherePlanungsstand(dienstplanId, titel, aenderungen)` in `dienstplanRepository.ts`, da sie in derselben Transaktion auch `dienstplaene.geaendertAm` aktualisiert). `aenderungen` als Array von `{ dienstplantagId: number; teamMemberId: number; eintrag: Planeintrag_ohne_id | null }` (`null` = entfernen). Zunächst mit Testdaten im Speicher, noch kein SQL.

## 4. IPC-Handler und Preload-API

Ergänze `planeintrag:listFuerDienstplan` sowie einen neuen oder erweiterten Speichern-Kanal, der den bisherigen `dienstplan:updateTitel` aus Schritt 7 ersetzt oder ergänzt (Titel-only-Speichern gibt es dann nicht mehr separat, „Speichern" deckt beides ab). Preload-API entsprechend erweitern.

## 5. Popover-Primitive und Eintragsdefinition-Auswahl

Baue `components/ui/popover.tsx` (`@radix-ui/react-popover`, von Hand nachgebaut wie die bisherigen Radix-Primitives) sowie eine fachspezifische Komponente (z. B. `components/EintragsdefinitionAuswahl.tsx`), die `eintragsdefinition.list()` lädt und als Liste im Popover anzeigt (Kürzel/Beginn/Ende, „Kein Eintrag" oben). Noch keine Anbindung ans Grid. Screenshot-Bestätigung: Popover öffnet sich mit korrekt formatierter Liste.

## 6. Popover ans Grid anbinden, lokaler Entwurf

Verbinde die Eintrag/Beginn/Ende-Zellengruppe in `PlanungsGrid` mit dem Popover aus Punkt 5 (nur klickbar, wenn `dienstplantage`-Prop nicht leer ist, siehe Design-Entscheidung oben). Führe in `PlanPage` einen lokalen Entwurfs-State für Planeinträge ein (Baseline vs. aktueller Stand, analog zum bestehenden Titel-Muster aus Schritt 7). Bei mitarbeiterabhängigen Eintragsdefinitionen die Funktion aus Punkt 2 anwenden. `gibtUngespeicherteAenderung` erweitern. Zellen mit abweichendem Entwurf bekommen den dezenten Punkt-Indikator. Screenshot-Bestätigung: Eintrag setzen, ändern, über „Kein Eintrag" wieder entfernen, Indikator erscheint/verschwindet korrekt, Warnhinweis bei „Laden"/„Neu anlegen" greift jetzt auch bei offenen Planeintrag-Änderungen.

## 7. Laden erweitert Planeintraege in die Baseline

Beim Laden eines Dienstplans (`dienstplan:get`-Fluss aus Schritt 7) zusätzlich `planeintrag:listFuerDienstplan` aufrufen und das Ergebnis als Baseline in den Entwurfs-State aus Punkt 6 übernehmen, im Grid entsprechend darstellen. Beim Erstellen bleibt die Baseline leer. Screenshot-Bestätigung: Dienstplan mit zuvor gesetzten Einträgen laden, Grid zeigt sie korrekt an, keine Zelle fälschlich als „ungespeichert" markiert.

## 8. „Speichern" um Planeintrag-Änderungen erweitern

`handleSpeichern` aus Schritt 7 ruft jetzt die kombinierte Speicherfunktion aus Punkt 3/4 mit Titel und den seit dem letzten Speichern geänderten Zellen auf. Nach Erfolg: Baseline auf den neuen Stand setzen, alle Punkt-Indikatoren verschwinden. Screenshot-Bestätigung: Einträge setzen, speichern, Indikatoren weg, App neu starten, per „Laden" wiederfinden.

## 9. Echte SQLite-Anbindung

Tabelle `planeintraege` anlegen (Spalten passend zum Typ, `dienstplantagId` als Fremdschlüssel auf `dienstplantage.id`). Repository-Funktionen aus Punkt 3 auf echtes SQL umstellen, kombinierte Speicherfunktion in einer `better-sqlite3`-Transaktion (Titel-Update + je Zelle Delete-dann-Insert). DB-Verbindung als Parameter, nicht global importieren. Testdaten entfernen.

## 10. Repository-Tests gegen In-Memory-SQLite

Tests für `getPlaneintraegeFuerDienstplan` und die kombinierte Speicherfunktion gegen `new Database(':memory:')`: Neuanlage, Ersetzen einer bestehenden Zelle (alte Zeile weg, neue da), Entfernen (Zeile weg, kein Ersatz), gemeinsames Speichern von Titel- und Planeintrag-Änderungen in einem Aufruf, korrekte `arbeitszeitMinuten`-Berechnung bei mitarbeiterabhängigen Einträgen.

## 11. Gesamtverifikation und Dokumentation

`npm run typecheck`, `npm run lint`, `npm run test` ausführen und verbleibende Fehler beheben. App mit `npm run dev` starten: Dienstplan erstellen, mehrere Einträge setzen (darunter mindestens einen mitarbeiterabhängigen und einen festen), einen davon ändern, einen entfernen, speichern, App neu starten, per „Laden" den Stand bestätigen (Screenshot vorher/nachher). Zusätzlich den Warnhinweis-Flow mit offenen Planeintrag-Änderungen einmal durchspielen. Anschließend `docs/TODO.md` aktualisieren (diesen Schritt als abgeschlossen markieren) und einen Eintrag in `docs/entwicklungstagebuch.md` ergänzen (wichtigste Entscheidungen, Abweichungen vom Plan).
