# Offene Mängel

Register der bekannten Mängel. Ein Mangel gehört hierher, sobald er benannt ist — nicht erst, wenn er behoben wird. Der Zweck ist, dass er nicht ausschließlich in einem Codekommentar existiert, wo ihn nur findet, wer ohnehin schon in der Datei liest.

Zwei Arten, unterschieden danach, ob ein Prüfsignal daran hängt:

## Als `it.fails` markiert

Diese Mängel schlagen fehl, **sobald sie behoben sind**, und erzwingen damit die Aktualisierung. Mechanik siehe [`testpraxis.md`](./testpraxis.md).

| Mangel                                        | Test                                                                                                              | Behoben durch |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------- |
| Der Druck verliert den letzten Tag des Monats | `legt alle Tage des Monats auf die Seite` in [`e2e/druckausgabe.e2e.test.ts`](../../e2e/druckausgabe.e2e.test.ts) | Schritt 17    |

**Zum Druckmangel:** Die Ausgabe liefert heute zwar eine einzelne A4-Seite mit allen Mitarbeiterspalten, aber der letzte Tag fehlt darauf — die Ansicht aus Schritt 16 ist ein Scrollcontainer, gedruckt wird nur der sichtbare Ausschnitt. Genau die Zusage, die Schritt 17 über die feste A4-Fläche mit Live-Skalierung einlösen soll. Nach Abschluss von Schritt 17 ist `.fails` zu entfernen und dieser Eintrag zu streichen.

## Ohne Prüfsignal festgehalten

Diese Mängel meldet niemand automatisch. Sie stehen hier, weil sie beim Doku-Umbau am 16.08.2026 beim Abgleich der Dokumentation gegen den Code aufgefallen sind.

| Mangel                                                                                  | Wo                                      | Bewertung                                                     |
| --------------------------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------- |
| Der Main-Prozess validiert keine einzige Eingabe                                        | alle Module unter `src/main/ipc/`       | vertretbar, aber nicht entschieden — siehe unten              |
| `Rufbereitschaft` nur für Erzieher ist reine UI-Filterung                               | `RufbereitschaftAuswahl`                | Sonderfall des Punkts darüber, im Datenmodell anders zugesagt |
| `npm ci` scheitert ohne Python und Build-Tools                                          | `package.json`, `better-sqlite3`        | betrifft den geplanten CI-Schritt — siehe unten               |
| Toter Scaffold-Code: `electron.svg`, `wavy-lines.svg`, `ping`-Kanal, `runDbSmokeTest()` | `src/renderer/src/assets/`, `src/main/` | folgenlos, aber irreführend                                   |

**Zu `npm ci`:** npm startet für `better-sqlite3` einen `node-gyp`-Build, weil eine `binding.gyp` im Paket liegt — obwohl das Paket keinen eigenen `install`-Schritt deklariert. Ohne Python bricht das ab. Nötig ist der Build nicht: Die N-API-Prebuilds liegen im Paket, `npm ci --ignore-scripts` gefolgt von `node node_modules/electron/install.js` erzeugt am 17.08.2026 nachweislich einen vollständig lauffähigen Stand (alle Tests und E2E grün). Die Entscheidung — Build-Tools voraussetzen oder den Build unterdrücken — gehört in den CI-Schritt, wo sich zeigt, was der Runner tatsächlich braucht. Bis dahin ist der Punkt hier festgehalten, damit er nicht erst dort auffällt.

**Zu `runDbSmokeTest()`:** Die Funktion schreibt bei **jedem** App-Start eine Zeile in eine Tabelle `smoke_test`, die niemand liest und die nie beschnitten wird. Sie überlebte die Bereinigung vom 17.08.2026, weil toter Scaffold-Code ausdrücklich außerhalb des Auftrags lag.

**Zur fehlenden Validierung im Main-Prozess:** Sämtliche Prüfungen (`validateTeamMember`, `validateEintragsdefinition`, `validateBemerkung`) liegen im Renderer; die IPC-Handler reichen ihre Argumente ungeprüft an das Repository durch. Für ein lokales Einzelnutzer-Programm ohne Netzwerkschnittstelle ist das vertretbar — die UI ist die einzige Eingabequelle. Es widerspricht aber dem, was [`architektur/datenmodell.md`](../architektur/datenmodell.md) für `Rufbereitschaft` ausdrücklich zusagt („muss auch bei der Verarbeitung im Main-Prozess geprüft werden"). Zu entscheiden ist deshalb eines von beidem: die Prüfung nachziehen oder die Zusage streichen. Die Doku benennt bis dahin den Ist-Zustand.

## Wann ein Eintrag verschwindet

Ein Eintrag wird gestrichen, wenn der Mangel behoben **und** das Prüfsignal angepasst ist — bei `it.fails` also nach dem Entfernen der Markierung, nicht davor. Ein Eintrag, der nicht mehr zutrifft, aber stehen bleibt, ist schädlicher als gar keiner: Er lässt das Register unglaubwürdig wirken und damit auch die Einträge, die noch gelten.
