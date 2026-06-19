# Next Steps – LWG Giveaway Exclusions

Stand: 2026-06-19

## Aktueller Stand

`LWG_BOUND_WHEEL_FIELD_COUNT_1` ist live bestätigt:

```text
fieldsCount=7
visualFieldsCount=7
visualMinVisibleSlots=7
Restbestand nach Valheim: 6 verfügbare Felder
```

## Nächster technischer Schritt

### LWG_GIVEAWAY_EXCLUSIONS_1

Ziel:

- Gesperrte Bot-/Mehrfachaccounts dürfen nicht gewinnen.
- Entries bleiben sichtbar.
- Draw filtert gesperrte User aus der eligible-Liste.
- Sperrliste liegt als Sofort-Fix unter `config/loyalty_giveaway_exclusions.json`.

Betroffene Dateien:

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

## Danach testen

1. Status prüfen: `loyalty_giveaways` Version `0.1.14`, Build `LWG_GIVEAWAY_EXCLUSIONS_1`.
2. Test-Giveaway mit einem gesperrten User und mindestens einem erlaubten User erstellen/verwenden.
3. Draw ausführen.
4. Prüfen:
   - gesperrter User ist nicht Gewinner,
   - `eligibleEntriesCount` reduziert sich,
   - Metadata/Fairness enthält `exclusionInfo`.

## Danach / später

- Dashboard-Editor für Sperrliste planen.
- DB-basierte Exclusions statt JSON-Datei.
- Pro-Giveaway Exclusions.
- Wheel-1-Gewinn-Direktvergabe später gezielt testen, ohne produktive Gewinne unnötig zu verbrauchen.
