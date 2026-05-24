# NEXT_STEPS

## Direkt nach STEP277A_FIX6

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Ausführen:

```cmd
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP277A_FIX6 Clip-Shoutout Avatar Sanitize"
```

3. Backend neu starten, falls Node nicht automatisch neu startet.
4. OBS-Browserquelle `sound_system_overlay.html` aktualisieren.

## Tests

- Status prüfen:

```text
http://127.0.0.1:8080/api/clip-shoutout/status
```

Erwartet: `version: 5`, `step: STEP277A_FIX6`.

- Testlauf:

```text
http://127.0.0.1:8080/api/clip-shoutout/run?target=bynexl&userLogin=forrestcgn&displayName=ForrestCGN
```

- Prüfen:
  - `target.avatarUrl` ist eine echte `https://...` URL.
  - `visual.avatarUrl` ist eine echte `https://...` URL.
  - Overlay zeigt Avatar oder sauberen Buchstaben-Fallback.
  - Video läuft weiter sauber durch.

## Danach

- Optional TTS nach Clip aktivieren/testen.
- Chatmeldung nur testen, wenn Twitch-Presence aktiv ist.
- Untracked alte NEXT_CHAT_START-Dateien gezielt aufräumen.
