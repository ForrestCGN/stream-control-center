# Current Chat Handoff – LWG Giveaway Exclusions 1

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Bestätigt vor diesem Step

`LWG_BOUND_WHEEL_FIELD_COUNT_1` ist live bestätigt:

```text
fieldsCount=7
visualFieldsCount=7
visualMinVisibleSlots=7
Gewinn: Valheim
Restbestand: 6
```

## Neuer Bug-Fund

`una_solala` wurde im alten Draw gezogen, obwohl der User laut Sperrliste nicht gewinnen darf.

Alte Beobachtung:

```text
eligibleEntriesCount=5
Winner=una_solala
```

Nach einem weiteren Draw wurde `urlug` gezogen und gewann `Valheim`.

## Neuer Step

```text
LWG_GIVEAWAY_EXCLUSIONS_1
```

Ziel:

- Gewinn-Sperrliste aus `config/loyalty_giveaway_exclusions.json` laden.
- Gesperrte User beim Draw aus der eligible-Liste entfernen.
- Entries bleiben sichtbar.
- Gesperrte User können nicht gewinnen.
- Draw-Metadata enthält `exclusionInfo`.

## Geänderte Dateien

```text
backend/modules/loyalty_giveaways.js
config/loyalty_giveaway_exclusions.json
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_GIVEAWAY_EXCLUSIONS_1.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_GIVEAWAY_EXCLUSIONS_1.md
```

## Nach Deploy testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/status" |
  Select-Object ok,module,moduleVersion,moduleBuild,enabled,lastError,giveawayExclusions
```

Erwartet:

```text
moduleVersion=0.1.14
moduleBuild=LWG_GIVEAWAY_EXCLUSIONS_1
giveawayExclusions.enabled=True
giveawayExclusions.count=10
```

Danach Draw-Test mit gesperrtem User als Entry und mindestens einem erlaubten User. Gesperrter User darf nicht Gewinner werden; Metadata/Fairness muss `exclusionInfo` enthalten.
