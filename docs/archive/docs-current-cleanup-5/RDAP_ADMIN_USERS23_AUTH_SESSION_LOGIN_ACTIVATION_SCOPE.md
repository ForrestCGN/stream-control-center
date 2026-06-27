# RDAP_ADMIN_USERS23_AUTH_SESSION_LOGIN_ACTIVATION_SCOPE

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: groesserer Scope-/Readiness-Step fuer Auth, Session, Permission und naechste Admin-Notiz-Anzeige

## Zweck

RDAP23 fasst die naechsten noetigen Auth-/Session-Schritte groesser zusammen, damit nicht fuer jede Kleinigkeit ein einzelner Mini-Plan entsteht.

Ziel ist nicht, produktive Admin-Notiztexte sofort freizuschalten. Ziel ist, die Login-/Session-/Permission-Kette so vorzubereiten und zu pruefen, dass danach ein echter read-only Admin-Notiz-Display-Step sinnvoll gebaut werden kann.

## Bestaetigter Stand

```text
RDAP16: Tabelle dashboard_user_admin_notes existiert, schemaReady true, rowCount 0.
RDAP17/17B: Admin-Notiz Read-Diagnostic funktioniert und ist in /api/remote/routes sichtbar.
RDAP20: admin.users.note.read Permission-Diagnostic ist live.
RDAP20 unauthentifiziert: HTTP 401 Unauthorized, reason not_logged_in_or_session_invalid.
RDAP21: Display-Readiness geplant.
RDAP22: echte Admin-Notiz-Read-Route geplant, aber noch nicht gebaut.
```

Weiterhin gilt:

```text
Keine Admin-Notiz-Writes.
Keine Notiztext-Ausgabe ohne Login/Session/Permission.
Keine UI-Schreibbuttons.
Keine User-/Rollen-/Session-Admin-Writes ausserhalb eines eigenen Auth-Scopes.
Keine Community-Seiten duerfen Admin-Notizen lesen oder anzeigen.
```

## Wichtige technische Erkenntnisse

### 1. Auth-/Login-Routen existieren vorbereitet

Vorhandene Routenstruktur:

```text
GET  /api/remote/auth/login/plan
GET  /api/remote/auth/login/start
GET  /api/remote/auth/twitch/start
GET  /api/remote/auth/twitch/callback
POST /api/remote/auth/logout
GET  /api/remote/auth/me
GET  /api/remote/auth/session-status
GET  /api/remote/auth/permissions/check
```

### 2. Twitch OAuth ist gated

`/api/remote/auth/twitch/start` kann je nach Env-Konfiguration redirecten oder blockieren. Aktuell wurde beim Deploy-Safety-Check mehrfach gesehen:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
```

Das ist als eigener offener Punkt zu behandeln, weil das Deploy-Script offenbar noch 403/403 erwartet, obwohl Start bereits einen Redirect liefern kann.

### 3. Session-Read-Service ist read-only vorhanden

`auth-session-read.service.js` kann Session-Cookies lesen und in `dashboard_sessions` read-only validieren. Er setzt keine Cookies, erstellt keine Sessions und aktualisiert kein `last_seen_at`.

### 4. Permission-Read-Service ist read-only vorhanden

`auth-permission-read.service.js` kann fuer eine gueltige Session den Permission-Kontext lesen:

```text
dashboard_users
dashboard_user_roles
dashboard_user_groups
dashboard_role_permissions
dashboard_module_permissions
```

Er bleibt read-only und aktiviert keinen Login.

## RDAP23 Scope

RDAP23 darf groesser sein als die letzten Mini-Steps, aber bleibt kontrolliert.

Erlaubt fuer den naechsten Code-Step:

```text
1. Auth-/Session-/OAuth-Status konsolidieren.
2. Eine klare Readiness-/Diagnostic-Route fuer Login-Aktivierung bauen.
3. /api/remote/routes synchronisieren.
4. Deploy-Safety 302/403 sauber dokumentieren oder diagnostisch ausgeben.
5. Keine Admin-Notiztexte ausgeben.
6. Keine Admin-Notiz-Writes.
7. Keine UI-Schreibbuttons.
```

Nicht erlaubt in RDAP23:

```text
Kein Aktivieren produktiver Notiztext-Anzeige.
Kein Erstellen/Bearbeiten/Loeschen von Admin-Notizen.
Kein Rollen-/Permission-Write.
Kein Session-Write ohne separaten Auth-Go.
Kein Twitch-OAuth produktiv einschalten, ohne eigene Vorpruefung.
Keine Community-Anzeige von Admin-Notizen.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Empfohlener naechster Code-Step: RDAP24

Statt noch mehr Mini-Plan-Steps sollte RDAP24 ein groesserer, aber sicherer Code-Step werden:

```text
RDAP24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC
```

### Ziel RDAP24

