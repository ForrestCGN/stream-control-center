# Changelog – Loyalty-Giveaways / CGN-Glücksrad

## 2026-06-19 – LWG_CHAT_OUTPUT_1

### Changed

- `loyalty_giveaways` auf Version `0.1.17`, Build `LWG_CHAT_OUTPUT_1` erhöht.
- Direkte Chat-Ausgabe in der Command-Runtime erweitert:
  - bisher: direkte Ausgabe für `raffle.*`,
  - neu zusätzlich: direkte Ausgabe für `ticket.*` und `wheel.*`.

### Important

- Keine neuen Texte hartcodiert.
- Vorhandene Helper/Textvarianten werden genutzt:
  - `helper_texts`,
  - `helper_chat_output`,
  - bestehende `messageKey`/`context`-Struktur.

### Textkeys

```text
ticket.success
ticket.no_active
ticket.invalid_amount
ticket.max_reached
ticket.insufficient_balance
wheel.no_permission
wheel.success
```

### Compatibility

- Keine Änderung an `!join` / `!raffle`.
- Keine Änderung an Draw-/Exclusion-/Wheel-Logik.
- Keine Änderung am DB-Schema.
- Kein Dashboard-Change.
- Kein Overlay-Change.

### Test Status

- Noch offen: Live-Test, ob `!ticket` und `!wheel`/`!rad` jetzt Chatmeldungen senden.

## 2026-06-19 – LWG_CHAT_COMMANDS_1

### Changed

- `loyalty_giveaways` auf Version `0.1.16`, Build `LWG_CHAT_COMMANDS_1` erhöht.
- `!ticket` für normale Giveaways aktiviert.
- `!wheel` und Alias `!rad` für Gewinner-Wheel-Claims aktiviert.
- Bestehende DB-/Central-Command-Einträge werden beim Seed gezielt aktiviert.

### Compatibility

- `!join` bleibt Raffle.
- `!raffle` bleibt Raffle.
- Keine Änderung an Draw-/Wheel-/Exclusion-Logik.

### Tested

- Zentrale Commands bestätigt:

```text
available=true
active=true
commandsActive=true
ticket.enabled=true
wheel.enabled=true
wheel.aliases=[rad]
targetUrl=/api/loyalty/giveaways/runtime/chat-command
```

- Interaktiver Komplett-Test fachlich bestanden:

```text
Giveaway: giveaway_1781869724371_2cdf71cc66cc312a
Entries: 3 erlaubte User per !ticket + una_solala per API
Draw aus open: korrekt blockiert
Gewinner 1: RoxxyFoxxyCGN → Wheel-Claim erkannt
Gewinner 2: EngelCGN → Wheel-Claim erkannt
Gewinner 3: ForrestCGN → Wheel-Claim erkannt
Final: kein eligible User mehr
Felder: 8 → 5
Alle Gewinner: wheel_completed
```

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1B

### Changed

- `loyalty_giveaways` auf Version `0.1.15`, Build `LWG_GIVEAWAY_EXCLUSIONS_1B` erhöht.
- Exclusion-Loader robuster gemacht:
  - akzeptiert Exportformat `ok:true` + `items[]`,
  - akzeptiert Configformat `enabled:true` + `items[]`,
  - akzeptiert zusätzlich `users[]` und `exclusions[]`,
  - entfernt UTF-8-BOM vor JSON-Parsing,
  - ignoriert kaputte/null-Einträge.

### Tested

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

## 2026-06-19 – LWG_GIVEAWAY_EXCLUSIONS_1

### Added

- Datei `config/loyalty_giveaway_exclusions.json` als Sofort-Fix für Gewinn-Sperrliste ergänzt.
- Draw-Eligibility filtert gesperrte User aus der Gewinnziehung.
- Gesperrte User bleiben als Entry sichtbar, können aber nicht gewinnen.

## 2026-06-19 – LWG_BOUND_WHEEL_FIELD_COUNT_1

### Added

- Harte Runtime-Regel für Giveaway-bound Wheels:
  - 2+ verfügbare Gewinne → normaler Spin mit exakt diesen Feldern.
  - 1 verfügbarer Gewinn → Direktvergabe ohne normalen Wheel-Spin.
  - 0 verfügbare Gewinne → Claim/Spin blockiert.
