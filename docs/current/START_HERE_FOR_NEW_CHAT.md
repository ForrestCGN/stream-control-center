# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS
Datum: 2026-06-24

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP9_LOCK_AUDIT_CONCEPT_FOR_FUTURE_WRITES.md
docs/current/RDAP10_LOCK_AUDIT_IMPLEMENTATION_PLAN_READONLY.md
docs/current/RDAP11_LOCK_AUDIT_READONLY_SKELETON_PREP.md
docs/current/RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS.md
```

## Aktueller bestaetigter Stand

```text
RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS
```

RDAP11 read-only Lock-/Audit-Diagnose-Skeleton wurde auf dem Webserver deployed und live getestet.

Bestaetigt live:

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

Wichtig:

```text
statusApiVersion=rdap11.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
```

OAuth bleibt deaktiviert:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Webserver Fakten

```text
Webserver: web.cgn.community
Public Subdomain: mods.forrestcgn.de
Service: scc-remote-modboard.service
Intern: 127.0.0.1:3010
DB-Typ: MariaDB 11.8.6
DB_NAME: c3stream_control
DB_USER: c1stream_control
```

Passwort niemals dokumentieren oder ausgeben.

## Backup RDAP11B

```text
/var/backups/stream-control-center/RDAP11B_LOCK_AUDIT_READONLY_SKELETON_LIVE_DEPLOY_TEST_remote-modboard-backend_20260624_083346.tar.gz
```

## Wichtiger Live-Befund

`dashboard_locks` und `dashboard_audit_log` existieren, aber das reale Schema weicht vom RDAP11-Erwartungsmodell ab.

Vor produktiver Lock-/Audit-Schreiblogik muss ein eigener Schema-Kompatibilitaetsplan erstellt werden.

## Server-Script-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry einbauen, bevor `curl`-Tests laufen.

Nicht direkt nach Restart testen.

Grosse Server-Bloecke vermeiden, wenn ein kompakter Block oder ein Scriptfile sicherer ist.

## Naechster sinnvoller Schritt

```text
RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
```

RDAP12 darf nur planen/dokumentieren, solange kein separater Code-/DB-Scope freigegeben wird.

RDAP12 darf NICHT:

- Login aktivieren
- Twitch-OAuth aktivieren
- Cookies setzen
- Sessions erstellen
- Sessions verlaengern
- last_seen_at aktualisieren
- produktive DB-Writes bauen oder ausfuehren
- User-/Rollen-/Gruppen-Schreibrouten bauen
- Remote-Writes bauen
- Agent-Actions aktivieren
- OBS-/Sound-/Overlay-/Command-Steuerung bauen
- Secrets ins Repo, Frontend, Logs oder Chat bringen
- bestehende Routen entfernen
- Funktionalitaet entfernen
