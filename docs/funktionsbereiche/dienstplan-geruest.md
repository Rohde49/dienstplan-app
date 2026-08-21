# Dienstplangerüst für einen Monat erstellen

Rein fachlicher Kontext zu diesem Funktionsbereich, losgelöst von der konkreten Umsetzung in diesem Projekt (Electron/React/SQLite) — als Grundlage für ein neues Projekt. Die technische Umsetzung hier im Repo steht in [`../architektur/datenmodell.md`](../architektur/datenmodell.md) und [`../erledigt.md`](../erledigt.md).

## Zweck

Für einen ausgewählten Monat ein leeres Dienstplan-Gerüst anlegen: einen Rahmen mit allen Kalendertagen des Monats, der anschließend mit Diensteinträgen befüllt wird (siehe [`eintraege-setzen.md`](./eintraege-setzen.md)).

## Datenfelder/Entitäten

Ein Dienstplan besteht aus:

- **Monat und Jahr** als getrennte Angaben (kein einzelnes Datum) — ein Dienstplan bezieht sich immer auf einen ganzen Kalendermonat.
- **Titel**.
- Erstellungs- und letzter Änderungszeitpunkt, für eine spätere Übersicht mehrerer Dienstpläne (Liste, Sortierung nach zuletzt bearbeitet) — fachlich nicht für die Planung selbst relevant.
- Mehrere Dienstpläne im selben Monat sind zulässig (kein Ausschluss von Duplikaten).

Jeder Dienstplan besteht aus einer Liste von **Kalendertagen**, je Tag:

- Datum.
- Ein optionales **Bemerkungsfeld** (kurzer Freitext, siehe [`eintraege-setzen.md`](./eintraege-setzen.md)).
- Wochentag-, Wochenend- und Feiertagsstatus werden **nicht** gespeichert, sondern immer aus dem Datum abgeleitet — keine Redundanz.

## Geschäftsregeln

- **Gesetzliche Feiertage** werden automatisch berechnet (in diesem Projekt: die zwölf gesetzlichen Feiertage nach dem Brandenburger Feiertagsgesetz, feste und vom Osterdatum abhängige Feiertage inklusive Ostersonntag und Pfingstsonntag). Ein Tag, der zugleich Sonntag und Feiertag ist, wird nur einmal gezählt. Gedenk-, Trauer- und religiöse Feiertage außerhalb der gesetzlichen Liste sowie benutzerdefinierte Feiertage gehören nicht zum Mindestumfang. Das konkrete Bundesland/die konkrete Feiertagsliste ist eine projektspezifische Festlegung, die für ein neues Projekt neu zu treffen ist; Gesetzesänderungen erfordern ohnehin eine spätere Aktualisierung.
- **Workflow „Erstellen/Speichern/Laden" statt Autosave**: Es muss jederzeit erkennbar sein, ob gerade ein gespeicherter Stand oder ein unfertiger Entwurf bearbeitet wird. Beim Verlassen eines Entwurfs mit ungespeicherten Änderungen wird gewarnt.
- Alle Tage eines neu erstellten Dienstplans entstehen zusammenhängend beim Erstellen (kein tageweises Nachlegen).

## Offene Punkte / bewusst zurückgestellt

Keine offenen fachlichen Punkte bekannt.

## Quelle

`docs/erledigt.md` (Schritte 6–7), `docs/tagebuch/2026-kw33.md`, `docs/architektur/datenmodell.md` (Abschnitte „Dienstplan", „Dienstplantag", „Fachliche Regeln").
