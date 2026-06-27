# RDAP7G Twitch OAuth ENV/Server Prep Disabled

Stand: RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED  
Datum: 2026-06-23

## Zweck

RDAP7G bereitet das Remote-Modboard technisch auf einen spaeteren Twitch-OAuth-Dry-Run vor, ohne produktiven Login zu aktivieren.

Der Step ist bewusst konservativ:

```text
OAuth vorbereitet: ja
OAuth effektiv aktiv: nein
Session-Erstellung: nein
Cookies setzen: nein
DB-Writes: nein
Agent-Actions: nein
OBS-/Sound-/Overlay-/Command-Steuerung: nein
```

## Geaenderte Dateien

```text
remote-modboard/backend/.env.example
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/security/safety.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/README.md
docs/current/RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Wichtigste Korrektur

In `.env.example` waren `DB_NAME` und `DB_USER` gegenueber dem bestaetigten Live-/Projektstand vertauscht.

Bestaetigter Stand:

```text
DB_NAME=c3stream_control
DB_USER=c1stream_control
```

RDAP7G korrigiert nur die Beispiel-ENV-Datei. Es werden keine echten Server-Secrets dokumentiert und keine produktive Server-ENV durch dieses ZIP direkt geaendert.

## Neue ENV-Platzhalter

```text
TWITCH_OAUTH_ENABLED=false
TWITCH_CLIENT_ID=change-me-on-server-only
TWITCH_CLIENT_SECRET=change-me-on-server-only
TWITCH_REDIRECT_URI=https://mods.forrestcgn.de/api/remote/auth/twitch/callback
TWITCH_OAUTH_SCOPES=

SESSION_ENABLED=false
SESSION_COOKIE_NAME=scc_remote_session
SESSION_SECRET=change-me-on-server-only
OAUTH_STATE_SECRET=change-me-on-server-only
```

Regeln:

```text
TWITCH_CLIENT_SECRET niemals ins Repo
SESSION_SECRET niemals ins Repo
OAUTH_STATE_SECRET niemals ins Repo
keine Secrets ins Frontend
keine Secrets in Logs
```

## Config-Verhalten

`config.service.js` liest die neuen ENV-Werte ein, meldet aber nur sichere Diagnosewerte.

Wichtig:

```text
auth.authEnabled = false
auth.sessionCreationEnabled = false
auth.twitchOAuth.effectiveEnabled = false
auth.sessions.effectiveEnabled = false
```

`requestedEnabled` zeigt nur an, ob ein ENV-Flag gesetzt wurde. Es aktiviert keine Funktion.

## Safety-Verhalten

`safety.js` meldet jetzt zusaetzlich:

```text
authPrepared: true
authEnabled: false
oauthPrepared: true
oauthEnabled: false
twitchOAuthPrepared: true
twitchOAuthEnabled: false
oauthStartRouteEnabled: false
oauthCallbackRouteEnabled: false
sessionCreationEnabled: false
sessionCookieWriteEnabled: false
```

Damit ist im Status sichtbar: OAuth ist vorbereitet, aber nicht produktiv aktiv.

## Statusroute

`GET /api/remote/status` meldet ab RDAP7G:

```text
statusApiVersion: rdap7g.v1
auth.prepared: true
auth.enabled: false
auth.loginEnabled: false
auth.twitchOAuth.effectiveEnabled: false
auth.sessions.effectiveEnabled: false
```

Die Route bleibt read-only.

## Bewusst nicht gebaut

```text
keine /api/remote/auth/twitch/start Route
keine /api/remote/auth/twitch/callback Route
kein Redirect zu Twitch
kein Token-Austausch
keine Twitch-API-Anfrage
keine Session-Erstellung
kein Set-Cookie
kein dashboard_sessions Write
kein dashboard_users Write
kein Rollen-/Gruppen-Write
keine Agent-Aktion
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Server-ENV Vorbereitung nach Deploy

Erst nach erfolgreichem Deploy/Test kann auf dem Webserver die echte ENV-Datei manuell um Platzhalter erweitert werden.

Pfad:

```text
/etc/stream-control-center/remote-modboard.env
```

Wichtig: Auch dort bleiben die Flags fuer RDAP7G deaktiviert:

```text
TWITCH_OAUTH_ENABLED=false
SESSION_ENABLED=false
```

Echte Secrets werden nur auf dem Server eingetragen, niemals im Repo und niemals im Chat.

## Testplan

Nach Einspielen des ZIPs:

```text
npm run check
```

Danach Remote-Status pruefen:

```text
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
```

Erwartet:

```text
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
auth.enabled: false
auth.loginEnabled: false
auth.twitchOAuth.effectiveEnabled: false
auth.sessions.effectiveEnabled: false
safety.oauthStartRouteEnabled: false
safety.oauthCallbackRouteEnabled: false
```

Weiterhin nicht vorhanden:

```text
/api/remote/auth/twitch/start
/api/remote/auth/twitch/callback
```

Falls diese Routen erreichbar sind, ist der Step falsch und muss gestoppt werden.

## Rollback

Bei Problemen:

```text
stepundo.cmd
```

Auf dem Webserver bleiben die Sicherheitsflags weiterhin disabled:

```text
TWITCH_OAUTH_ENABLED=false
SESSION_ENABLED=false
```

Falls eine Server-ENV manuell ergaenzt wurde, duerfen echte Secrets nicht in Ausgaben kopiert werden.

## Naechster moeglicher Step

```text
RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED
```

RDAP7H darf nur nach neuem Scope und ausdruecklichem go geplant werden. Auch dort darf noch kein produktiver Login aktiviert werden, solange das nicht ausdruecklich freigegeben ist.
