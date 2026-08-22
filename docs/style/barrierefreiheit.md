# Barrierefreiheit

Ziel ist **WCAG 2.1 AA**. Diese Datei ist Teil des Design-Systems, kein nachgelagerter Prüfschritt — die Anforderungen unten gelten für jede neue UI, nicht erst für eine Abnahme. Tokens, Skalen und Komponenten stehen in [`design-system.md`](./design-system.md).

Herausgelöst aus dem Design-System, weil die Prüfung sonst zwischen Farbwerten und Abstandsskalen verschwindet. Sie hat den schwerwiegendsten Einzelbefund des gesamten Projekts geliefert (siehe unten), und der war durch Codelesen allein nicht vorhersehbar.

## Verbindliche Mindestanforderungen

| Anforderung                                                                                                                                                   | Warum                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **Jedes Klickziel ist ein echtes Bedienelement.** Kein `onClick` auf `<td>`, `<tr>` oder `<div>`.                                                             | Nur echte Bedienelemente sind fokussierbar und per Tastatur auslösbar (WCAG 2.1.1, Level A) |
| **Kontrast messen, nicht schätzen** — 4,5:1 für Text, 3:1 für Fokusringe und Feldbegrenzungen                                                                 | Schätzungen lagen in diesem Projekt mehrfach daneben                                        |
| **Farbe ist nie das einzige Merkmal.** Mitarbeiterfarben tragen immer den Namen daneben.                                                                      | WCAG 1.4.1                                                                                  |
| **Gleichnamige Schaltflächen brauchen Kontext** über `aria-label` (`"Anna Berg bearbeiten"` statt dreimal `"Bearbeiten"`)                                     | Ohne Zeilenbezug ist die Liste per Screenreader nicht bedienbar                             |
| **Fehlermeldungen** stehen in einem `role="alert"`-Container und sind über `aria-describedby` mit den Feldern verknüpft, die zusätzlich `aria-invalid` tragen | Sonst bleibt der Fehler für Screenreader stumm                                              |
| **Tabellenköpfe** setzen `scope` (`col`, `row`, oder `colgroup` bei den dreispaltigen Mitarbeitergruppen im Raster)                                           | Ohne `scope` ist die Zuordnung Zelle → Kopf im Raster nicht ermittelbar                     |
| **Überschriften** über `CardTitle as="h1                                                                                                                      | h2                                                                                          | h3"`statt optisch großer`div`s | Das Dokument hatte zuvor keine einzige echte Überschrift |
| Sprache und Titel des Dokuments stehen in `src/renderer/index.html` (`lang="de"`)                                                                             | Beides stand unverändert auf Template-Stand („Electron", kein `lang`)                       |

Die Komponententests auf Ebene 3 bedienen die Oberfläche ausschließlich über zugängliche Rollen und Beschriftungen. Das ist kein Stil, sondern der Grund, warum diese Anforderungen nicht nur auf dem Papier stehen: **Ein Feld, das der Screenreader nicht findet, findet der Test auch nicht.** Siehe [`test/teststrategie.md`](../test/teststrategie.md), Ebene 3.

## Der schwerwiegendste Befund

Die Popover-Auswahl im Plan ließ sich per Tastatur zwar öffnen — der Kürzel-Trigger ist ein echter `<button>` —, aber `EintragsdefinitionAuswahl` und `RufbereitschaftAuswahl` bauten ihre Zeilen als `<tr onClick>`. **Kein Eintrag darin war auswählbar.** Planeinträge und Rufbereitschaften zu setzen war ohne Maus unmöglich, also die Kernfunktion der App (WCAG 2.1.1, Level A). Beide Listen wurden auf echte `<button>`-Zeilen umgebaut.

Daraus folgt die erste Regel oben — sie ist keine Stilvorgabe, sondern die Lehre aus einem realen Totalausfall.

## Gemessene Kontrastwerte

> **⚠️ Nicht mehr aktuell.** Die Tabelle unten stammt aus der Mint-Palette vor der Umstellung auf Blau als Primärfarbe und neue Statusfarben (Info/Erfolg/Warnung, erweiterte Fehlerdarstellung). Die Werte sind für die aktuelle Palette **nicht neu gemessen** worden — bewusst, um keine geschätzten Zahlen als gemessen auszugeben. Vor einer Verwendung als Beleg muss die Messung wie unten beschrieben wiederholt werden.

Gemessen im laufenden Renderer über Canvas-Pixelauslesung, nicht geschätzt und nicht aus `getComputedStyle` gelesen: Dort kommen die `oklch`-Werte unkonvertiert zurück und lassen sich nicht direkt in die WCAG-Formel einsetzen.

| Paarung                                        | Gemessen   | Schwelle | Bestanden      |
| ---------------------------------------------- | ---------- | -------- | -------------- |
| `--foreground` auf `--background`              | 17,4:1     | 4,5:1    | ja             |
| `--card-foreground` auf `--card`               | 19,1:1     | 4,5:1    | ja             |
| `--primary` als Text auf `--card`              | 4,84:1     | 4,5:1    | ja             |
| `--primary-foreground` auf `--primary`         | 4,71:1     | 4,5:1    | ja             |
| `--muted-foreground` auf `--card`              | 6,85:1     | 4,5:1    | ja             |
| `--muted-foreground` auf `--muted`             | 6,0:1      | 4,5:1    | ja             |
| `--accent-foreground` auf `--accent`           | 11,9:1     | 4,5:1    | ja             |
| `--destructive` als Text auf `--card`          | 4,77:1     | 4,5:1    | ja             |
| `--destructive-foreground` auf `--destructive` | 4,77:1     | 4,5:1    | ja             |
| `--ring` auf `--background` (Fokusindikator)   | 3,19:1     | 3:1      | ja             |
| `--input` auf `--card` (Feldbegrenzung)        | 3,61:1     | 3:1      | ja             |
| Mitarbeiterfarben, dunkle Schrift auf Tönung   | 7,8–11,0:1 | 4,5:1    | ja (alle zehn) |

### Was vorher durchfiel

Vier echte Verstöße, alle dort, wo Mint selbst tragend wurde — nicht im Fließtext:

| Stelle                              | Vorher | Schwelle |
| ----------------------------------- | ------ | -------- |
| Button-Beschriftung auf `--primary` | 4,01:1 | 4,5:1    |
| `--primary` als Text                | 4,12:1 | 4,5:1    |
| Fokusring                           | 2,19:1 | 3:1      |
| Feldbegrenzung                      | 1,34:1 | 3:1      |

### Die Mitarbeiterfarben waren der größte Einzelfall

Die Kopfzeile setzte `text-white` auf `member.farbe`. Von den zehn Farben bestand nur Indigo (4,86:1) den AA-Test, Orange lag bei 2,23:1 — in neun von zehn Fällen war dunkle Schrift deutlich besser.

Gelöst über `mitarbeiterSpaltenStil()`: **Vollton-Oberkante plus 16-%-Tönung mit dunkler Schrift.** Alle zehn liegen jetzt zwischen 7,8:1 und 11,0:1. Nebeneffekt: Die hellen Tönungen drucken auf A4 zuverlässiger als Volltonflächen.

## Ein Befund, der nur dieses Projekt betrifft

In Inter ist die „1" 5,70 px und die „4" 9,05 px breit. In einer App, die fast nur aus Uhrzeiten und Dauern besteht, fluchten Zeitspalten dadurch nie. `tabular-nums` ist in Inter Variable vorhanden, war aber nirgends aktiviert — eine Zeile in `base.css`, seitdem sind alle Ziffern 9,08 px breit.

Streng genommen kein WCAG-Kriterium, aber dieselbe Kategorie: eine Lesbarkeitshürde, die niemand bemerkt, der sie nicht sucht.

## Bekannte Abweichungen

- **Farbfelder sind 28 × 28 px.** Unter der 44-px-Empfehlung aus WCAG 2.5.5 (Level AAA); die AA-Schwelle von 24 px aus WCAG 2.2 ist erfüllt.
- **Kein Dark Mode.** Nicht gefordert; alle Messwerte oben gelten nur für das helle Schema.

## Was bei der Prüfung falsch war und korrigiert wurde

Im Audit stand zunächst, `Button` habe _keinen_ Fokusring. Tatsächlich setzt `button.tsx` weder `focus-visible:` noch `outline-none`, wodurch Chromes Standardring greift — der Fokus blieb also sichtbar. Es war eine Systemlücke (optische Abweichung von allen anderen Komponenten), kein WCAG-Verstoß, und wurde entsprechend heruntergestuft, bevor daraus eine falsche Begründung in der Doku geworden wäre.
