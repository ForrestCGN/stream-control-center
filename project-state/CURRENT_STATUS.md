# CURRENT STATUS - stream-control-center

Stand: RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
Datum: 2026-06-24

## Aktueller bestätigter Stand

```text
RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
```

## Live bestätigt

Remote-Modboard:

```text
https://mods.forrestcgn.de/
```

Twitch-Login ist live aktiv und erfolgreich getestet.

Browseranzeige:

```text
Angemeldet als ForrestCGN
```

API-Status:

```text
.auth.enabled = true
.auth.loginEnabled = true
.auth.twitchOAuth.effectiveEnabled = true
.auth.sessions.effectiveEnabled = true
```

## AUTH1 aktiv

AUTH1 umfasst:

- Twitch OAuth Start
- Twitch OAuth Callback
- OAuth State/CSRF-Schutz
- Session-Cookie
- Session-Erkennung über `/api/remote/auth/me`
- UI-Loginstatus
- Logout-Button

## Wichtiger Sicherheitsstatus

Die im Chat sichtbaren `SESSION_SECRET` und `OAUTH_STATE_SECRET` müssen rotiert werden.

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

## Weiterhin nicht aktiv

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine produktive Permission-Middleware für Writes
- keine Migration

## Nächster Fokus

```text
RDAP_DASHBOARD1_PROTECTED_SHELL
```

Geschützte Dashboard-Shell mit Navigation und Loginanzeige, aber weiter ohne gefährliche Steueraktionen.
