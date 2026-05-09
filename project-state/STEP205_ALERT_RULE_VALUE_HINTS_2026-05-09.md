# STEP205 – Alert Rule Value Hints

Stand: 2026-05-09

## Änderung

Der Alert-Regel-Editor zeigt für `min_value`/`max_value` jetzt typabhängige Labels, Placeholder und Hilfetexte.

Betroffene Datei:

- `htdocs/dashboard/modules/alerts.js`

## Warum

Forrest hat gemeldet, dass bei neuen Regeln nach dem Wechsel von Bits zu Raid/Sub/Gift/Sub-Bombe weiterhin nur `Min-Wert`/`Max-Wert` sichtbar war. Für Nutzer war dadurch nicht klar, ob Bits, Zuschauer, Sub-Anzahl, Betrag usw. gemeint sind.

## Umsetzung

Neue UI-Hilfsfunktionen:

- `ruleValueDescriptor(source, typeKey)`
- `updateRuleValueHelpUi()`

Das Modal aktualisiert Labels und Hinweistext bei:

- Wechsel der Quelle
- Wechsel des Typs

## Test

- `node -c htdocs/dashboard/modules/alerts.js`

## Offen

Spätere fachliche Regelfelder für Tier, Resub-Monate, HypeTrain-Level und TTS pro Text-Event sind damit noch nicht umgesetzt. Diese Änderung ist reine UX/Editor-Hilfe.
