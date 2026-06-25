# NEXT_STEPS

Stand: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP37 lokal einspielen, testen, stepdone, danach Webserver-Deploy aus frischem GitHub/dev-Clone.
```

## RDAP37 lokale Pflichtchecks

```text
node --check .\remote-modboard\backend\server.js
node --check .\remote-modboard\backend\src\routes\status.routes.js
node --check .\remote-modboard\backend\src\routes\lock-audit-diagnostic.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\services\admin-lock-test.service.js
```

## RDAP37 Webserver-Pflicht vor Test

```text
Backup dashboard_locks erstellen.
Backup-Datei existiert und ist nicht 0 Byte.
```

## RDAP37 Webserver-Test

```text
GET /api/remote/admin/locks/test/status
POST /api/remote/admin/locks/test-cycle mit {"confirmWrite":true,"testOnly":true}
Readback nach Acquire/Heartbeat/Release pruefen.
Lock muss am Ende released sein.
```

## Danach

```text
RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS
```

Erst nach erfolgreichem RDAP37B:

```text
RDAP38_ADMIN_NOTE_WRITE_WITH_AUDIT_LOCK_PLAN
```
