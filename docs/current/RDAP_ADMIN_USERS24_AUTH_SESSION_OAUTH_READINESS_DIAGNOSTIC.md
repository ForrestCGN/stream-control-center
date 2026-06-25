# RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC

Stand: 2026-06-25
Projekt: stream-control-center / Remote-Modboard

## Ziel

RDAP24 ergänzt eine größere, aber weiterhin sichere Diagnose für Auth, Twitch-OAuth, Session und Cookie-Readiness.

Der Step aktiviert keinen Login und führt keine produktive Aktion aus.

## Neue Route

```text
GET /api/remote/auth/readiness-diagnostic
```

## Zweck der Route

Die Route zeigt read-only:

- ob die Env-Datei vorhanden ist,
- ob Auth/OAuth/Session effektiv aktiv sind,
- ob Twitch Client-ID/Secret als konfiguriert erkannt werden,
- ob Session- und OAuth-State-Secrets konfiguriert sind,
- ob DB grundsätzlich lesbar/konfiguriert ist,
- welche Session-Cookie-Namen geprüft würden,
- welches HTTP-Verhalten fuer Twitch Start/Callback zu erwarten ist,
- ob ein 302 auf `/api/remote/auth/twitch/start` fachlich korrekt wäre.

## Sicherheit

RDAP24 bleibt read-only:

```text
createsSession: false
setsCookie: false
updatesLastSeen: false
revokesSession: false
tokenExchangeExecuted: false
callsTwitchApi: false
redirectsToTwitch: false
writeEnabled: false
```

## Wichtiges Ergebnis fuer OAuth-Safety

Die bisherige Deploy-Safety darf nicht starr `403/403` erwarten, wenn Login bewusst aktiviert wird.

Korrekte Regel:

```text
Wenn Login/OAuth/Session deaktiviert sind:
/api/remote/auth/twitch/start    -> 403
/api/remote/auth/twitch/callback -> 403

Wenn Login/OAuth/Session bewusst aktiv sind:
/api/remote/auth/twitch/start    -> 302 Redirect zu Twitch
/api/remote/auth/twitch/callback ohne gueltigen State/Code -> 403
```

Damit ist `302/403` kein automatischer Fehler mehr, sondern kann bei bewusst aktivem Login korrekt sein.

## Geänderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/auth-status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/auth-session-oauth-readiness-diagnostic.service.js
```

## Nicht geändert

```text
Keine DB-Migration
Keine SQL-Ausführung
Keine User-/Rollen-/Session-Writes
Keine Admin-Notiz-Writes
Keine echten Admin-Notiztexte
Keine UI-Schreibbuttons
Keine Twitch-Token-Exchange-Ausführung
Keine Twitch-API-Abfrage
Keine Cookie-Erstellung
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend

node --check .\server.js
node --check .\src\routes\auth-status.routes.js
node --check .\src\routes\routes.routes.js
node --check .\src\services\auth-session-oauth-readiness-diagnostic.service.js
npm run check
```

## Server-Checks nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild, .writeEnabled, .actionEnabled, .productiveAgentRuntime'

curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .authSessionOauthReadinessDiagnostic'

curl -fsS http://127.0.0.1:3010/api/remote/auth/readiness-diagnostic | jq '.ok, .readOnly, .statusApiVersion, .expectedHttpBehaviour, .readiness.readyForLoginSmokeTest, .readiness.blockers'
```

## Erwartung

```text
moduleBuild: RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC
statusApiVersion: rdap_admin_users24.v1
readOnly: true
createsSession: false
setsCookie: false
tokenExchangeExecuted: false
callsTwitchApi: false
redirectsToTwitch: false
```

## Nächster sinnvoller Schritt

Nach Live-Bestätigung kann größer weitergeplant werden:

```text
RDAP25_LOGIN_SMOKE_TEST_SCOPE
```

Ziel dann:

- klare Entscheidung, ob Login testweise aktiviert werden soll,
- welche Env-Flags dafür bewusst geändert werden,
- welche DB-Tabellen Sessions/User/Identities nutzen,
- welcher Rollback nötig ist,
- wie der erste echte Login-Test erfolgt,
- weiterhin keine Admin-Notiz-Writes.
