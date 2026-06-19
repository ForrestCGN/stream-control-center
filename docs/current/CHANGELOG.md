# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG_CHAT_COMMANDS_1

### Changed

- `loyalty_giveaways` auf Version `0.1.16`, Build `LWG_CHAT_COMMANDS_1` erhöht.
- `!ticket` für normale Giveaway-Entries aktiviert.
- `!wheel` und Alias `!rad` für Wheel-Claims aktiviert.
- Bestehende deaktivierte Command-DB-Einträge für `ticket` und `wheel` werden durch die Seed-Logik gezielt aktiviert.
- Beschreibungen für `!ticket` und `!wheel` von „Noch nicht aktiv“ auf aktiven Runtime-Status angepasst.

### Unchanged

- `!join` bleibt Raffle-Command.
- `!raffle` bleibt Raffle-Command.
- Raffle-Logik unverändert.
- Draw-/Exclusion-Logik unverändert.
- Wheel-/Bound-Wheel-Logik unverändert.
- Dashboard unverändert.
- DB-Schema unverändert.

### Tested

- `GET /api/loyalty/giveaways/commands` bestätigt:
  - `active=true`
  - `ticket.enabled=true`
  - `wheel.enabled=true`
  - `join.enabled=true`
  - `raffle.enabled=true`
- `GET /api/loyalty/giveaways/central-commands` bestätigt:
  - `available=true`
  - `active=true`
  - `commandsActive=true`
  - `ticket.targetUrl=/api/loyalty/giveaways/runtime/chat-command`
  - `wheel.targetUrl=/api/loyalty/giveaways/runtime/chat-command`
- Interaktiver Komplett-Test mit Giveaway `giveaway_1781869724371_2cdf71cc66cc312a`:
  - `una_solala` per API als gesperrter sichtbarer Entry,
  - 3 erlaubte User per `!ticket`,
  - Draw aus `open` korrekt blockiert,
  - 3 Draw-Runden,
  - 3 Wheel-Claims per Chat,
  - Feldbestand `8 -> 5`,
  - alle erwarteten Gewinner `wheel_completed`,
  - danach kein eligible User mehr vorhanden.

### Known Follow-up

- Testscript 1.3 einmal mit frischem Giveaway nur auf sauberen finalen `SUCCESS`-Abschluss prüfen.
- Dashboard-/UX-Flow für echten Live-Draw bauen.
- Sperrliste später dashboard- und DB-fähig machen.

## 2026-06-19 – LWG_TESTSCRIPT_1_3

### Changed

- Interaktives Testscript robuster gemacht:
  - `!ticket` statt `!join` im Testhinweis,
  - Draw-aus-open-Block wird als erwarteter PASS erkannt,
  - finaler Summary-/JSON-Bereich robuster,
  - erfolgreicher fachlicher Test soll nicht mehr durch Argumenttypen-Fehler im finalen Reporting abbrechen.

### Unchanged

- Kein Backend-Change.
- Kein Dashboard-Change.
- Kein DB-Change.
- Keine Änderung an Draw-/Wheel-/Exclusion-Logik.

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
