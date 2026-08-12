# Temp: Zurückgestellte Fragen zur Planungsansicht

Zweck: Zwischenablage für die laufende Planungsrunde zwischen Jeremy und Claude (Cowork) zur Planungsansicht. Sammelt Fragen, die bewusst zurückgestellt wurden, um sich zuerst auf den Ablaufplan „Dienstplan/Dienstplantag – Anlegen & Speichern" zu konzentrieren. Kein Bestandteil der eigentlichen Projektdokumentation unter `docs/architektur/` oder `docs/ablaufplaene/` und nicht relevant für Claude-Code-Umsetzungs-Sessions — bitte nicht als Kontext für die Umsetzung heranziehen. Wird bei Bedarf aufgelöst (Inhalte wandern in einen echten Ablaufplan) oder gelöscht.

## Planeintrag – Setzen und Bearbeiten

1. Wie sieht die Interaktion beim Setzen aus: Klick auf die Eintrag-Zelle öffnet ein Dropdown mit den `Eintragsdefinition`-Optionen direkt inline, oder eher ein Popover/kleiner Dialog mit mehr Platz?
2. Da `kuerzel` nicht eindeutig ist (z. B. zwei „SN/F"-Varianten mit unterschiedlichen Zeiten), muss die Auswahl mehr als das Kürzel zeigen. Reicht „Kürzel – Name (Beginn–Ende)" als Anzeige, oder eine bessere Darstellung?
3. Werden Beginn/Ende beim Setzen automatisch aus der gewählten `Eintragsdefinition` übernommen und danach in der Zelle noch überschreibbar, oder bleiben sie fest wie in der Definition hinterlegt?
4. Bei mitarbeiterabhängigen Einträgen (Urlaub, Krankheit): `arbeitszeitMinuten` wird laut Datenmodell beim Setzen aus `TeamMember.wochenarbeitszeitMinuten / 5` berechnet. Gehört diese eine Formel zum Setzen-Schritt oder zur später ausgelagerten Kennzahlen-Logik?
5. Ist Bearbeiten und Löschen eines bereits gesetzten Planeintrags gleich mit dabei, oder für den ersten Anlauf nur das Setzen auf eine leere Zelle?
6. Für über Mitternacht laufende Dienste: reicht stures zweimaliges normales Setzen (an Tag 1 und Tag 2 unabhängig), oder soll die UI das erkennbar verknüpfen?

## Rufbereitschaft – Setzen

7. Das Dropdown zeigt nur Mitarbeitende mit `rolle: 'Erzieher'`. Braucht es zusätzlich eine explizite „Keine Rufbereitschaft"-Option zum Zurücksetzen, oder reicht ein leerer Zustand?
8. Bearbeiten/Zurücksetzen einer bereits gesetzten Rufbereitschaft gleich mit dabei, oder ebenfalls erstmal nur Setzen?

## Bemerkung

9. Direktes Texteingabefeld in der Zelle mit Speichern beim Verlassen des Felds (onBlur), oder eher ein Popover, weil die Spalte für längere Bemerkungen zu schmal sein könnte?
10. Gibt es eine sinnvolle Zeichenbegrenzung, oder ist das Feld frei?

## Cross-cutting

11. Sollen Planeintrag, Rufbereitschaft und Bemerkung im selben Bedienmuster funktionieren (z. B. alle per Klick-öffnet-Popover), oder je nach Feldtyp unterschiedlich? Betrifft die Konsistenz der Interaktion über alle drei Spalten hinweg.
