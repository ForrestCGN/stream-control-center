# RDAP7H OAuth Callback Skeleton disabled

Stand: RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED  
Datum: 2026-06-23

## Zweck

RDAP7H bereitet serverseitig die spaeteren Twitch-OAuth-Start- und Callback-Pfade als Skeleton vor.

Wichtig: RDAP7H aktiviert keinen produktiven Login. Die neuen Routen sind bewusst disabled/read-only und antworten mit JSON statt Redirect, Token-Tausch, Cookie oder Session.

## Geaenderte Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/auth-twitch.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/README.md
docs/current/RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Neue disabled Skeleton-Routen

```text
GET /api/remote/auth/twitch/start
GET /api/remote/auth/twitch/callback
```

Beide Routen antworten absichtlich mit HTTP 403 und read-only JSON.

## Garantierte Nicht-Aktionen

```text
kein Twitch-Login aktiviert
kein Redirect zu Twitch
kein OAuth-Code-gegen-Token-Tausch
keine Cookies
keine Session-Erstellung
keine DB-Writes
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets im Repo oder Frontend
```

## Erwartete Start-Route

```text
GET /api/remote/auth/twitch/start
```

Erwartet:

```text
HTTP 403
ok: false
statusApiVersion: rdap7h.v1
error: twitch_oauth_start_disabled
readOnly: true
authEnabled: false
oauthEnabled: false
twitchOAuth.startRouteEnabled: false
twitchOAuth.redirectToTwitch: false
sessions.setCookie: false
sessions.createSession: false
databaseWriteEnabled: false
agentActionsEnabled: false
```

## Erwartete Callback-Route

```text
GET /api/remote/auth/twitch/callback
```

Erwartet:

```text
HTTP 403
ok: false
statusApiVersion: rdap7h.v1
error: twitch_oauth_callback_disabled
readOnly: true
authEnabled: false
oauthEnabled: false
twitchOAuth.callbackRouteEnabled: false
twitchOAuth.tokenExchangeEnabled: false
sessions.setCookie: false
sessions.createSession: false
databaseWriteEnabled: false
agentActionsEnabled: false
```

## Statusroute

```text
GET /api/remote/status
```

Erwartet:

```text
statusApiVersion: rdap7h.v1
auth.prepared: true
auth.enabled: false
auth.loginEnabled: false
auth.twitchOAuth.startRouteSkeletonPresent: true
auth.twitchOAuth.callbackRouteSkeletonPresent: true
auth.twitchOAuth.startRouteEnabled: false
auth.twitchOAuth.callbackRouteEnabled: false
auth.twitchOAuth.redirectToTwitch: false
auth.twitchOAuth.tokenExchangeEnabled: false
auth.sessions.createSession: false
auth.sessions.setCookie: false
safety.oauthStartRouteEnabled: false
safety.oauthCallbackRouteEnabled: false
safety.sessionCookieWriteEnabled: false
safety.databaseWriteEnabled: false
```

## Routenuebersicht

```text
GET /api/remote/routes
```

Muss die beiden Skeleton-Routen anzeigen, aber mit `enabled: false` und `productive: false`.

## Testplan lokal

Im Repo:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
npm run check
```

## Testplan Webserver nach Deploy

```bash
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/start
curl -i http://127.0.0.1:3010/api/remote/auth/twitch/callback
curl -sS http://127.0.0.1:3010/api/remote/status
curl -sS http://127.0.0.1:3010/api/remote/routes
```

Pruefen:

```text
kein HTTP 302
kein Location-Header zu Twitch
kein Set-Cookie-Header
Start/Callback HTTP 403 disabled
Status rdap7h.v1
Routes zeigen Skeleton disabled
```

## Rollback

Vor Webserver-Deploy muss `/opt/stream-control-center/remote-modboard/backend` nach `/var/backups/stream-control-center/` gesichert werden.

Rollback:

```bash
systemctl stop scc-remote-modboard.service
tar -xzf /var/backups/stream-control-center/<BACKUP>.tar.gz -C /opt/stream-control-center/remote-modboard
systemctl start scc-remote-modboard.service
systemctl status scc-remote-modboard.service --no-pager -l
```

## Naechster moeglicher Schritt

```text
RDAP7I_SESSION_STORE_READONLY_VALIDATION_LAYER
```

Erst nach eigenem Scope und ausdruecklichem go.
