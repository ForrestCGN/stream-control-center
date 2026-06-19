# Project State – LWG Giveaway Exclusions 1 bestätigt

Datum: 2026-06-19

## Stand

`LWG_GIVEAWAY_EXCLUSIONS_1` wurde live getestet und fachlich bestätigt.

Vorheriger bestätigter Stand:

```text
LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Fix

`LWG_GIVEAWAY_EXCLUSIONS_1` ergänzt eine dateibasierte Gewinn-Sperrliste:

```text
config/loyalty_giveaway_exclusions.json
```

Regel:

```text
User bleiben als Entry sichtbar, sind beim Draw aber nicht eligible und können dadurch nicht gewinnen.
```

## Modulstand

```text
loyalty_giveaways: 0.1.14 / LWG_GIVEAWAY_EXCLUSIONS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Live-Status bestätigt

```text
giveawayExclusions.enabled=True
giveawayExclusions.count=10
lastError=leer
```

## Test bestätigt

Frisches Test-Giveaway:

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Entries: una_solala, udowb, engelcgn
```

Draw:

```text
Winner=udowb
eligibleEntriesCount=2
rawEntriesCount=3
excludedEntriesCount=1
excluded[0].userLogin=una_solala
excluded[0].reason=login
```

Claim/Wheel:

```text
Permission=wheelperm_1781865357312_f86f36711269e3e3
Spin=spin_1781865515072_d11827bafa8cd593
Prize=Roadside Research
Winner status=wheel_completed
Field Roadside Research quantityRemaining=0
```

## Wichtig für nächste Chats

Die Exclusion-Funktion ist fachlich bestätigt. Nicht erneut als ungetestet behandeln.

Der nächste sinnvolle technische Step ist nicht die Grundfunktion, sondern Robustheit:

```text
LWG_GIVEAWAY_EXCLUSIONS_1B
```

Ziel:

- Loader gegen Exportformat/Configformat/BOM/null-Einträge absichern.
- Statusdiagnose für Exclusions erweitern.
- Danach Dashboard-/DB-Verwaltung planen.

## Später

- Dashboard-Editor.
- DB-basierte Exclusions.
- Twitch-User-ID als Primärschlüssel.
- Pro-Giveaway zusätzliche Sperren.