Eine zentrale Diagnose bauen, die ohne Writes klar zeigt:

```text
Auth enabled/requested/effective
Login enabled/requested/effective
Twitch OAuth prepared/requested/effective
OAuth Start Route expected HTTP behavior
OAuth Callback Route expected HTTP behavior
Session enabled/requested/effective
Session cookie name
Session DB table readiness
Permission read readiness
admin.users.note.read readiness
ob echte Admin-Notiz-Anzeige blockiert bleiben muss
```

### Vorgeschlagene Route

```text
GET /api/remote/auth/readiness-diagnostic
```

### Erwartetes Verhalten ohne produktive Aktivierung

```json
{
  "ok": true,
  "readOnly": true,
  "writesStillBlocked": true,
  "authPrepared": true,
  "authEnabled": false,
  "twitchOAuthPrepared": true,
  "twitchOAuthEffectiveEnabled": false,
  "sessionsPrepared": true,
  "sessionsEffectiveEnabled": false,
  "adminNoteRealDisplayAllowed": false,
  "reason": "auth_or_session_not_effectively_enabled"
}
```

Wenn Env bereits teilweise OAuth aktiviert hat, muss die Diagnose das sauber sichtbar machen, ohne neue Writes auszufuehren.

## Danach: moegliche groessere Folgeschritte

### RDAP25 Auth-/Login-Aktivierung vorbereiten oder korrigieren

Nur wenn RDAP24 zeigt, dass OAuth/Session sauber vorbereitet sind:

```text
- Deploy-Safety 302/403 sauber korrigieren
- Auth/Login-Flags bewusst setzen/pruefen
- Twitch-Redirect testen
- Callback 403/Fehlerfall sicher testen
- keine Admin-Notiztexte
```

### RDAP26 echte Session-Login-Teststrecke

Nur mit bewusstem separatem Go:

```text
- Login via Twitch im Browser testen
- Session-Cookie entsteht
- /api/remote/auth/me zeigt eingeloggten User
- /api/remote/auth/session-status zeigt gueltige Session
- kein Admin-Notiztext ohne Permission
```

### RDAP27 admin.users.note.read Permission-Test

Nur wenn Login/Session funktioniert:

```text
- Permission-Zuordnung fuer Test-User pruefen
- 403 ohne Permission
- 200 erst mit Permission
- weiterhin keine Schreibbuttons
```

### RDAP28 echte read-only Admin-Notiz-Anzeige

Erst wenn RDAP26/RDAP27 bestaetigt sind:

```text
GET /api/remote/admin/users/:targetUserUid/admin-notes
```

mit:

```text
401 ohne Session
403 ohne admin.users.note.read
200 mit admin.users.note.read
Notiztexte nur bei 200
read-only
keine Writes
```

## Groesser-aber-sicher-Regel ab hier

Ab RDAP23 sollen Steps so gross wie moeglich und so klein wie noetig sein.

Das bedeutet:

```text
Groessere fachliche Einheiten zusammenfassen.
Nicht jede Erkenntnis als eigenen Plan-Step bauen.
Aber harte Sicherheitsgrenzen nicht ueberspringen.
Bei Auth/DB/Writes/OAuth immer Backup/Readiness/Tests nennen.
Keine produktive Aktivierung ohne eigenen Go.
```

Praktisch:

```text
Plan-only nur noch, wenn wirklich blockiert.
Read-only Diagnose und Routen-Sync duerfen in einem Step zusammen.
Doku-Sync darf in denselben Step, wenn keine Unsicherheit ueber Dateien besteht.
Bei unsicherem project-state lieber additive docs/current-Datei statt alte project-state-Dateien zu ueberschreiben.
```

## Testplan fuer RDAP24

Lokal:

```powershell
cd D:\Git\stream-control-center\remote-modboard\backend
node --check .\src\routes\auth-status.routes.js
node --check .\src\routes\routes.routes.js
node --check .\src\services\auth-readiness-diagnostic.service.js
npm run check
```

Server nach Deploy:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .authReadinessDiagnostic'

curl -fsS http://127.0.0.1:3010/api/remote/auth/readiness-diagnostic | jq

curl -sS -i http://127.0.0.1:3010/api/remote/auth/twitch/start | head -n 20
curl -sS -i http://127.0.0.1:3010/api/remote/auth/twitch/callback | head -n 20
```

## Nicht geaendert durch RDAP23

```text
Keine Backend-Code-Aenderung.
Keine UI-Aenderung.
Keine DB-Aenderung.
Keine SQL-Ausfuehrung.
Keine Notiztexte.
Keine Admin-Notiz-Writes.
Keine UI-Schreibbuttons.
Keine User-/Rollen-/Session-Write-Aenderung.
Keine Agent-Actions.
Keine OBS-/Sound-/Overlay-/Command-Steuerung.
```
