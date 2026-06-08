# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-2.1 Wheel Overlay Repeat Spin Fix

### Fix

- Wiederholte Spins im bereits offenen Wheel-Overlay korrigiert.
- `currentRotation` behaelt jetzt die volle Gesamtrotation.
- Die Normalisierung wird nur noch fuer die Zielberechnung genutzt.

### Nicht geaendert

- Kein Backend.
- Keine Config.
- Keine Datenbank.
- Keine Punktkosten.
- Keine Reward-Ausfuehrung.
- Kein Dashboard.

## 2026-06-08 – STEP LWG-2 Wheel Overlay Backend-Event

### Neu

- `htdocs/overlays/loyalty/wheel_overlay.html` hinzugefuegt.
- Wheel-Assets unter `htdocs/assets/images/loyalty/wheel/` mitgeliefert.
- Overlay verbindet sich per WebSocket.
- Overlay hoert auf `loyalty.wheel.spin`.
- Overlay rendert Felder aus dem Backend-Event.
- Overlay dreht nur den Felder-Layer.
- Center, Aussenring und Pointer bleiben statisch.
- Winner-Banner zeigt Backend-Ergebnis.
- Modul-Dokus aktualisiert.

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
