# RDAP AUTH1 - Twitch Login live bestätigt

Stand: RDAP_AUTH1_TWITCH_LOGIN_LIVE_CONFIRMED
Datum: 2026-06-24

## Ergebnis

Der Twitch-Login für das Remote-Modboard ist live aktiviert und erfolgreich getestet.

## Live-URL

```text
https://mods.forrestcgn.de/
```

## Bestätigt

Im Browser sichtbar:

```text
Angemeldet als ForrestCGN
```

Serverseitig bestätigt:

```text
.auth.enabled = true
.auth.loginEnabled = true
.auth.twitchOAuth.effectiveEnabled = true
.auth.sessions.effectiveEnabled = true
```

## OAuth-Start bestätigt

```text
GET /api/remote/auth/twitch/start
HTTP 302
location: https://id.twitch.tv/oauth2/authorize?client_id=...
```

## Session/OAuth-Sicherheit

Bestätigt / vorgesehen:

- OAuth-State-Cookie wird gesetzt
- Cookie ist `HttpOnly`
- Cookie ist `Secure`
- Cookie nutzt `SameSite=Lax`
- Twitch Client-ID ist öffentlich unkritisch
- Twitch Client-Secret darf nicht in Chat/Repo/Logs erscheinen
- Session- und OAuth-State-Secrets wurden im Chat sichtbar und müssen neu rotiert werden

## Wichtiger Nachschritt: Secrets rotieren

Da die zunächst generierten `SESSION_SECRET` und `OAUTH_STATE_SECRET` im Chat sichtbar waren, müssen sie ersetzt werden.

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

Danach Browser neu laden und ggf. erneut einloggen.

## Schreibumfang AUTH1

AUTH1 darf nur für Login/Session schreiben:

```text
dashboard_users
dashboard_identities
dashboard_sessions
```

Nicht erlaubt / nicht geändert:

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine Migration
- keine freien Shell-/Datei-/Prozessbefehle
- keine Secrets im Frontend/Repo/Chat/Logs

## Nächster sinnvoller Schritt

```text
RDAP_DASHBOARD1_PROTECTED_SHELL
```

Ziel:

- geschützte Dashboard-Shell
- eingeloggter User sichtbar oben rechts
- Navigation/Sidebar
- erste geschützte read-only Seiten
- keine gefährlichen Steueraktionen
