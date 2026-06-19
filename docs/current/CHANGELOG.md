# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1B

### Changed

- `loyalty_giveaways` auf Version `0.1.15`, Build `LWG_GIVEAWAY_EXCLUSIONS_1B` erhöht.
- Exclusion-Loader robuster gemacht:
  - akzeptiert Exportformat `ok:true` + `items[]`,
  - akzeptiert Configformat `enabled:true` + `items[]`,
  - akzeptiert zusätzlich `users[]` und `exclusions[]`,
  - entfernt UTF-8-BOM vor JSON-Parsing,
  - ignoriert kaputte/null-Einträge.
- Modulstatus `giveawayExclusions` um Diagnosefelder erweitert:
  - `rawItemsCount`,
  - `ignoredInvalidCount`,
  - `loaded`,
  - `mtimeMs`.

### Tested

- Live-Status bestätigt:

```text
moduleVersion = 0.1.15
moduleBuild = LWG_GIVEAWAY_EXCLUSIONS_1B
enabled = true
count = 10
rawItemsCount = 10
ignoredInvalidCount = 0
loaded = true
lastError =
```

### Compatibility

- Keine Änderung an Draw-Eligibility-Regel.
- Keine Änderung an Wheel-Claim-Flow.
- Keine Änderung an Bound-Wheel-Feldverbrauch.
- Kein Overlay-Change.

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1

### Added

- Datei `config/loyalty_giveaway_exclusions.json` als Sofort-Fix für Gewinn-Sperrliste ergänzt.
- Draw-Eligibility filtert gesperrte User aus der Gewinnziehung.
- Draw-Metadata/Fairness enthält `exclusionInfo` mit Roh-/Eligible-/Excluded-Informationen.
- Modulstatus enthält `giveawayExclusions` mit Pfad, Count und Ladefehler.

### Changed

- `loyalty_giveaways` auf Version `0.1.14`, Build `LWG_GIVEAWAY_EXCLUSIONS_1` erhöht.
- Gesperrte User bleiben als Entry sichtbar, können aber nicht gewinnen.

### Tested

- Frisches Test-Giveaway mit `una_solala`, `udowb`, `engelcgn`.
- `una_solala` blieb als Entry sichtbar, wurde aber beim Draw ausgeschlossen.
- Gewinner war `udowb`.
- `exclusionInfo.excludedEntriesCount=1`, `excluded[0].userLogin=una_solala`.
- Wheel-Claim für `udowb` erfolgreich.
- Gewinn `Roadside Research` wurde vergeben und Feldbestand reduziert.

### Known Follow-up

- Sperrliste später ins Dashboard und in die Datenbank überführen.
- Twitch-User-ID als primärer Schlüssel, Login nur als Fallback.
- Draw-/Log-Tab soll später anzeigen, wie viele Entries durch Sperrliste ausgeschlossen wurden.

## 2026-06-19 – LWG_BOUND_WHEEL_FIELD_COUNT_1

### Added

- Harte Runtime-Regel für Giveaway-bound Wheels:
  - 2+ verfügbare Gewinne → normaler Spin mit exakt diesen Feldern.
  - 1 verfügbarer Gewinn → Direktvergabe ohne normalen Wheel-Spin.
  - 0 verfügbare Gewinne → Claim/Spin blockiert.

### Tested

- Live-Test mit `urlug` gewann `Valheim`.
- Spin-Metadata bestätigte `fieldsCount=7`, `visualFieldsCount=7`, `visualMinVisibleSlots=7`.
- Bound-Wheel-Feld `Valheim` wurde danach auf `quantityRemaining=0` reduziert.
- Restbestand nach Test: 6 verfügbare Felder.

### Known Follow-up

- 1-Gewinn-Direktvergabe später gezielt testen.
- Wheel-Verhalten später dashboardfähig konfigurierbar machen.
