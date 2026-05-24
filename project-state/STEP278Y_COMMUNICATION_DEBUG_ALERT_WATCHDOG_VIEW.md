# STEP278Y - Communication Debug Alert Watchdog View

Ziel: Die bestehende Communication Debug View zeigt zusätzlich Real-Alert-Mirror, Alert-Timing und echtes Alert-Overlay-ACK an.

Änderungen:
- `htdocs/public/tools/communication_debug_view.html` auf Version 0.1.4 erweitert.
- Neue Karten: `Real Alert Mirror + Timing` und `Echtes Alert-Overlay ACK`.
- Auto-Refresh lädt zusätzlich:
  - `/api/alerts/bus-mirror/status`
  - `/api/alerts/overlay-watchdog/status`
- Neue Buttons:
  - Real Alert Mirror Status
  - Overlay Watchdog Status
  - Overlay Watchdog Check

Nicht geändert:
- Kein neues Backend-Modul.
- Keine DB-Migration.
- Keine Sound-/TTS-/Queue-/Overlay-Logik.
- Kein Ersatz von `broadcastWS`.

Test:
1. Backend neu starten.
2. `http://127.0.0.1:8080/public/tools/communication_debug_view.html` öffnen.
3. Einen echten Alert auslösen.
4. Karten `Real Alert Mirror + Timing` und `Echtes Alert-Overlay ACK` prüfen.
