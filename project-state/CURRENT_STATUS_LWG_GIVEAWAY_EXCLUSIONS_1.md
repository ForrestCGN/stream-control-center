# Project State – LWG Giveaway Exclusions 1

Datum: 2026-06-19

## Stand

`LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde live bestätigt. Danach wurde der Bug entdeckt, dass `una_solala` im alten Draw gewinnen konnte, obwohl dieser User laut Sperrliste nicht gewinnen darf.

## Neuer Fix

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

## Nach Deploy prüfen

- Status grün.
- Exclusions geladen: `enabled=true`, `count=10`.
- Draw-Test mit Sperr-User.
- `exclusionInfo` in Winner-Metadata/Fairness oder Event-Metadata prüfen.

## Später

- Dashboard-Editor.
- DB-basierte Exclusions.
- Twitch-User-ID als Primärschlüssel.
- Pro-Giveaway zusätzliche Sperren.
