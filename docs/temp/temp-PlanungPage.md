# Temp: Zurückgestellte Fragen zur Planungsansicht

Zweck: Zwischenablage für die laufende Planungsrunde zwischen Jeremy und Claude (Cowork) zur Planungsansicht. Sammelt Fragen, die bewusst zurückgestellt wurden. Kein Bestandteil der eigentlichen Projektdokumentation unter `docs/architektur/` oder `docs/ablaufplaene/` und nicht relevant für Claude-Code-Umsetzungs-Sessions — bitte nicht als Kontext für die Umsetzung heranziehen. Wird bei Bedarf aufgelöst (Inhalte wandern in einen echten Ablaufplan) oder gelöscht.

Die Abschnitte „Planeintrag – Setzen und Bearbeiten" und „Rufbereitschaft – Setzen" wurden geklärt und sind in [`ablaufplaene/schritt8-planeintrag-setzen.md`](../ablaufplaene/schritt8-planeintrag-setzen.md) bzw. [`ablaufplaene/schritt9-rufbereitschaft-setzen.md`](../ablaufplaene/schritt9-rufbereitschaft-setzen.md) aufgegangen, hier entfernt.

## Bemerkung

1. Direktes Texteingabefeld in der Zelle mit Speichern beim Verlassen des Felds (onBlur), oder eher ein Popover, weil die Spalte für längere Bemerkungen zu schmal sein könnte?
2. Gibt es eine sinnvolle Zeichenbegrenzung, oder ist das Feld frei?

## Cross-cutting

3. Soll Bemerkung im selben Bedienmuster funktionieren wie das für Planeintrag/Rufbereitschaft entschiedene Popover, oder eher ein einfaches Inline-Textfeld, da es sich um Freitext statt einer Auswahl handelt? Speichervorgang und Baseline/Entwurf-Tracking aus Schritt 8/9 sollten sich direkt wiederverwenden lassen.
