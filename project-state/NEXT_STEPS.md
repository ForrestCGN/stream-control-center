# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.116_AUDIT_LOG_ADMIN_AREA_READONLY_UI`

## Ziel

Admin-Bereich Read-only UI fuer Audit-Log:

```text
Retention-Kacheln
Audit-Liste
Filter
keine Aktionen
```

## Datenquellen

```text
GET /api/remote/admin/audit/retention/status
GET /api/remote/admin/audit/log
```

## Regeln

```text
Admin-Bereich
keine Admin-Notizen
keine Writes
keine Migration
keine Loeschung
keine Gates aktivieren
keine Agent-Actions
keine Aktionsbuttons
```

## Deploy-Regel

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
```
