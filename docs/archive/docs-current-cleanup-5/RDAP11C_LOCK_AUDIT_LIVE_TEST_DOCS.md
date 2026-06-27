# RDAP11C - Lock-/Audit Read-only Skeleton Live-Test dokumentiert

Stand: RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS
Datum: 2026-06-24

## Zweck

RDAP11C dokumentiert den Live-Deploy und Live-Test von RDAP11/RDAP11B fuer das Remote-Modboard auf dem Webserver.

RDAP11 bleibt ein read-only Diagnose-Skeleton fuer spaetere Lock-/Audit-Umsetzung.

Es wurden durch RDAP11C selbst keine Backend-, DB- oder Server-Aenderungen gebaut.

## Bestaetigter Live-Deploy

Service:

```text
scc-remote-modboard.service
```

Interner Service:

```text
127.0.0.1:3010
```

Oeffentliche Subdomain:

```text
https://mods.forrestcgn.de
```

Backup auf Webserver:

```text
/var/backups/stream-control-center/RDAP11B_LOCK_AUDIT_READONLY_SKELETON_LIVE_DEPLOY_TEST_remote-modboard-backend_20260624_083346.tar.gz
```

Deploy-/Test-Clone:

```text
/opt/stream-control-center/_deploy_tmp/RDAP11B_LOCK_AUDIT_READONLY_SKELETON_LIVE_DEPLOY_TEST_20260624_083346
```

Live-Backend:

```text
/opt/stream-control-center/remote-modboard/backend
```

## Bestaetigte Live-Routen

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

Bestaetigt:

```text
HTTP=200
statusApiVersion=rdap11.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
migrationEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
lockHeartbeatEnabled=false
lockReleaseEnabled=false
lockForceTakeoverEnabled=false
auditInsertEnabled=false
auditUpdateEnabled=false
productiveAuthorizationEnabled=false
obsControlEnabled=false
soundControlEnabled=false
overlayControlEnabled=false
commandControlEnabled=false
```

## Oeffentlicher Smoke-Test

Bestaetigt:

```text
https://mods.forrestcgn.de/api/remote/lock-audit/status
HTTP=200
statusApiVersion=rdap11.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
```

## OAuth bleibt deaktiviert

Bestaetigt:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

Damit bleibt weiterhin deaktiviert:

- kein Login
- kein Twitch-OAuth
- kein Redirect zu Twitch
- kein OAuth-Code-gegen-Token-Tausch
- keine Cookies
- keine Sessions
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine User-/Rollen-/Gruppen-Schreibrouten
- keine produktiven DB-Writes
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung

## Schema-Inspektion per db=1

`GET /api/remote/lock-audit/status?db=1` fuehrt nur read-only INFORMATION_SCHEMA/SELECT-Pruefungen aus.

Bestaetigte Safety-Werte:

```text
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
migrationEnabled=false
```

## Wichtiger Befund: bestehende Tabellen weichen vom RDAP11-Erwartungsmodell ab

Die Tabellen existieren bereits:

```text
dashboard_locks
dashboard_audit_log
```

Sie passen aber nicht vollstaendig zum in RDAP9/RDAP10/RDAP11 geplanten Erwartungsmodell.

### dashboard_locks

Erkannte Spalten:

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

Im RDAP11-Erwartungsmodell fehlende Spalten:

```text
lock_id
resource_type
resource_version
edit_session_id
user_uid
client_id
released_at
```

### dashboard_audit_log

Erkannte Spalten:

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

Im RDAP11-Erwartungsmodell fehlende Spalten:

```text
actor_login
resource_type
error_code
safe_metadata_json
completed_at
```

## Bewertung

RDAP11B/RDAP11C ist erfolgreich, weil das Ziel nur read-only Diagnose war.

Die Schema-Abweichungen sind kein akuter Fehler, weil keine Writes gebaut oder ausgefuehrt wurden.

Vor produktiver Lock-/Audit-Schreiblogik ist zwingend ein eigener Schema-Kompatibilitaetsplan erforderlich.

## Neue Arbeitsregel aus RDAP11B

Beim Server-Deploy wurde sichtbar:

- Direkt nach `systemctl restart` kann ein sofortiges `curl` zu frueh kommen.
- Der Service war danach stabil aktiv, Port 3010 lauschte, Route funktionierte.
- Kuenftige Server-Skripte muessen nach Restart Readiness-Waits/Retry-Schleifen enthalten.

Verbindliche Regel fuer kuenftige Server-Skripte:

```text
Nach systemctl restart immer auf Service/Port/Health-Route warten, bevor API-Tests laufen.
```

Empfohlen:

```bash
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    break
  fi
  sleep 1
done
```

Bei neuen Routen zusaetzlich die Zielroute mit Retry pruefen.

## Naechster sinnvoller Schritt

```text
RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
```

Ziel RDAP12:

- reales MariaDB-Schema von `dashboard_locks` und `dashboard_audit_log` mit RDAP11-Erwartungsmodell abgleichen
- entscheiden, ob bestehende Tabellen erweitert, gemappt oder per Kompatibilitaetslayer genutzt werden
- keine produktiven Writes
- keine Migration ohne eigenen Scope
- keine DB-Aenderung ohne Backup/Rollback/Go
