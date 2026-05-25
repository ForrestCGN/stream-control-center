# Current System Status – STEP460

Stand: STEP460_SHOUTOUT_DISPLAY_QUEUE_CHAT_TARGET_AND_RUNTIME_FIX

- `backend/modules/clip_shoutout.js` Runtime-Version: `0.2.3`
- Test-Command bleibt bewusst über Config bei `!vso`.
- Shouti-Chatannahme nutzt wieder das echte Ziel (`@urlug`) statt den Auslöser/Forrest.
- Display-Queue-Status setzt `nextDisplayAllowedAt` während einer aktiven Anzeige nicht mehr als laufenden Start-Cooldown.
- Status ergänzt: `activeTarget`, `activeTargetDisplay`, `cooldownRunning`, `cooldownRemainingMs`.
- Display-Cooldown startet weiterhin erst nach Ende der Shouti-Anzeige.
