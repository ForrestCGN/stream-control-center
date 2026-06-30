# RDAP 0.2.114 - Audit Log Readonly API Deploy Confirmed

## Bestaetigt

0.2.113 ist live deployed.

## Deploy-Muster

Verbindlich fuer Webserver-Deploys:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
```

Fuer 0.2.113:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.113_AUDIT_LOG_READONLY_API dev
```

## Live-Checks

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit/log?limit=5" | jq '.ok,.count,.items[0]'
curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.adminAuditLogReadonly.route,.adminAuditLogReadonly.readOnly'
```

Ergebnis:

```text
ok = true
count = 5
items[0] vorhanden
route = /api/remote/admin/audit/log
readOnly = true
```

## Status

```text
Audit-Log API live
Read-only bestaetigt
Admin-Notizen bleiben geparkt
```

## Naechster Step

```text
RDAP_0.2.115_AUDIT_LOG_UI_READONLY
```
