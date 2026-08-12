# Temp: Zurückgestellte Fragen zur Planungsansicht

Zweck: Zwischenablage für die laufende Planungsrunde zwischen Jeremy und Claude (Cowork) zur Planungsansicht. Sammelt Fragen, die bewusst zurückgestellt wurden. Kein Bestandteil der eigentlichen Projektdokumentation unter `docs/architektur/` oder `docs/ablaufplaene/` und nicht relevant für Claude-Code-Umsetzungs-Sessions — bitte nicht als Kontext für die Umsetzung heranziehen. Wird bei Bedarf aufgelöst (Inhalte wandern in einen echten Ablaufplan) oder gelöscht.

Der Abschnitt „Planeintrag – Setzen und Bearbeiten" wurde geklärt und ist jetzt in [`ablaufplaene/schritt8-planeintrag-setzen.md`](../ablaufplaene/schritt8-planeintrag-setzen.md) aufgegangen, hier entfernt.

## Rufbereitschaft – Setzen

1. Das Dropdown zeigt nur Mitarbeitende mit `rolle: 'Erzieher'`. Braucht es zusätzlich eine explizite „Keine Rufbereitschaft"-Option zum Zurücksetzen, oder reicht ein leerer Zustand?
2. Bearbeiten/Zurücksetzen einer bereits gesetzten Rufbereitschaft gleich mit dabei, oder ebenfalls erstmal nur Setzen?

## Bemerkung

3. Direktes Texteingabefeld in der Zelle mit Speichern beim Verlassen des Felds (onBlur), oder eher ein Popover, weil die Spalte für längere Bemerkungen zu schmal sein könnte?
4. Gibt es eine sinnvolle Zeichenbegrenzung, oder ist das Feld frei?

## Cross-cutting

5. Sollen Rufbereitschaft und Bemerkung im selben Bedienmuster funktionieren wie das für Planeintrag entschiedene Popover, oder je nach Feldtyp unterschiedlich? Speichervorgang und Baseline/Entwurf-Tracking aus Schritt 8 sollten sich vermutlich direkt wiederverwenden lassen.
