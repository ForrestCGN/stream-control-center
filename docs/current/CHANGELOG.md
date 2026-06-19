# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1B

### Changed

- `loyalty_giveaways` auf Version `0.1.15`, Build `LWG_GIVEAWAY_EXCLUSIONS_1B` erhöht.
- Exclusion-Config-Loader robuster gemacht:
  - akzeptiert Exportformat `ok: true` + `items[]`,
  - akzeptiert Configformat `enabled: true` + `items[]`,
  - akzeptiert alternativ `users[]` und `exclusions[]`,
  - entfernt UTF-8-BOM vor JSON-Parsing,
  - ignoriert kaputte/null-Einträge.
- Statusausgabe `giveawayExclusions` um Diagnosewerte erweitert:
  - `rawItemsCount`,
  - `ignoredInvalidCount`,
  - `loaded`,
  - `mtimeMs`.

### Not changed

- Keine Änderung an der bestätigten Draw-Eligibility-Regel.
- Keine Änderung am Wheel-Claim-Flow.
- Keine Änderung am Bound-Wheel-Feldverbrauch.

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1

### Added

- Datei `config/loyalty_giveaway_exclusions.json` als Sofort-Fix für Gewinn-Sperrliste ergänzt.
- Draw-Eligibility filtert gesperrte User aus der Gewinnziehung.
- Draw-Metadata/Fairness enthält `exclusionInfo` mit Roh-/Eligible-/Excluded-Informationen.
- Modulstatus enthält `giveawayExclusions` mit Pfad, Count und Ladefehler.

### Tested

- Frisches Test-Giveaway `giveaway_1781865117837_a56d3fcb009a15a2`.
- Entries: `una_solala`, `udowb`, `engelcgn`.
- `una_solala` wurde als Entry sichtbar gelassen, aber beim Draw ausgeschlossen.
- Draw-Gewinner: `udowb`.
- `exclusionInfo.excludedEntriesCount=1` und `excluded[0].userLogin=una_solala`.
- Wheel-Claim für `udowb` erfolgreich.
- Gewinn `Roadside Research` wurde vergeben und auf `quantityRemaining=0` reduziert.

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
