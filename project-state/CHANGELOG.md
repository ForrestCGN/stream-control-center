# CHANGELOG

## 0.2.114 - Audit Log Readonly API Deploy Confirmed

- 0.2.113 live bestaetigt.
- `GET /api/remote/admin/audit/log?limit=5` liefert `ok=true`, `count=5` und Audit-Items.
- `/api/remote/routes` zeigt `adminAuditLogReadonly.route` und `readOnly=true`.
- Verbindliches Deploy-Muster dokumentiert:
  `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev`
- Keine Runtime-Code-Dateien geaendert.
- Kein weiterer Webserver-Deploy noetig.

## 0.2.113 - Audit Log Readonly API

- Neue read-only Route:
  - `GET /api/remote/admin/audit/log`
