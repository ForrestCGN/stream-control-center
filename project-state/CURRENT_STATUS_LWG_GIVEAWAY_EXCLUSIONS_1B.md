# Project State – LWG Giveaway Exclusions 1B

Datum: 2026-06-19

## Stand

`LWG_GIVEAWAY_EXCLUSIONS_1` ist fachlich bestätigt. Der frische Test zeigte, dass `una_solala` als Entry sichtbar blieb, aber beim Draw ausgeschlossen wurde. `udowb` gewann, konnte das Rad drehen und erhielt `Roadside Research`.

## Neuer Sicherheits-Fix

`LWG_GIVEAWAY_EXCLUSIONS_1B` macht den Exclusion-Config-Loader robuster.

## Modulstand

```text
loyalty_giveaways: 0.1.15 / LWG_GIVEAWAY_EXCLUSIONS_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Geändert

- Exportformat mit `ok: true` wird akzeptiert.
- Configformat mit `enabled: true` wird akzeptiert.
- `items[]`, `users[]` und `exclusions[]` werden akzeptiert.
- UTF-8-BOM wird entfernt.
- Null-/kaputte Einträge werden ignoriert.
- Statusdiagnose wurde erweitert.

## Nicht geändert

- Draw-Eligibility-Regel bleibt wie bestätigt.
- Wheel-Claim bleibt wie bestätigt.
- Bound-Wheel-Feldverbrauch bleibt wie bestätigt.

## Nach Deploy prüfen

```text
moduleVersion=0.1.15
moduleBuild=LWG_GIVEAWAY_EXCLUSIONS_1B
giveawayExclusions.enabled=True
giveawayExclusions.count=10
giveawayExclusions.rawItemsCount=10
giveawayExclusions.ignoredInvalidCount=0
lastError=
```

## Später

- Dashboard-Editor.
- DB-basierte Exclusions.
- Twitch-User-ID als Primärschlüssel.
- Pro-Giveaway zusätzliche Sperren.
