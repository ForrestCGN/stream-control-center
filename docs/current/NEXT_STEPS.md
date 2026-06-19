# Next Steps – LWG Giveaway Exclusions bestätigt

Stand: 2026-06-19

## Aktueller Stand

`LWG_GIVEAWAY_EXCLUSIONS_1B` ist live bestätigt:

```text
moduleVersion = 0.1.15
moduleBuild   = LWG_GIVEAWAY_EXCLUSIONS_1B
giveawayExclusions.enabled = True
giveawayExclusions.count = 10
giveawayExclusions.rawItemsCount = 10
giveawayExclusions.ignoredInvalidCount = 0
giveawayExclusions.loaded = True
lastError =
```

Zusätzlich bleibt `LWG_BOUND_WHEEL_FIELD_COUNT_1` bestätigt:

```text
Giveaway-bound Wheels nutzen exakt verfügbare Felder.
Bound-Wheel-Felder werden nicht mehr auf 12 sichtbare Felder aufgefüllt.
```

## Was wurde fachlich bestätigt?

Frisches Test-Giveaway:

```text
Giveaway: giveaway_1781865117837_a56d3fcb009a15a2
Bound-Wheel: giveawaywheel_1781865117837_3d9cfcef7469aef2
```

Test:

```text
una_solala   → Entry sichtbar, aber gesperrt
udowb        → Entry sichtbar, erlaubt
engelcgn     → Entry sichtbar, erlaubt
```

Draw:

```text
winner.userLogin = udowb
eligibleEntriesCount = 2
exclusionInfo.enabled = true
exclusionInfo.configuredCount = 10
exclusionInfo.rawEntriesCount = 3
exclusionInfo.excludedEntriesCount = 1
exclusionInfo.excluded[0].userLogin = una_solala
exclusionInfo.excluded[0].reason = login
```

Claim/Spin:

```text
permissionUid = wheelperm_1781865357312_f86f36711269e3e3
spinUid = spin_1781865515072_d11827bafa8cd593
selectedFieldLabel = Roadside Research
winner.status = wheel_completed
Roadside Research quantityRemaining = 0
fieldsCount = 8
visualFieldsCount = 8
giveawayBoundWheelExactFields = true
```

## Nächster sinnvoller technischer Schritt

Aktuell kein Muss-Fix am Exclusion-Flow offen.

Sinnvolle spätere Schritte:

1. Dashboard-Editor für Gewinn-Sperrliste planen.
2. Exclusions DB-basiert speichern.
3. Twitch-User-ID als primären Schlüssel in Entries ergänzen/nutzen.
4. Draw-/Log-Tab um Exclusion-Details erweitern.
5. 1-Gewinn-Direktvergabe gezielt in einem separaten Test-Giveaway testen.
6. 0-Gewinne-Blockpfad gezielt in einem separaten Test-Giveaway testen.

## Nicht vergessen

- Test-Giveaways später löschen oder als Test markieren.
- Config `config/loyalty_giveaway_exclusions.json` nicht durch altes Exportformat ersetzen, außer `1B` ist eingespielt: der neue Loader kann Exportformat robust lesen.
