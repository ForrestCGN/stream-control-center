# EMERGENCY_ROLLBACK_EVS52_21_STABLE

Ziel: Sofortiger Rücksprung auf den zuletzt funktionierenden EVS52.21/EVS52.19-Stabilstand.

Enthalten:
- backend/modules/stream_events.js aus EVS52.19 (Finale Manual End)
- htdocs/dashboard/modules/stream_events.js aus EVS52.21 (Replay-Button)
- htdocs/overlays/stream_events/event_winner_overlay.html aus EVS52.21/No-Restart-Loop-Stand
- htdocs/dashboard/modules/stream_events.css vollständig wiederhergestellt

Bewusst NICHT enthalten:
- EVS52.22 Reveal-Video Media-ID-Fix, weil der Stream zuerst stabilisiert werden muss.

Nach Einspielen:
- Backend neu starten
- Dashboard hart neu laden
- Status prüfen
