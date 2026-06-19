# Module Current – loyalty_giveaways / Giveaway-bound Wheel + Exclusions + Chat-Commands

Stand: 2026-06-19

## Modulzweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Aktueller Modulstand

```text
Version: 0.1.16
Build:   LWG_CHAT_COMMANDS_1
```

## Aktive Chat-Commands

Normale Giveaway-Runtime:

```text
!ticket       → Teilnahme am aktuell offenen Giveaway
!wheel / !rad → Rad-Claim für gezogenen Gewinner mit offener Wheel-Permission
```

Raffle-Runtime, unverändert:

```text
!join   → Teilnahme an aktueller Raffle
!raffle → Raffle starten/status/cancel
```

Wichtig:

```text
!join ist kein normaler Giveaway-Join.
Für normale Giveaways wird !ticket genutzt.
```

Die zentrale Command-Registry leitet `ticket` und `wheel` an folgende Route:

```text
POST /api/loyalty/giveaways/runtime/chat-command
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

Bestätigter Exclusion-Test:

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

## Bestätigter kompletter Chat-Command-/Wheel-Test

Test-Giveaway:

```text
giveaway_1781869724371_2cdf71cc66cc312a
```

Ablauf:

```text
- una_solala per API als gesperrter Entry
- RoxxyFoxxyCGN, EngelCGN, ForrestCGN per !ticket
- Draw aus open korrekt blockiert
- Giveaway geschlossen
- Draw 1: RoxxyFoxxyCGN
- Draw 2: EngelCGN
- Draw 3: ForrestCGN
- jeder Gewinner löste Wheel-Claim per !wheel/!rad aus
```

Bestätigtes Ergebnis:

```text
entries=4
excludedEntries=1
eligibleWinners=3
wheelClaims=3
remainingFields=5
allExpectedWinners=wheel_completed
finalNoEligibleDraw=blocked
```

## Testscript

Aktueller Stand:

```text
tools/tests/loyalty_giveaway_wheel_interactive_test.ps1
```

Step:

```text
LWG_TESTSCRIPT_1_3
```

Zweck:

```text
Interaktiver Komplett-Test:
- open
- blocked API entry
- 3x !ticket
- draw aus open blockieren
- close
- 3 Draw-/Wheel-Runden
- final no eligible
- Summary
```

## Offene Punkte

- Testscript 1.3 mit frischem Test-Giveaway einmal auf sauberen finalen `SUCCESS`-Abschluss prüfen.
- Exclusions im Dashboard editierbar machen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID langfristig als primären Schlüssel nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Pro-Giveaway zusätzliche Sperren planen.
- 1-Gewinn-Direktvergabe später gezielt testen.
- 0-Gewinne-Blockpfad später gezielt testen.
- Live-Dashboard-Flow für sequenziellen Draw + Wheel-Claim bauen.
