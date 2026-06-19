# Module Current – loyalty_giveaways / Giveaway-bound Wheel + Exclusions

Stand: 2026-06-19

## Modulzweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Aktueller Modulstand

```text
Version: 0.1.14
Build:   LWG_GIVEAWAY_EXCLUSIONS_1
```

## Bestätigte Wheel-Funktion

`LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde live bestätigt:

- Giveaway-bound Wheels füllen nicht mehr auf 12 sichtbare Felder auf.
- Bei 2+ verfügbaren Gewinnen wird exakt mit den verfügbaren Feldern gedreht.
- Live-Test: `fieldsCount=7`, `visualFieldsCount=7`, `visualMinVisibleSlots=7`.
- `urlug` gewann `Valheim`; das Feld wurde danach auf `quantityRemaining=0` reduziert.
- Restbestand: 6 verfügbare Felder.

## Gewinn-Sperrliste / Exclusions

Sofort-Fix:

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
- `active`

Aktuell greift der Draw-Filter sicher über `login`. Falls Entries künftig Twitch-User-IDs in direktem Feld oder Metadata enthalten, wird zusätzlich über `twitchUserId` gefiltert.

## Bestätigter Exclusion-Test

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Entries:  una_solala, udowb, engelcgn
Excluded: una_solala
Winner:   udowb
Prize:    Roadside Research
Spin:     spin_1781865515072_d11827bafa8cd593
```

Draw-Fairness:

```text
rawEntriesCount=3
excludedEntriesCount=1
eligibleEntriesCount=2
excluded[0].userLogin=una_solala
excluded[0].reason=login
```

Claim-/Wheel-Folge:

```text
permission.status=used
winner.status=wheel_completed
Roadside Research quantityRemaining=0
fieldsCount=8
visualFieldsCount=8
giveawayBoundWheelExactFields=true
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

Damit kann später im Dashboard/Log nachvollzogen werden, wie viele Entries durch die Gewinn-Sperrliste ausgeschlossen wurden.

## Offene Punkte

- Exclusions-Loader robuster machen: Exportformat, Configformat, BOM, null-/kaputte Einträge.
- Exclusions im Dashboard editierbar machen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID langfristig als primären Schlüssel nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Pro-Giveaway zusätzliche Sperren planen.
- 1-Gewinn-Direktvergabe später gezielt testen.
