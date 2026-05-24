# CURRENT_SYSTEM_STATUS - STEP365 Append

STEP365 korrigiert den STEP360-Reconnect-Replay:

- Reconnect während laufendem Alert sendet weiterhin den aktuellen Alert erneut an das neu verbundene Overlay.
- Der Replay verwendet jetzt die verbleibende Restlaufzeit (`remainingMs`) statt der vollen `durationMs`.
- Dadurch verlängert ein OBS-Browserquellen-Reload die visuelle Alert-Anzeige nicht mehr künstlich.
- Sound/TTS/Queue bleiben unverändert.
