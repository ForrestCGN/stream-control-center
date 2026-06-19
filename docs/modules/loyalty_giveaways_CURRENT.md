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

## Bestätigte Gewinn-Sperrliste / Exclusions

Config:

```text
config/loyalty_giveaway_exclusions.json
```

Regel:

```text
User dürfen als Entry sichtbar bleiben, werden aber beim Draw aus der eligible-Liste entfernt und können dadurch nicht gewinnen.
```

Bestätigter Test:

```text
Entries: una_solala, udowb, engelcgn
Sperre: una_solala
Winner: udowb
excludedEntriesCount: 1
excluded[0].userLogin: una_solala
```

## Loader-Robustheit ab 1B

Der Loader akzeptiert:

- Exportformat `ok: true` + `items[]`,
- Configformat `enabled: true` + `items[]`,
- alternativ `users[]`,
- alternativ `exclusions[]`.

Zusätzlich:

- UTF-8-BOM wird vor JSON-Parsing entfernt,
- kaputte/null-Einträge werden ignoriert,
- Statusdiagnose enthält `rawItemsCount`, `ignoredInvalidCount`, `loaded`, `mtimeMs`.

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

- Exclusions im Dashboard editierbar machen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID langfristig als primären Schlüssel nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Pro-Giveaway zusätzliche Sperren planen.
- 1-Gewinn-Direktvergabe später gezielt testen.
