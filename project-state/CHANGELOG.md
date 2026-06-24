# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP AUTH1 Twitch Login live bestätigt

Stand:

```text
RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
```

Ergebnis:

- Twitch-Login live aktiviert
- OAuth-Start liefert HTTP 302 zu Twitch
- Browser-Login erfolgreich
- UI zeigt `Angemeldet als ForrestCGN`
- `/api/remote/status` bestätigt:
  - `.auth.enabled = true`
  - `.auth.loginEnabled = true`
  - `.auth.twitchOAuth.effectiveEnabled = true`
  - `.auth.sessions.effectiveEnabled = true`

Sicherheitsnotiz:

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` wurden im Chat sichtbar und müssen rotiert werden.
- Twitch Client-ID ist öffentlich unkritisch.
- Twitch Client-Secret darf nicht veröffentlicht werden.

Nicht geändert:

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Migration
