# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Stand

`LWG_GIVEAWAY_EXCLUSIONS_1` ist fachlich live bestätigt.

Bestätigter Test mit Giveaway `giveaway_1781865117837_a56d3fcb009a15a2`:

```text
Entries roh: 3
- una_solala   (gesperrt)
- udowb        (erlaubt)
- engelcgn     (erlaubt)

Draw-Gewinner: udowb
eligibleEntriesCount: 2
exclusionInfo.enabled: true
exclusionInfo.configuredCount: 10
exclusionInfo.rawEntriesCount: 3
exclusionInfo.excludedEntriesCount: 1
exclusionInfo.excluded[0].userLogin: una_solala
exclusionInfo.excluded[0].reason: login
```

Danach wurde der Wheel-Claim für `udowb` erfolgreich getestet:

```text
Permission: wheelperm_1781865357312_f86f36711269e3e3
Spin:       spin_1781865515072_d11827bafa8cd593
Gewinn:     Roadside Research
Status:     wheel_completed
Feld:       Roadside Research quantityRemaining 1 -> 0
```

Damit ist bestätigt:

- gesperrte User dürfen teilnehmen und bleiben als Entry sichtbar,
- gesperrte User werden beim Draw aus der eligible-Liste entfernt,
- Draw-Metadata/Fairness enthält `exclusionInfo`,
- Gewinner kann danach normal das Giveaway-bound Wheel drehen,
- Bound-Wheel-Felder werden weiter exakt und korrekt reduziert.

## Neuer Sicherheits-Step

`LWG_GIVEAWAY_EXCLUSIONS_1B` ist ein robuster Loader-/Diagnose-Step ohne Funktionsänderung am bestätigten Draw-Verhalten.

Ziel:

- Exportformat mit `ok: true` + `items[]` akzeptieren.
- Configformat mit `enabled: true` + `items[]` oder `users[]` akzeptieren.
- UTF-8-BOM vor JSON-Parsing entfernen.
- kaputte/null-Einträge ignorieren statt die Sperrliste unklar zu machen.
- Status-Diagnose um `rawItemsCount`, `ignoredInvalidCount`, `loaded`, `mtimeMs` erweitern.

## Modulversionen nach `LWG_GIVEAWAY_EXCLUSIONS_1B`

```text
loyalty_giveaways: 0.1.15 / LWG_GIVEAWAY_EXCLUSIONS_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Noch offen / später

- Exclusions im Dashboard editierbar machen.
- Exclusions DB-basiert speichern.
- Twitch-User-ID langfristig als primären Schlüssel nutzen.
- Pro-Giveaway zusätzliche Sperren planen.
- 1-Gewinn-Direktvergabe später gezielt testen.
