# Doku-Pflege

Welche Code-Änderung welche Doku-Aktualisierung nach sich zieht, und was in welchen Ordner gehört. Grundlage für die Skill `/doku-pflege`, die diesen Ablauf abarbeitet.

**Warum es diese Datei gibt:** Die Aktualität der Dokumentation hing bisher allein an manuellen „Dokumentationsdurchgängen". Nötig waren sie laut Tagebuch dreimal, und jedes Mal fanden sich Abweichungen — `projektstruktur.md` war zweimal veraltet, ohne dass es jemandem aufgefallen wäre. Disziplin ist hier kein Mechanismus.

## Ablageregeln — was gehört wohin

| Bereich                               | Gehört hinein                                                       | Gehört **nicht** hinein                                  |
| ------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| [`../architektur/`](../architektur)   | Entwurfsentscheidungen mit Begründung, Entitäten, Prozessregeln     | Farbwerte, Testkonventionen, Verlauf                     |
| [`../style/`](../style)               | Tokens, Skalen, Zustände, Barrierefreiheit                          | Fachliche Regeln, Datenstrukturen                        |
| [`../test/`](../test)                 | Testebenen, Konventionen, bekannte Mängel                           | Fachlogik selbst                                         |
| [`../workflow/`](../workflow)         | Arbeiten mit Claude Code, Setup, diese Regeln                       | Alles Fachliche                                          |
| [`../ablaufplaene/`](../ablaufplaene) | Ein Plan je Schritt, vor der Umsetzung geschrieben                  | Ergebnisse — die stehen in `erledigt.md` und im Tagebuch |
| [`../tagebuch/`](../tagebuch)         | Der Verlauf: Entscheidungen, Verworfenes, Fehlschläge, Reihenfolgen | Der aktuelle Stand einer Sache                           |
| [`../TODO.md`](../TODO.md)            | Ausschließlich Offenes                                              | Erledigtes — das wandert nach `erledigt.md`              |
| `../temp/`                            | Zwischenablagen der laufenden Arbeit (gitignoriert)                 | Alles, was jemand später wiederfinden soll               |

**Die häufigste Fehlentscheidung ist Sachdatei statt Tagebuch.** Eine Sachdatei beschreibt den **Zustand** und wird korrigiert, wenn er sich ändert. Das Tagebuch beschreibt den **Weg** und wird nie rückwirkend korrigiert.

Faustregel: Enthält ein Satz „inzwischen", „ursprünglich", „bis dahin" oder „zunächst", gehört er ins Tagebuch. Steht er trotzdem in einer Sachdatei, ist er dort meist der Grund, warum sie schwer zu lesen ist.

## Welche Code-Änderung zieht welche Doku nach sich

| Geändert                                          | Nachziehen                                                                                                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/shared/types.ts` (Entität, Feld)             | [`architektur/datenmodell.md`](../architektur/datenmodell.md)                                                                                                      |
| Neuer Ordner unter `src/` oder neue Kategorie     | [`architektur/projektstruktur.md`](../architektur/projektstruktur.md), ggf. `CLAUDE.md`                                                                            |
| `src/shared/ipcKanaele.ts`, Preload, Handler      | [`architektur/prozessgrenzen.md`](../architektur/prozessgrenzen.md)                                                                                                |
| `src/shared/auswertung.ts`, Kennzahlenlogik       | [`architektur/auswertung.md`](../architektur/auswertung.md)                                                                                                        |
| `src/renderer/src/assets/base.css` (Token)        | [`style/design-system.md`](../style/design-system.md), bei Farben zusätzlich [`style/barrierefreiheit.md`](../style/barrierefreiheit.md) — **Kontrast neu messen** |
| Neue UI-Primitive unter `components/ui/`          | [`style/design-system.md`](../style/design-system.md), Komponenten-Inventar                                                                                        |
| Neue Testebene, `vitest.config.ts`                | [`test/teststrategie.md`](../test/teststrategie.md)                                                                                                                |
| Neue Testhilfe unter `src/test/`, neue Konvention | [`test/testpraxis.md`](../test/testpraxis.md)                                                                                                                      |
| `it.fails` gesetzt **oder entfernt**              | [`test/offene-maengel.md`](../test/offene-maengel.md)                                                                                                              |
| Datei umbenannt oder verschoben                   | Alle Verweise darauf — Linkcheck laufen lassen, auch Codekommentare prüfen                                                                                         |
| Schritt abgeschlossen                             | `TODO.md` → `erledigt.md`, Tagebucheintrag, Ablaufplan nach `ablaufplaene/erledigt/`                                                                               |
| Neues npm-Skript                                  | `CLAUDE.md`, Abschnitt „Befehle"                                                                                                                                   |

## Wenn etwas unsicher ist

Nicht glätten, sondern markieren:

```markdown
> ⚠️ Zu prüfen: <Was unklar ist und was zu entscheiden wäre.>
```

Eine Doku, die eine offene Frage als geklärt darstellt, ist schlechter als eine, die die Frage offen benennt. Wer die Markierung setzt, schreibt trotzdem den korrigierten Ist-Zustand daneben — die Markierung ersetzt die Korrektur nicht, sie ergänzt sie.

Widerspricht der Code einer dokumentierten Zusage, ist das kein Doku-Fehler, sondern ein Befund. Er gehört nach [`test/offene-maengel.md`](../test/offene-maengel.md), damit die Entscheidung — Code anpassen oder Zusage streichen — nicht verloren geht.

## Pflegeablauf

Das arbeitet `/doku-pflege` ab:

1. **Umfang bestimmen.** Commits seit der letzten Änderung an `docs/` ermitteln (`git log --oneline -1 -- docs/`, dann `git diff --stat <hash>..HEAD -- src/ e2e/ *.ts`).
2. **Betroffene Bereiche ableiten** über die Tabelle oben.
3. **Jede betroffene Datei gegen den Code prüfen** — nicht gegen die Erinnerung und nicht gegen andere Doku. Bei Dateilisten und Funktionsnamen die Quelle öffnen.
4. **Korrigieren**, Unsicheres zusätzlich markieren, Befunde registrieren.
5. **Verlauf ins Tagebuch**, aktueller Stand in die Sachdatei — nie beides am selben Ort.
6. **`TODO.md` nachziehen**, Erledigtes nach `erledigt.md` überführen.
7. **Linkcheck** über alle `.md` sowie `grep -rn "docs/" src/ e2e/ *.ts`.
8. **Änderungen zusammengefasst vorlegen**, nicht stillschweigend committen.

## Der Stop-Hook

`.claude/settings.json` enthält einen Stop-Hook, der beim Sitzungsende prüft, ob `src/` geändert wurde und `docs/` nicht. Trifft das zu, erscheint ein Hinweis auf `/doku-pflege`.

**Er blockiert nie.** Ein Hook, der das Beenden verhindert, wird nach dem dritten Mal umgangen; ein Hinweis, der nur erscheint, wenn er zutrifft, wird gelesen. Nicht jede Code-Änderung braucht eine Doku-Änderung — die Entscheidung bleibt beim Menschen, der Hook stellt nur sicher, dass sie bewusst getroffen wird.
