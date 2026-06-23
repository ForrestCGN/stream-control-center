# RDAP7F Twitch OAuth Dry-Run Plan

Stand: RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN  
Datum: 2026-06-23

## Zweck

RDAP7F plant den spaeteren Twitch-OAuth-Dry-Run fuer das Remote-Modboard unter `https://mods.forrestcgn.de`.

Dieser Step ist bewusst nur Planung/Doku.

Es wird kein produktiver Login aktiviert. Es werden keine Cookies gesetzt, keine Sessions erstellt, keine DB-Writes ausgefuehrt und keine Agent-/OBS-/Sound-/Overlay-/Command-Aktionen freigeschaltet.

## Gepruefter echter Repo-Stand

Gepruefte Dateien aus GitHub/dev:

```text
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/.env.example
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-status.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/security/safety.js
```

Aktueller Remote-Modboard-Code bleibt read-only:

```text
moduleBuild: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
agentActionsEnabled: false
```

`server.js` startet nur den vorhandenen read-only Service und loggt die Sicherheitsflags. `app.js` registriert nur die bestehenden Read-only-Routen. `safety.js` blockiert weiterhin Writes, Auth-Aktivierung, Sessions, Agent-Actions, OBS/Sound/Overlay/Command-Steuerung, freie Shell-/Datei-/Prozessbefehle und Secrets im Frontend.

## Twitch-OAuth-Flow fuer spaetere Umsetzung

Fuer das Remote-Modboard soll spaeter der Authorization Code Flow verwendet werden.

Begruendung:

```text
- Remote-Modboard laeuft serverseitig.
- Client Secret darf nur serverseitig liegen.
- Callback kann serverseitig State/CSRF pruefen.
- Spaetere Sessions duerfen nur serverseitig und nach Permission-Konzept entstehen.
```

Nicht verwenden:

```text
Implicit Flow
```

Begruendung: Der Token landet clientseitig im Browser-Fragment und passt nicht zum geplanten serverseitigen Auth-/Permission-/Audit-Modell.

## Twitch Developer Console Anforderungen

In der Twitch Developer Console wird spaeter eine eigene App fuer das Remote-Modboard benoetigt.

Geplante Werte:

```text
App-Name: ForrestCGN Stream Control Center Remote Modboard
Kategorie: Website Integration / Application passend zur Twitch Console Auswahl
OAuth Redirect URL:
https://mods.forrestcgn.de/api/remote/auth/twitch/callback
```

Wichtig:

```text
- Twitch verlangt eine registrierte Redirect URL.
- Die Redirect URL muss exakt zur spaeter verwendeten redirect_uri passen.
- Client ID ist oeffentlich.
- Client Secret ist geheim und darf niemals ins Repo, Frontend, Logs oder in den Chat.
- Ein neues Twitch Client Secret kann alte Secrets ungueltig machen.
```

## Geplante spaetere Routen

Noch nicht bauen in RDAP7F.

Fuer spaetere Steps geplant:

```text
GET /api/remote/auth/twitch/start
GET /api/remote/auth/twitch/callback
POST /api/remote/auth/logout
GET /api/remote/auth/me
GET /api/remote/auth/session-status
```

Aktueller Stand:

```text
/api/remote/auth/me
/api/remote/auth/session-status
```

Diese beiden Routen existieren bereits nur als read-only Status-Endpunkte. Sie duerfen in RDAP7F nicht zu echten Session-/Login-Endpunkten umgebaut werden.

## Benoetigte ENV-Werte fuer spaetere Steps

Noch nicht produktiv aktivieren in RDAP7F.

Geplante neue ENV-Werte fuer `/etc/stream-control-center/remote-modboard.env`:

```text
TWITCH_OAUTH_ENABLED=false
TWITCH_CLIENT_ID=
TWITCH_CLIENT_SECRET=
TWITCH_OAUTH_REDIRECT_URL=https://mods.forrestcgn.de/api/remote/auth/twitch/callback
TWITCH_OAUTH_SCOPES=
TWITCH_OAUTH_FORCE_VERIFY=false

SESSION_ENABLED=false
SESSION_COOKIE_NAME=scc_remote_session
SESSION_SECRET=
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTP_ONLY=true
SESSION_COOKIE_SAME_SITE=Lax
SESSION_TTL_SECONDS=28800

AUTH_STATE_TTL_SECONDS=600
AUTH_STATE_COOKIE_NAME=scc_oauth_state
```

