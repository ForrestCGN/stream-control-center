# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-1 Loyalty Games Backend-Grundsystem v0.1.0

### Neu

- Neues Backend-Modul `loyalty_games`.
- Neues Wheel-Submodul.
- Neue Config `config/loyalty_games.json`.
- Neue DB-Tabelle `loyalty_game_sessions`.
- Backendseitige gewichtete Zufallsauswahl per `crypto.randomInt`.
- Spin-Session-Speicherung.
- WebSocket-Events fuer Wheel-Spin, Finish und Reset.
- Diagnose-/Registry-Eintrag fuer `loyalty_games`.
- Modul-Dokus fuer `loyalty_games` und `loyalty_wheel`.

### Nicht geaendert

- `backend/modules/loyalty.js` bleibt unveraendert.
- Keine Punktkosten.
- Keine Reward-Ausfuehrung.
- Kein Dashboard.
- Keine bestehenden produktiven Loyalty-Flows.

### Naechster Schritt

```text
STEP LWG-2 – Wheel Overlay an Backend-Event anbinden
```
