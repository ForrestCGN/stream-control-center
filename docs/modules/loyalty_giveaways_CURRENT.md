# Module Current – loyalty_giveaways / Giveaway-bound Wheel + Exclusions

Stand: 2026-06-19

## Modulzweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Aktueller Modulstand

```text
Version: 0.1.15
Build:   LWG_GIVEAWAY_EXCLUSIONS_1B
```

## Bestätigte Wheel-Funktion

`LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde live bestätigt:

- Giveaway-bound Wheels füllen nicht mehr auf 12 sichtbare Felder auf.
- Bei 2+ verfügbaren Gewinnen wird exakt mit den verfügbaren Feldern gedreht.
- Live-Test: `fieldsCount=7`, `visualFieldsCount=7`, `visualMinVisibleSlots=7`.
- `urlug` gewann `Valheim`; das Feld wurde danach auf `quantityRemaining=0` reduziert.
- Restbestand: 6 verfügbare Felder.

## Gewinn-Sperrliste / Exclusions

Dateibasierte Config:

```text
config/loyalty_giveaway_exclusions.json
```

Regel:

```text
User dürfen als Entry sichtbar bleiben, werden aber beim Draw aus der eligible-Liste entfernt und können dadurch nicht gewinnen.
```

Die Sperrliste verarbeitet:

- `login`
- `displayName`
- `twitchUserId`

Aktuell greift der Draw-Filter sicher über `login`. Falls Entries künftig Twitch-User-IDs in direktem Feld oder Metadata enthalten, wird zusätzlich über `twitchUserId` gefiltert.

## Loader-Formate ab 1B

Der Loader akzeptiert robust:

```text
Exportformat: ok:true + items[]
Configformat: enabled:true + items[]
Alternativ: users[] oder exclusions[]
```

Außerdem:

- UTF-8-BOM wird entfernt.
- Kaputte/null-Einträge werden ignoriert.
- Status gibt Diagnosefelder aus.

## Status-Diagnose

`/api/loyalty/giveaways/status` enthält:

```text
giveawayExclusions.enabled
giveawayExclusions.path
giveawayExclusions.count
giveawayExclusions.rawItemsCount
giveawayExclusions.ignoredInvalidCount
giveawayExclusions.generatedAt
giveawayExclusions.loaded
giveawayExclusions.mtimeMs
giveawayExclusions.lastError
```

Bestätigter Live-Wert nach 1B:

```text
enabled=True
count=10
rawItemsCount=10
ignoredInvalidCount=0
loaded=True
lastError=
```

## Draw-Metadata

Draw-Fairness enthält `exclusionInfo`:

```text
enabled
configuredCount
rawEntriesCount
excludedEntriesCount
excluded[]
```

Bestätigter Test:

```text
rawEntriesCount=3
excludedEntriesCount=1
excluded[0].userLogin=una_solala
excluded[0].reason=login
eligibleEntriesCount=2
winner=udowb
```

Damit kann später im Dashboard/Log nachvollzogen werden, wie viele Entries durch die Gewinn-Sperrliste ausgeschlossen wurden.

## Bestätigter Claim-/Wheel-Flow nach Exclusion-Draw

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

## Offene Punkte

- Exclusions im Dashboard editierbar machen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID langfristig als primären Schlüssel nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Pro-Giveaway zusätzliche Sperren planen.
- 1-Gewinn-Direktvergabe später gezielt testen.
- 0-Gewinne-Blockpfad später gezielt testen.
