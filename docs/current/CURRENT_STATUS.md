# Current Status

Aktueller Loyalty-/Giveaway-Stand: STEP LWG-4N.7 vorbereitet.

Claim/Spin nutzt jetzt die Felder des Giveaway-Bound-Wheels statt das globale Preset als Runtime-Feldbasis.

## Zusätzlicher bestätigter Hotfix-Stand – AutoShout

```text
STEP AUTOSHOUT-HOTFIX.1 – AutoShout autoRawMessage/instantTrigger Fix dokumentiert
```

Bestätigt am 2026-06-09:

- `clip_shoutout` läuft mit `moduleVersion: 0.2.42`.
- Der Runtime-Fehler `autoRawMessage is not defined` ist behoben.
- AutoShout zählt wieder Chatnachrichten über Twitch-Presence.
- Die 2-Nachrichten-Regel wurde mit `forrestcgn` erfolgreich getestet.
- `!lurk` als erste Nachricht wurde erfolgreich als Instant-Trigger getestet.
- `lastError` blieb nach dem Test leer.

Nicht geändert:

- keine Queue-Logik umgebaut
- keine Twitch-Presence-Logik umgebaut
- keine Streamer.bot-Logik umgebaut
- keine produktive SQLite-Datei ersetzt oder neu aufgebaut