Regeln:

```text
- Echte Werte nur auf dem Server in /etc/stream-control-center/remote-modboard.env.
- Keine echten Secrets in .env.example.
- Keine Secrets ins Repo.
- Keine Secrets ins Frontend.
- Keine Secrets in Logs.
- Session-/OAuth-Flags standardmaessig false.
```

## Scope-Plan fuer Twitch-Scopes

Fuer den ersten spaeteren Dry-Run sollen keine produktiven Twitch-Aktionsrechte angefordert werden.

Empfehlung fuer den ersten echten Login-Test:

```text
TWITCH_OAUTH_SCOPES=
```

Der erste Login soll nur Identitaet pruefen, noch keine Channel-/Mod-/Chat-/OBS-/Sound-Rechte.

Wenn Twitch fuer User-Identitaet spaeter explizite Scopes benoetigt, wird das separat dokumentiert und minimal gehalten.

Nicht im ersten Dry-Run:

```text
chat:read
chat:edit
channel:manage:*
moderator:*
channel:read:redemptions
channel:manage:redemptions
```

Diese Scopes koennen spaeter fuer bestimmte Module relevant werden, duerfen aber nicht pauschal in den Dashboard-Login.

## State-/CSRF-Konzept

Spaeterer OAuth-Start muss einen kryptografisch zufaelligen `state` erzeugen.

Geplante Regel:

```text
state = zufaelliger Wert, mindestens 128 Bit Entropie
state wird serverseitig oder in signiertem/HttpOnly/SameSite-Cookie temporaer abgelegt
TTL: 10 Minuten
state wird beim Callback exakt verglichen
state wird nach Verwendung sofort ungueltig
```

Callback muss abbrechen bei:

```text
fehlendem state
unbekanntem state
abgelaufenem state
bereits verwendetem state
state mismatch
fehlendem code
error=access_denied
unerwarteter redirect_uri
OAuth disabled
Session disabled
```

## Callback-/Token-Regel fuer spaetere Steps

Spaeterer Callback darf den Authorization Code nur dann gegen Tokens tauschen, wenn:

```text
TWITCH_OAUTH_ENABLED=true
SESSION_ENABLED=true
state gueltig
redirect_uri exakt passt
client_id konfiguriert
client_secret serverseitig konfiguriert
```

Token-Verarbeitung spaeter:

```text
- Token niemals ans Frontend geben.
- Access-/Refresh-Token niemals loggen.
- Token nur serverseitig verwenden.
- Fuer reine Dashboard-Session moeglichst keine Twitch-Tokens dauerhaft speichern, wenn nicht noetig.
- Falls Token-Speicherung spaeter noetig wird: eigener Plan mit Verschluesselung/Rotation/DB-Regeln.
```

## Session-Regel fuer spaetere Steps

Session-Erstellung bleibt in RDAP7F verboten.

Spaeter darf Session-Erstellung nur aktiv werden, wenn:

```text
SESSION_ENABLED=true
TWITCH_OAUTH_ENABLED=true
Auth-DB bereit
User-Resolution geplant
Rollen-/Rechte-Mapping geplant
Audit-/Logging-Regel mindestens fuer Login/Logout definiert
Cookie-Flags sicher gesetzt
```

Cookie-Regeln spaeter:

```text
HttpOnly: true
Secure: true
SameSite: Lax oder Strict, bewusst entscheiden
Path: /api/remote oder /, bewusst entscheiden
MaxAge/Expires passend zur Session-TTL
```

## User-Resolution fuer spaetere Steps

Nach erfolgreichem Twitch-OAuth muss spaeter eine Twitch-Identitaet auf Dashboard-User gemappt werden.

Geplante Reihenfolge:

```text
1. Twitch user id lesen.
2. dashboard_identities nach provider=twitch und provider_user_id suchen.
3. dazu dashboard_users laden.
4. Rollen ueber dashboard_user_roles laden.
5. Gruppen ueber dashboard_user_groups laden.
6. effektive Permissions serverseitig berechnen.
7. Session nur erstellen, wenn User erlaubt/aktiv ist.
```

