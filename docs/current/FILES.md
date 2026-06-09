# FILES – Loyalty Giveaways / Glücksrad aktueller Stand

## Wichtige Backend-Dateien

### `backend/modules/loyalty_giveaways.js`
Aktueller bestätigter Build:
```text
STEP_LWG_4M_4
```

Zuständig für:
- Giveaways
- Entries/Tickets
- Draw
- Close
- Wheel-Permissions
- Giveaway-bound Wheels

### `backend/modules/loyalty_games.js`
Zuständig für:
- Wheel-Game Host
- Preset-Routen
- Spin-Routen
- Verbindung zu `loyalty_games/presets.js` und `loyalty_games/wheel.js`

### `backend/modules/loyalty_games/presets.js`
Wichtig:
- Enthält bereits `PRESET_TYPE.STANDALONE`.
- Enthält bereits `PRESET_TYPE.GIVEAWAY_LINKED`.
- Blockiert `GIVEAWAY_LINKED` für normale globale Spins.
- Enthält Preset-/Field-/Spin-Persistenz.

### `backend/modules/loyalty_games/wheel.js`
Wichtig:
- Führt Spins aus.
- Nutzt PresetStore für Fields.
- Globaler Spin muss weiterhin normale `standalone` Presets nutzen.
- Für Giveaway-Claim muss in LWG-4M.5 der Bound-Wheel-Kontext sauber angebunden werden.

## Neue/aktualisierte Doku-Dateien in diesem Paket

```text
README_LWG-4M.4_DOCUMENTATION_UPDATE.txt
docs/current/CURRENT_STATUS.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_4M_4_DOCUMENTED.md
docs/current/NEXT_STEPS.md
docs/current/TODO.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_4M_4_DOCUMENTED.md
```
