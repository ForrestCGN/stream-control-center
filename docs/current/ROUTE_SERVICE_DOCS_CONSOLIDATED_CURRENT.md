# ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT

Stand: 2026-06-27  
Step: `RDAP_DOCS_CLEANUP_4_MODULE_DOCS_CONSOLIDATION`

## Zweck

Zentrale technische Uebersicht fuer Remote-Modboard Routes, Services und Stream-PC-Agent-Dateien. Diese Datei ist Doku-only und ersetzt verstreute Handoff-Notizen nicht blind, sondern dient als Konsolidierungsziel.

## Remote-Modboard Routes

| Pfad | Status |
| --- | --- |
| remote-modboard/backend/src/routes/admin-mini-write-foundation.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/admin-users.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/agent-status.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/auth-login.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/auth-model.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/auth-status.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/auth-twitch.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/health.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/routes.routes.js | Route-Datei im Snapshot |
| remote-modboard/backend/src/routes/status.routes.js | Route-Datei im Snapshot |

## Remote-Modboard Services

| Pfad | Status |
| --- | --- |
| remote-modboard/backend/src/services/admin-audit-lock-schema-status-readonly.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-audit-test-insert.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-audit-write.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-confirm-write.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-lock-test.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-lock-write.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-mini-write-foundation.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-read-diagnostic.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-read-permission-diagnostic.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-admin-note-write-plan.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-permission-read.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/admin-user-write-foundation.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/agent-runtime-disabled.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/agent-runtime.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/agent-status.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/audit-read.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-db-read.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-login-entry.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-permission-read.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-profile-sync.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-session-oauth-readiness-diagnostic.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-session-read.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-session-write.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-status.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/auth-twitch-oauth.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/config.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/db-health.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/db.service.js | Service-Datei im Snapshot |
| remote-modboard/backend/src/services/lock-read.service.js | Service-Datei im Snapshot |

## Stream-PC-Agent

| Pfad | Status |
| --- | --- |
| remote-modboard/stream-pc-agent/README.md | Agent-Datei im Snapshot |
| remote-modboard/stream-pc-agent/package.json | Agent-Datei im Snapshot |
| remote-modboard/stream-pc-agent/src/agent-client.js | Agent-Datei im Snapshot |
| remote-modboard/stream-pc-agent/src/config.js | Agent-Datei im Snapshot |
| remote-modboard/stream-pc-agent/src/logger.js | Agent-Datei im Snapshot |

## Read-only-Grenze fuer aktuellen technischen Stand

Version 0.1.3 bleibt die aktuelle technische Basis: Streaming-PC Verbindung, Komponentenstatus und OBS-Status read-only. Diese Doku aendert keine Steuerung und aktiviert keine Writes.

## Weitere Konsolidierung

Die RDAP-Doku soll kuenftig in aktuellen Kern-Dokumenten gepflegt werden:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/REMOTE_MODBOARD_*CURRENT*.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```
