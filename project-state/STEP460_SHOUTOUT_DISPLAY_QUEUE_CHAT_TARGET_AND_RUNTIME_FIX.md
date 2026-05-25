# STEP460_SHOUTOUT_DISPLAY_QUEUE_CHAT_TARGET_AND_RUNTIME_FIX

## Ziel

Korrektur der STEP459-Testprobleme beim Clip-Shoutout-System.

## Änderungen

- Runtime-Version: `clip_shoutout.js` → `0.2.3`
- Der Annahme-Chattext nutzt wieder das echte Ziel:
  - vorher möglich: `Shouti für @ForrestCGN aufgenommen.`
  - jetzt: `Shouti für @urlug aufgenommen.`
- Der Status der Display-Queue unterscheidet aktive Anzeige und Cooldown nach Anzeige-Ende:
  - `activeTarget`
  - `activeTargetDisplay`
  - `cooldownRunning`
  - `cooldownRemainingMs`
- Während eine Anzeige aktiv ist, wird `nextDisplayAllowedAt` leer ausgegeben.
- Der eigentliche Cooldown bleibt: Start erst nach Ende der Shouti-Anzeige.

## Nicht geändert

- Kein Wechsel auf `!so`.
- `!vso` bleibt Test-Command, solange die gespeicherte Config dies setzt.
- Sound-System, Alert-System, VIP-System und Twitch-Modul wurden nicht geändert.
- SQLite wird nicht ersetzt.
