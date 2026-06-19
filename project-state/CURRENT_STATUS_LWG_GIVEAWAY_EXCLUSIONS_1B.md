# Project State – LWG Giveaway Exclusions 1B confirmed

Datum: 2026-06-19

## Stand

`LWG_GIVEAWAY_EXCLUSIONS_1B` ist live bestätigt.

## Modulstand

```text
loyalty_giveaways: 0.1.15 / LWG_GIVEAWAY_EXCLUSIONS_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigte Config

```text
config/loyalty_giveaway_exclusions.json
```

Status:

```text
giveawayExclusions.enabled = True
giveawayExclusions.count = 10
giveawayExclusions.rawItemsCount = 10
giveawayExclusions.ignoredInvalidCount = 0
giveawayExclusions.loaded = True
giveawayExclusions.lastError =
```

## Bestätigte fachliche Regel

```text
User bleiben als Entry sichtbar, sind beim Draw aber nicht eligible und können dadurch nicht gewinnen.
```

## Bestätigter Test

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Entries: una_solala, udowb, engelcgn
Excluded: una_solala
Winner: udowb
eligibleEntriesCount: 2
rawEntriesCount: 3
excludedEntriesCount: 1
```

Claim/Spin:

```text
Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin: spin_1781865515072_d11827bafa8cd593
Gewinn: Roadside Research
Status: wheel_completed
Feldverbrauch: Roadside Research quantityRemaining 1 → 0
```

## 1B-Sicherheitsfix

1B macht den Loader robuster:

```text
- Exportformat ok:true + items[] akzeptiert.
- Configformat enabled:true + items[] akzeptiert.
- users[] und exclusions[] akzeptiert.
- UTF-8-BOM entfernt.
- kaputte/null-Einträge ignoriert.
- Status-Diagnosefelder ergänzt.
```

Keine Änderung an:

```text
- Draw-Eligibility-Regel
- Wheel-Claim-Flow
- Bound-Wheel-Feldverbrauch
- Overlay
- loyalty_games / wheel.js
```

## Später

- Dashboard-Editor.
- DB-basierte Exclusions.
- Twitch-User-ID als Primärschlüssel.
- Pro-Giveaway zusätzliche Sperren.
- 1-Gewinn-Direktvergabe gezielt testen.
- 0-Gewinne-Blockpfad gezielt testen.
- Test-Giveaways löschen/markieren.
