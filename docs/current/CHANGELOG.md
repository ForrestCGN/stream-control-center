# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1 bestätigt

### Tested

- `loyalty_giveaways` läuft live mit Version `0.1.14`, Build `LWG_GIVEAWAY_EXCLUSIONS_1`.
- `config/loyalty_giveaway_exclusions.json` wurde live korrigiert und geladen.
- Status bestätigt `giveawayExclusions.enabled=true`, `count=10`.
- Frisches Test-Giveaway `giveaway_1781865117837_a56d3fcb009a15a2` verwendet.
- Entries im Test: `una_solala`, `udowb`, `engelcgn`.
- Draw bestätigte:
  - `rawEntriesCount=3`,
  - `excludedEntriesCount=1`,
  - `eligibleEntriesCount=2`,
  - `una_solala` wurde per Login ausgeschlossen,
  - Gewinner wurde `udowb`.
- Claim-/Wheel-Test bestätigt:
  - Permission `wheelperm_1781865357312_f86f36711269e3e3` wurde genutzt,
  - Spin `spin_1781865515072_d11827bafa8cd593` wurde erstellt,
  - `udowb` erhielt `Roadside Research`,
  - Bound-Wheel-Feld `Roadside Research` wurde auf `quantityRemaining=0` reduziert.

### Added

- Datei `config/loyalty_giveaway_exclusions.json` als Sofort-Fix für Gewinn-Sperrliste ergänzt.
- Draw-Eligibility filtert gesperrte User aus der Gewinnziehung.
- Draw-Metadata/Fairness enthält `exclusionInfo` mit Roh-/Eligible-/Excluded-Informationen.
- Modulstatus enthält `giveawayExclusions` mit Pfad, Count und Ladefehler.

### Changed

- `loyalty_giveaways` auf Version `0.1.14`, Build `LWG_GIVEAWAY_EXCLUSIONS_1` erhöht.
- Gesperrte User bleiben als Entry sichtbar, können aber nicht gewinnen.

### Known Follow-up

- Loader robuster machen: Exportformat, Configformat, BOM und kaputte/null-Einträge behandeln.
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
