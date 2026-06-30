# RDAP 0.2.113 - Audit Log Readonly API

## Ziel

Read-only Aktivitaets-Log fuer das Remote-Modboard.

```text
wer
wann
was gemacht hat
Status/Ergebnis
```

## Neue Route

```text
GET /api/remote/admin/audit/log
```

## Quelle

```text
dashboard_audit_log
```

## Ausgabe

```text
items[].createdAt
items[].completedAt
items[].actorLogin
items[].actorDisplayName
items[].action
items[].resourceType
items[].resourceKey
items[].status
items[].errorCode
items[].summary
```

## Filter

```text
limit  - default 50, max 100
status - exakt
action - LIKE
actor  - actor_login / actor_display_name LIKE
```

## Sicherheit

```text
read-only SELECT
keine Writes
keine Migration
keine Gates aktiviert
keine Agent-Actions
keine UI
safe_metadata_json nur gekuerzt/sanitized
keine Secrets/Rohpayloads
Admin-Notizen bleiben geparkt
```

## Test nach Deploy

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit/log?limit=5" | jq '.ok,.count,.items[0]'
curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.adminAuditLogReadonly'
```
