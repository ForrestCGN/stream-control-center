# NEXT_STEPS

Stand: RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP31_ADMIN_NOTE_WRITE_BACKEND_CREATE_UPDATE_DEACTIVATE_DISABLED_UI
```

Ziel:

```text
Backend-Write-Routen fuer Admin-Notizen bauen oder vorbereiten:
- create
- update note_text
- deactivate

UI-Schreibbuttons bleiben weiterhin unsichtbar/deaktiviert.
Test nur per Curl und nur mit confirmWrite=true.
```

## Vor RDAP31 zwingend pruefen

```text
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/auth-permission-read.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/security/permissions.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Keine Annahmen treffen: Wenn Audit-/Lock-Write aktuell nur Diagnostic/Prepared ist, darf Admin-Notiz-Write nicht produktiv freigeschaltet werden, bevor das sauber geloest ist.

## Empfohlene RDAP31-Grenze

```text
Backend ja
UI-Schreibbuttons nein
Permission-Vergabe nein
physisches Delete nein
Community-Seiten nein
```

## Danach moeglich

```text
RDAP32_ADMIN_NOTE_WRITE_PERMISSION_OWNER_SEED
RDAP33_ADMIN_NOTE_WRITE_UI_GATED_BUTTONS
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN spaeter, nicht jetzt
```
