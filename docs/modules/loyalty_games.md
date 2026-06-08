# Loyalty Games Modul

Stand: 2026-06-08  
Version: 0.2.0  
STEP: LWG-4B

## Zweck

`loyalty_games` ist der Spiele-/Wheel-Bereich unter dem fachlichen Loyalty-Hauptbereich.

Aktuell enthalten:

```text
- Wheel / Glücksrad
- Wheel-Presets
- Preset-Felder
- Dreh-Verlauf fuer Preset-Spins
```

Nicht enthalten:

```text
- Giveaways
- Tickets
- Punktebuchung
- Reward-Ausfuehrung
```

## Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/presets.js
backend/modules/loyalty_games/shared.js
config/loyalty_games.json
```

## Modulstruktur

```text
loyalty_games.js = Host, Status, Routen, Init, DB-Schema-Anbindung
wheel.js         = Drehlogik, Ergebnisermittlung, Overlay-Events, Dreh-Verlauf
presets.js       = Presets, Felder, Preset-Lebenszyklus
shared.js        = lokaler Rad-/Preset-Helper
```

## Datenbank

Neue Tabellen:

```text
loyalty_wheel_presets
loyalty_wheel_fields
loyalty_wheel_spins
```

Bestehend bleibt:

```text
loyalty_game_sessions
```

Schema wird sanft erstellt:

```text
CREATE TABLE IF NOT EXISTS
CREATE INDEX IF NOT EXISTS
database.ensureSchema()
```

## API-Routen

Bestehend:

```text
GET  /api/loyalty/games/status
GET  /api/loyalty/games/config
GET  /api/loyalty/games/routes
GET  /api/loyalty/games/sessions
GET  /api/loyalty/games/wheel/status
GET  /api/loyalty/games/wheel/config
GET  /api/loyalty/games/wheel/spin
POST /api/loyalty/games/wheel/spin
POST /api/loyalty/games/wheel/reset
```

Neu:

```text
GET  /api/loyalty/games/wheel/presets
GET  /api/loyalty/games/wheel/presets/:presetUid
POST /api/loyalty/games/wheel/presets
POST /api/loyalty/games/wheel/presets/:presetUid/copy
POST /api/loyalty/games/wheel/presets/:presetUid/activate
POST /api/loyalty/games/wheel/presets/:presetUid/pause
POST /api/loyalty/games/wheel/presets/:presetUid/finish
POST /api/loyalty/games/wheel/presets/:presetUid/delete
GET  /api/loyalty/games/wheel/presets/:presetUid/fields
POST /api/loyalty/games/wheel/presets/:presetUid/fields
PUT  /api/loyalty/games/wheel/presets/:presetUid/fields/:fieldUid
POST /api/loyalty/games/wheel/presets/:presetUid/fields/:fieldUid/delete
GET  /api/loyalty/games/wheel/spins
```

## EventBus / WebSocket

Das Modul bereitet Events vor:

```text
loyalty.wheel.preset.created
loyalty.wheel.preset.copied
loyalty.wheel.preset.active
loyalty.wheel.preset.paused
loyalty.wheel.preset.finished
loyalty.wheel.preset.deleted
loyalty.wheel.spin.started
loyalty.wheel.spin.finished
```

Wenn ein `ctx.eventBus` vorhanden ist, wird er genutzt. Zusätzlich werden Events per `broadcastWS` ausgegeben.

## Fairness

```text
- Ergebnis wird backendseitig per crypto.randomInt bestimmt.
- API akzeptiert presetUid, aber kein selectedFieldId/selectedFieldIndex.
- Kein Ergebnis kann per API erzwungen werden.
- Presets mit Spins sind nicht mehr direkt editierbar, sondern muessen kopiert werden.
```

## Offene Punkte

```text
- Preset-Dashboard-Editor
- Giveaways
- Giveaway-verknuepfte Presets
- Permissions fuer Giveaway-Gewinner
- Chat-Command
- Kanalpunkte-Zuordnung
```