Nicht erlaubt:

```text
- jeder Twitch-User bekommt automatisch Rechte
- VIP bekommt automatisch Dashboard-Grundrechte
- sound_profi als Rolle mit globalen Rechten behandeln
- Frontend entscheidet ueber Rechte
```

## Fehler-/Stop-Punkte

Sofort stoppen und nicht weiterbauen, wenn einer dieser Punkte eintritt:

```text
Twitch Client Secret wuerde ins Repo/Frontend/Chat geraten
Callback soll produktiv freigeschaltet werden, bevor State/CSRF geplant ist
Session-Erstellung soll ohne Permission-Konzept aktiv werden
DB-Writes waeren fuer RDAP7F noetig
Agent-Actions sollen waehrend Auth-Dry-Run aktiviert werden
OBS/Sound/Overlay/Command-Steuerung wird beruehrt
freie Shell-/Datei-/Prozessbefehle werden vorgeschlagen
Redirect URL ist nicht eindeutig
Repo- und Live-Stand widersprechen sich
```

## Testplan fuer spaeteren Dry-Run

Nicht in RDAP7F ausfuehren.

Spaeterer Testplan in RDAP7G/RDAP7H:

```text
1. ENV nur auf Server setzen, Flags weiter false.
2. Service neu starten.
3. /api/remote/status pruefen.
4. /api/remote/auth/me pruefen: loggedIn false.
5. /api/remote/auth/session-status pruefen: keine Session.
6. OAuth-Start-Route erst disabled testen: muss sauber blockieren.
7. Callback-Route disabled testen: muss sauber blockieren.
8. Erst danach mit separatem go temporaeren Dry-Run erlauben.
```

Erwartung solange disabled:

```text
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
keine Set-Cookie Header
keine dashboard_sessions Writes
keine Agent-Actions
```

## Rollback-/Disable-Regel

OAuth muss jederzeit hart deaktivierbar bleiben:

```text
TWITCH_OAUTH_ENABLED=false
SESSION_ENABLED=false
```

Rollback spaeter:

```text
1. ENV Flags auf false.
2. Service restart.
3. /api/remote/auth/me und /api/remote/auth/session-status pruefen.
4. Sicherstellen: keine neuen Cookies, keine Session-Erstellung, loggedIn false.
```

Falls spaeter Code-Routen gebaut werden:

```text
- Routes bleiben registriert, aber disabled.
- Disabled muss serverseitig blockieren.
- Frontend-Buttons sind keine Sicherheitsbarriere.
```

## Bekannte Auffaelligkeit fuer RDAP7G

In `remote-modboard/backend/.env.example` wirkt die Beispielbelegung von `DB_NAME` und `DB_USER` gegenueber dem dokumentierten Live-Stand vertauscht.

Dokumentierter Live-Stand:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Aktuelle `.env.example` Beispielzeilen:

```text
DB_NAME=c1stream_control
DB_USER=c3stream_control
```

RDAP7F aendert das bewusst nicht, weil dieser Step nur OAuth-Dry-Run-Planung dokumentiert. Vor RDAP7G/ENV-Prep muss das gezielt geprueft und bei bestaetigtem Fehler korrigiert werden.

## Nicht-Aenderungen in RDAP7F

```text
kein Code geaendert
kein Twitch-Login aktiviert
kein OAuth-Callback produktiv freigeschaltet
keine Cookies gesetzt
keine Session-Erstellung
keine DB-Writes
keine Agent-Actions
keine OBS-Steuerung
keine Sound-Steuerung
keine Overlay-Steuerung
keine Command-Steuerung
keine Secrets ins Repo oder Frontend
keine Service-Aenderung
kein Server-Deploy
```

## Naechster sinnvoller Step nach RDAP7F

```text
RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED
```

Ziel:

```text
ENV-/Server-Vorbereitung fuer Twitch OAuth, weiterhin disabled, ohne Login-Aktivierung.
```

RDAP7G darf erst nach ausdruecklichem go geplant werden.
