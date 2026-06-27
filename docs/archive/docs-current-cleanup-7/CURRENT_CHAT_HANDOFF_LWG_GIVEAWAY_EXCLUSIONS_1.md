# Current Chat Handoff – LWG Giveaway Exclusions 1 bestätigt

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Arbeitsweise

- Erst echten Stand prüfen, dann planen, dann auf ausdrückliches `go` warten.
- Nicht raten. Wenn Dateien fehlen oder unklar sind, exakt nach den benötigten Dateien fragen.
- Keine Funktionalität entfernen.
- Vorhandene Systeme nutzen: Communication/EventBus, Twitch-Events, Sound-/Overlay-System, vorhandene Helper, DB-/Config-/Dashboard-Patterns.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Nach Datei-/ZIP-Steps immer StepDone-Befehl angeben.
- Bei ZIP-/Datei-Steps wird StepDone nach dem Einspielen/Deployen ausgeführt und erst danach getestet.
- Dashboard-/Modul-Lösungen müssen streamer- und modfreundlich sein, nicht zu technisch.

## Bestätigt vor diesem Step

`LWG_BOUND_WHEEL_FIELD_COUNT_1` ist live bestätigt:

```text
fieldsCount=7
visualFieldsCount=7
visualMinVisibleSlots=7
Gewinn: Valheim
Restbestand: 6
```

## Bug-Fund

`una_solala` wurde im alten Draw gezogen, obwohl der User laut Sperrliste nicht gewinnen darf.

Alte Beobachtung:

```text
eligibleEntriesCount=5
Winner=una_solala
```

## Bestätigter Step

```text
LWG_GIVEAWAY_EXCLUSIONS_1
```

Ziel umgesetzt:

- Gewinn-Sperrliste aus `config/loyalty_giveaway_exclusions.json` laden.
- Gesperrte User beim Draw aus der eligible-Liste entfernen.
- Entries bleiben sichtbar.
- Gesperrte User können nicht gewinnen.
- Draw-Metadata enthält `exclusionInfo`.

## Live-Status bestätigt

```text
moduleVersion=0.1.14
moduleBuild=LWG_GIVEAWAY_EXCLUSIONS_1
giveawayExclusions.enabled=True
giveawayExclusions.count=10
lastError=leer
```

## Sauberer Exclusion-Test

Frisches Test-Giveaway:

```text
Giveaway:      giveaway_1781865117837_a56d3fcb009a15a2
Title:         Test
Bound-Wheel:   giveawaywheel_1781865117837_3d9cfcef7469aef2
Entries:       una_solala, udowb, engelcgn
```

Draw-Ergebnis:

```text
Winner:                 udowb
eligibleEntriesCount:   2
rawEntriesCount:        3
excludedEntriesCount:   1
excluded[0].userLogin:  una_solala
excluded[0].reason:     login
```

Damit bestätigt:

```text
una_solala durfte teilnehmen und blieb als Entry sichtbar,
wurde aber beim Draw sauber ausgeschlossen und konnte nicht gewinnen.
```

## Claim-/Wheel-Test bestätigt

```text
Wheel-Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin:             spin_1781865515072_d11827bafa8cd593
Winner:           udowb
Prize:            Roadside Research
Status:           wheel_completed
```

Feldverbrauch:

```text
Roadside Research quantityRemaining: 1 -> 0
fieldsCount=8
visualFieldsCount=8
giveawayBoundWheelExactFields=true
```

## Geänderte Dateien im bestätigten Doku-/Config-Stand

```text
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

## Code-Stand

Kein neuer Code-Step in diesem Handoff. Der bestätigte Code-Stand bleibt:

```text
backend/modules/loyalty_giveaways.js → 0.1.14 / LWG_GIVEAWAY_EXCLUSIONS_1
backend/modules/loyalty_games.js     → 0.2.8 / LWG_BOUND_WHEEL_FIELD_COUNT_1
backend/modules/loyalty_games/wheel.js → LWG_BOUND_WHEEL_FIELD_COUNT_1 Runtime-Regel
```

## Nächster sinnvoller Step

`LWG_GIVEAWAY_EXCLUSIONS_1B` planen, aber noch nicht ohne `go` umsetzen.

Ziel:

- Loader robuster machen:
  - Exportformat `ok/items` akzeptieren,
  - Configformat `enabled/items` und `enabled/users` akzeptieren,
  - BOM entfernen,
  - null-/kaputte Einträge ignorieren,
  - Statusdiagnose erweitern.
- Danach Dashboard-/DB-Verwaltung planen.
