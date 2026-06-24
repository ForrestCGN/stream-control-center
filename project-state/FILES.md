# FILES - stream-control-center

Stand: RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
Datum: 2026-06-24

## RDAP14 relevante Dateien

```text
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON.md
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Keine neuen Adapter-Module

Bewusst nicht angelegt:

```text
remote-modboard/backend/src/services/lock-schema-adapter.service.js
remote-modboard/backend/src/services/audit-schema-adapter.service.js
remote-modboard/backend/src/routes/schema-adapter-diagnostic.routes.js
```

Grund: vorhandenes Lock-/Audit-Diagnose-Modul passt fachlich.

## Webserver Pfade

```text
/opt/stream-control-center/remote-modboard/backend
/opt/stream-control-center/_deploy_tmp/
/opt/stream-control-center/_runtime_tmp/
/var/backups/stream-control-center/
```

Keine RDAP-Arbeitsordner/Deploy-Clones/Backups nach `/root`.
