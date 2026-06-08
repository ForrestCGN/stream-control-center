# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4B Wheel Presets Backend v0.2.0

### Neu

- Wheel-Presets Backend.
- Preset-Felder Backend.
- Dreh-Verlauf fuer Preset-Spins.
- Neues lokales Preset-Modul `backend/modules/loyalty_games/presets.js`.
- `wheel.js` kann optional mit `presetUid` drehen.
- Standard-Preset wird einmalig aus Config-Feldern erzeugt.
- Preset-Spins werden in `loyalty_wheel_spins` gespeichert.
- EventBus/Broadcast-Events vorbereitet.

### Nicht geaendert

- Kein Giveaway.
- Keine Punktebuchung.
- Keine Reward-Ausfuehrung.
- Kein Dashboard-Preset-Editor.
