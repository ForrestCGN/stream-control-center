# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP11C / Lock-/Audit Live-Test dokumentiert

Status: Live-Test erfolgreich dokumentiert

Geaendert:

- `docs/current/RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS.md`
- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Bestaetigt live:

- `GET /api/remote/lock-audit/status` -> HTTP 200
- `GET /api/remote/lock-audit/status?db=1` -> HTTP 200
- `GET /api/remote/auth/twitch/start` -> HTTP 403
- `GET /api/remote/auth/twitch/callback` -> HTTP 403

Bestaetigte Safety-Werte:

- `readOnly=true`
- `writeEnabled=false`
- `databaseWriteEnabled=false`
- `authEnabled=false`
- `loginEnabled=false`
- `agentActionsEnabled=false`
- `lockAcquireEnabled=false`
- `auditInsertEnabled=false`

Wichtiger Befund:

- `dashboard_locks` existiert, reales Schema weicht vom Erwartungsmodell ab.
- `dashboard_audit_log` existiert, reales Schema weicht vom Erwartungsmodell ab.
- Vor produktiven Writes ist `RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN` Pflicht.

Neue Arbeitsregel:

- Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.
- Keine sofortigen `curl`-Tests direkt nach Service-Restart.
