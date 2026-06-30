# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.117_AUDIT_LOG_ADMIN_UI_DEPLOY_VERIFY`

## Ziel

Nach Deploy live pruefen:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.adminAuditRetentionReadonly.readOnly,.adminAuditLogReadonly.readOnly'
```

Browser:

```text
Admin -> Aktivitaets-Log
```

## Danach entscheiden

```text
A. UI polish/Lesbarkeit fuer Audit-Tabelle
B. Retention-Policy entscheiden
C. Admin/User-Bereich weiter ausbauen
```

## Regeln

```text
keine Admin-Notizen
keine Writes
keine Migration
keine Loeschung
keine Gates aktivieren
keine Agent-Actions
```
