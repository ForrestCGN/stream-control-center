# Current Chat Handoff – LWG Giveaway Exclusions 1B bestätigt

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Arbeitsweise

- Erst echten aktuellen Stand prüfen, dann planen, dann auf Forrests `go` warten.
- Nicht raten; fehlende/unklare Dateien exakt anfragen.
- Keine Funktionalität entfernen.
- Vorhandene Systeme nutzen: Communication/EventBus, Twitch-Events, Sound-/Overlay-System, Helper, DB-/Config-/Dashboard-Patterns.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Nach ZIP-/Datei-Steps immer StepDone-Befehl angeben.
- Bei ZIP-/Datei-Steps wird StepDone nach Einspielen/Deployen ausgeführt und erst danach getestet.
- Dashboard-/Modul-Lösungen müssen streamer- und modfreundlich sein.

## Aktueller bestätigter Stand

```text
loyalty_giveaways: 0.1.15 / LWG_GIVEAWAY_EXCLUSIONS_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigt: Bound-Wheel-Feldanzahl

`LWG_BOUND_WHEEL_FIELD_COUNT_1` ist live bestätigt:

```text
fieldsCount=7
visualFieldsCount=7
visualMinVisibleSlots=7
Gewinn: Valheim
Restbestand: 6
```

## Bestätigt: Gewinn-Sperrliste

`LWG_GIVEAWAY_EXCLUSIONS_1` hat fachlich bestätigt:

```text
User bleiben als Entry sichtbar,
werden beim Draw aber aus der eligible-Liste entfernt,
wenn sie in der Gewinn-Sperrliste stehen.
```

Config:

```text
config/loyalty_giveaway_exclusions.json
```

Live-Status nach 1B:

```text
moduleVersion = 0.1.15
moduleBuild = LWG_GIVEAWAY_EXCLUSIONS_1B
giveawayExclusions.enabled = True
giveawayExclusions.count = 10
giveawayExclusions.rawItemsCount = 10
giveawayExclusions.ignoredInvalidCount = 0
giveawayExclusions.loaded = True
lastError =
```

## Frischer Exclusion-Test

Test-Giveaway:

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Titel: Test
Bound-Wheel: giveawaywheel_1781865117837_3d9cfcef7469aef2
```

Entries:

```text
una_solala   active  → gesperrt
udowb        active  → erlaubt
engelcgn     active  → erlaubt
```

Draw:

```text
Winner: udowb
eligibleEntriesCount: 2
rawEntriesCount: 3
excludedEntriesCount: 1
excluded[0].userLogin: una_solala
excluded[0].reason: login
```

Claim/Spin:

```text
Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin: spin_1781865515072_d11827bafa8cd593
Gewinn: Roadside Research
Winner status: wheel_completed
Permission status: used
Roadside Research quantityRemaining: 0
fieldsCount=8
visualFieldsCount=8
giveawayBoundWheelExactFields=true
```

## 1B-Sicherheitsfix

`LWG_GIVEAWAY_EXCLUSIONS_1B` ändert nicht die fachliche Draw-/Wheel-Logik, sondern macht nur den Loader robuster:

```text
- Exportformat ok:true + items[] akzeptieren.
- Configformat enabled:true + items[] akzeptieren.
- users[] und exclusions[] akzeptieren.
- UTF-8-BOM entfernen.
- kaputte/null-Einträge ignorieren.
- Status-Diagnosefelder ergänzen.
```

## Offene spätere Punkte

- Dashboard-Editor für Gewinn-Sperrliste.
- DB-basierte Verwaltung der Exclusions.
- Twitch-User-ID als primärer Schlüssel.
- Draw-/Log-Tab mit Exclusion-Details.
- Pro-Giveaway zusätzliche Sperren.
- 1-Gewinn-Direktvergabe gezielt testen.
- 0-Gewinne-Blockpfad gezielt testen.
- Test-Giveaways löschen oder eindeutig markieren.
