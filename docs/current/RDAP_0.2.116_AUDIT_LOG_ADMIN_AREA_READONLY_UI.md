# RDAP 0.2.116 - Audit Log Admin Area Readonly UI

## Ziel

Audit-/Aktivitaets-Log im Admin-Bereich sichtbar machen.

## Admin-Bereich

Neue sichtbare Seite:

```text
Admin -> Aktivitaets-Log
```

Admin-Notizen bleiben geparkt und werden nicht in der Hauptnavigation angezeigt.

## Datenquellen

```text
GET /api/remote/admin/audit/retention/status
GET /api/remote/admin/audit/log
```

## Anzeige

Kacheln:

```text
Eintraege gesamt
aeltester Eintrag
neuester Eintrag
Bereinigung / Retention
```

Tabelle:

```text
Wann
Wer
Was
Ziel
Status
```

Filter:

```text
Status
Aktion
Wer
Anzahl
```

## Grenzen

```text
read-only
keine Writes
keine Loeschung
keine Migration
keine Selbstbereinigung
keine Agent-Actions
keine Aktionsbuttons
```

## Test nach Deploy

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/routes" | jq '.adminAuditRetentionReadonly.readOnly,.adminAuditLogReadonly.readOnly'
```

Browser:

```text
https://mods.forrestcgn.de/
Admin -> Aktivitaets-Log
```
