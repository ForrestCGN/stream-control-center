# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-3 Loyalty Games Dashboard Read-only

### Neu

- `htdocs/dashboard/modules/loyalty_games.js` hinzugefuegt.
- `htdocs/dashboard/modules/loyalty_games.css` hinzugefuegt.
- `htdocs/dashboard/index.html` um Loyalty-Games-Dashboard-Dateien und Panel erweitert.
- Community-Dashboard bekommt einen read-only Bereich `Loyalty Games`.
- Anzeige fuer Modulstatus, Wheel, Felder, Sessions und Hinweise.
- Doku aktualisiert.

### Nicht geaendert

- Kein Backend.
- Keine Config-Save-Route.
- Keine Datenbankmigration.
- Keine Punktkosten.
- Keine Reward-Ausfuehrung.
- Keine Aenderung an `backend/modules/loyalty.js`.

## 2026-06-08 – STEP LWG-2.1 Wheel Overlay Repeat Spin Fix

### Fix

- Wiederholte Spins im bereits offenen Wheel-Overlay korrigiert.
- `currentRotation` behaelt jetzt die volle Gesamtrotation.

## 2026-06-08 – STEP LWG-2 Wheel Overlay Backend-Event

### Neu

- `htdocs/overlays/loyalty/wheel_overlay.html` hinzugefuegt.
- Overlay hoert auf `loyalty.wheel.spin`.

## 2026-06-08 – STEP LWG-1 Loyalty Games Backend-Grundsystem v0.1.0

### Neu

- Neues Backend-Modul `loyalty_games`.
- Neues Wheel-Submodul.
- Neue Config `config/loyalty_games.json`.
- Neue DB-Tabelle `loyalty_game_sessions`.
