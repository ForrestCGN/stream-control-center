# RDAP 0.2.115 - Audit Log Retention Status and Admin UI Prep

## Ziel

Kein Mini-Step: Vor der Admin-Bereich-UI wird geklaert, wie viel Audit-Log vorhanden ist und ob es Selbstbereinigung gibt.

## Neue Route

```text
GET /api/remote/admin/audit/retention/status
```

## Liefert

```text
totalRows
oldestCreatedAt
newestCreatedAt
spanDays
rowsByStatus
retentionPolicy
```

## Aktueller Stand

```text
Retention nicht konfiguriert
Auto-Cleanup aus
Prune aus
Delete aus
Speicherung aktuell unbegrenzt
```

## Vorschlag nur als Status, nicht aktiv

```text
180 Tage
oder 10000 Eintraege
```

## Grenzen

```text
keine Writes
keine Migration
keine Loeschung
keine Selbstbereinigung aktiviert
keine Gates aktiviert
keine Agent-Actions
keine UI-Aktionsbuttons
Admin-Notizen bleiben geparkt
```

## Admin-Bereich

Naechster groesserer Step kann danach die Admin-Ansicht bauen:

```text
Audit-Log Panel:
- Retention-Kacheln
- Eintragsliste
- Filter
- keine Aktionen
```

## Test nach Deploy

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/audit/retention/status" | jq '.ok,.storage,.retentionPolicy'
curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.adminAuditRetentionReadonly'
```
