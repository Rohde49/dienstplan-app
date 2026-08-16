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

| Mangel                                                                                    | Wo                                    | Bewertung                                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| Der Main-Prozess validiert keine einzige Eingabe                                          | alle Module unter `src/main/ipc/`     | vertretbar, aber nicht entschieden — siehe unten              |
| `Rufbereitschaft` nur für Erzieher ist reine UI-Filterung                                 | `RufbereitschaftAuswahl`              | Sonderfall des Punkts darüber, im Datenmodell anders zugesagt |
| `electron-builder.yml` steht unverändert auf Template-Stand                               | `electron-builder.yml`                | fällt beim Packaging auf, das noch offen ist                  |
| Toter Scaffold-Code: `Versions.tsx`, `electron.svg`, `wavy-lines.svg`, `runDbSmokeTest()` | `src/renderer/src/`, `src/main/db.ts` | folgenlos, aber irreführend                                   |

**Zur fehlenden Validierung im Main-Prozess:** Sämtliche Prüfungen (`validateTeamMember`, `validateEintragsdefinition`, `validateBemerkung`) liegen im Renderer; die IPC-Handler reichen ihre Argumente ungeprüft an das Repository durch. Für ein lokales Einzelnutzer-Programm ohne Netzwerkschnittstelle ist das vertretbar — die UI ist die einzige Eingabequelle. Es widerspricht aber dem, was [`architektur/datenmodell.md`](../architektur/datenmodell.md) für `Rufbereitschaft` ausdrücklich zusagt („muss auch bei der Verarbeitung im Main-Prozess geprüft werden"). Zu entscheiden ist deshalb eines von beidem: die Prüfung nachziehen oder die Zusage streichen. Die Doku benennt bis dahin den Ist-Zustand.

## Wann ein Eintrag verschwindet

Ein Eintrag wird gestrichen, wenn der Mangel behoben **und** das Prüfsignal angepasst ist — bei `it.fails` also nach dem Entfernen der Markierung, nicht davor. Ein Eintrag, der nicht mehr zutrifft, aber stehen bleibt, ist schädlicher als gar keiner: Er lässt das Register unglaubwürdig wirken und damit auch die Einträge, die noch gelten.
