# RDAP AUTH1 - Twitch Login gated

Stand: RDAP_AUTH1_TWITCH_LOGIN_GATED
Datum: 2026-06-24

## Ziel

AUTH1 bereitet Twitch-Login und Session-Erkennung vor, bleibt aber ohne bewusste Env-Freischaltung deaktiviert.

## Gating

Ohne diese Werte bleibt OAuth Start/Callback gesperrt:

```text
AUTH_ENABLED=true
TWITCH_OAUTH_ENABLED=true
SESSION_ENABLED=true
AUTH_SESSION_WRITE_ENABLED=true
TWITCH_CLIENT_ID=...
TWITCH_CLIENT_SECRET=...
SESSION_SECRET=...
OAUTH_STATE_SECRET=...
```

## Schreibbereich

Wenn aktiv, schreibt AUTH1 nur in:

```text
dashboard_users
dashboard_identities
dashboard_sessions
```

Keine Remote-Writes, keine Agent-Actions, keine OBS-/Sound-/Overlay-/Command-Steuerung.

## Sicherheit

- OAuth State per HMAC-signiertem HttpOnly-Cookie
- Session-Cookie HttpOnly, Secure, SameSite=Lax
- Token wird nur kurz gegen Twitch genutzt und nicht gespeichert
- `last_seen_at` wird in AUTH1 nicht aktualisiert
- Logout widerruft nur die aktuelle Session
