---
name: doku-pflege
description: This skill should be used when the user asks to "doku pflegen", "Doku aktualisieren", "Dokumentationsdurchgang", "docs gegen den Code prüfen", "Doku nachziehen", or invokes /doku-pflege. It reconciles the documentation under docs/ with the actual state of the code after a batch of commits, and writes the corrections.
disable-model-invocation: true
---

# Doku-Pflege

Gleicht die Dokumentation unter `docs/` mit dem tatsächlichen Code-Stand ab und zieht die Abweichungen nach. Ersetzt den manuellen „Dokumentationsdurchgang", der in diesem Projekt bereits dreimal nötig war und jedes Mal Abweichungen zutage förderte.

Die verbindlichen Ablageregeln und die Zuordnung „Code-Änderung → betroffene Doku" stehen in [`docs/workflow/doku-pflege.md`](../../../docs/workflow/doku-pflege.md). Diese Datei beschreibt nur den Ablauf. **Zuerst die Regeldatei lesen**, dann diesen Ablauf abarbeiten — die Regeln hier nicht duplizieren, sonst entsteht eine zweite Fassung, die veraltet.

Kommunikation auf Deutsch, nicht gendern.

## 1. Umfang bestimmen

Ermitteln, was seit der letzten Doku-Änderung am Code passiert ist:

```bash
git log --oneline -1 -- docs/
```

Mit dem gefundenen Hash den Code-Diff seitdem holen:

```bash
git diff --stat <hash>..HEAD -- src/ e2e/ *.ts *.json
```

Zusätzlich nicht committete Änderungen berücksichtigen (`git status --short`). Ist der Bereich leer, das melden und abbrechen statt vorsorglich alles zu prüfen.

## 2. Betroffene Bereiche ableiten

Die geänderten Dateien über die Tabelle „Welche Code-Änderung zieht welche Doku nach sich" aus der Regeldatei auf Doku-Dateien abbilden. Nur diese Dateien prüfen — ein vollständiger Durchgang über alle Dokumente ist teuer und findet erfahrungsgemäß nichts, was der gezielte Abgleich nicht auch findet.

Ausnahme: Wurde eine Datei umbenannt oder verschoben, immer den vollständigen Linkcheck aus Schritt 6 laufen lassen.

## 3. Jede betroffene Datei gegen den Code prüfen

**Gegen die Quelle prüfen, nicht gegen die Erinnerung und nicht gegen andere Doku.** Das ist der Kern dieser Skill; alle bisher gefundenen Abweichungen entstanden dadurch, dass eine Beschreibung plausibel klang und niemand nachgesehen hat.

Konkret heißt das:

- Bei **Dateilisten und Ordnerangaben**: `git ls-files` statt Annahme.
- Bei **Funktions- und Konstantennamen**: die Quelldatei öffnen und den Export ablesen.
- Bei **Zahlen** (Testanzahl, Anzahl IPC-Kanäle, Kontrastwerte): den erzeugenden Befehl ausführen, nicht die alte Zahl fortschreiben.
- Bei **Zusagen** („wird auch im Main-Prozess geprüft"): nachsehen, ob es stimmt.

Typische Fundklasse in diesem Projekt: Eine Datei beschreibt den Stand „nach Schritt N" und ist bei Schritt N+4 angekommen, ohne dass jemand die Überschrift bemerkt hat.

## 4. Korrigieren

- **Veraltet, Korrektur bekannt** → korrigieren.
- **Veraltet, Korrektur unklar** → korrigieren **und** zusätzlich `> ⚠️ Zu prüfen: …` setzen. Die Markierung ersetzt die Korrektur nicht.
- **Code widerspricht einer dokumentierten Zusage** → das ist ein Befund, kein Doku-Fehler. In [`docs/test/offene-maengel.md`](../../../docs/test/offene-maengel.md) registrieren, damit die Entscheidung nicht verloren geht.
- **Redundant zu einer anderen Datei** → an einem Ort belassen, an der anderen Stelle verlinken.
- **Nur noch historisch** → ins Tagebuch, aus der Sachdatei entfernen.

Prosa in Tabellen überführen, wo die Tabelle trägt. Nicht dort, wo eine Begründung mehrere Sätze braucht.

## 5. Verlauf und Stand trennen

Den aktuellen Stand in die Sachdatei, den Verlauf ins Tagebuch — **nie beides am selben Ort**.

Der Tagebucheintrag gehört in die Datei der laufenden ISO-Kalenderwoche unter `docs/tagebuch/` (Schema `JJJJ-kwNN.md`). Existiert sie noch nicht, neu anlegen und den Wochenindex in `docs/tagebuch/README.md` ergänzen. Bestehende Einträge **nicht** rückwirkend korrigieren.

Danach `docs/TODO.md` nachziehen: Erledigtes nach `docs/erledigt.md` überführen, abgeschlossene Ablaufpläne per `git mv` nach `docs/ablaufplaene/erledigt/` verschieben und dort die Kopfzeile mit Abschlussdatum und Commit ergänzen.

## 6. Prüfen

```bash
npx prettier --write "docs/**/*.md"
```

Alle relativen Links in `.md`-Dateien auflösen und bestätigen, dass die Ziele existieren — inklusive der Beschriftungen, wenn diese selbst ein Pfad sind. Dann die Doku-Pfade im Code:

```bash
grep -rn "docs/" src/ e2e/ *.ts
```

Wurden Dateien verschoben, zusätzlich `git log --follow` auf einer davon, um zu bestätigen, dass die Historie erhalten ist (`git mv` statt Löschen und Neuanlegen).

Wurde Code angefasst: `npm run test`, `npm run lint`, `npm run typecheck`.

## 7. Vorlegen, nicht committen

Die Änderungen zusammengefasst darstellen: was gefunden wurde, was korrigiert wurde, was als `> ⚠️ Zu prüfen:` offen bleibt. **Nicht ungefragt committen und niemals pushen** — der Nutzer entscheidet über beides.

Wurde nichts gefunden, ist das ein gültiges Ergebnis und wird so gemeldet. Keine kosmetischen Umformulierungen erfinden, um Aktivität zu zeigen.
