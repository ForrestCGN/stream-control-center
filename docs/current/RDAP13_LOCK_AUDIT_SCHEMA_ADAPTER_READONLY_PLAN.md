# RDAP13 - Lock-/Audit Schema-Adapter Read-only Plan

Stand: RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
Datum: 2026-06-24

## Zweck

RDAP13 plant einen read-only Schema-Adapter fuer das reale MariaDB-Schema von `dashboard_locks` und `dashboard_audit_log`.

RDAP13 ist ein reiner Doku-/Planungsstand.

Es werden keine Backend-Dateien geaendert, keine DB-Aenderungen ausgefuehrt, keine Migrationen gebaut und keine produktiven Writes aktiviert.

## Ausgangslage

RDAP11/RDAP11B hat live read-only diagnostiziert:

```text
GET /api/remote/lock-audit/status       -> HTTP 200
GET /api/remote/lock-audit/status?db=1  -> HTTP 200
```

RDAP12 hat dokumentiert:

- `dashboard_locks` existiert, reales Schema weicht vom Erwartungsmodell ab
- `dashboard_audit_log` existiert, reales Schema weicht vom Erwartungsmodell ab
- vor produktiven Writes ist ein Kompatibilitaetslayer/Adapter sinnvoller als sofortige Migration

## Zielbild

Der Adapter soll spaeter:

- reales Schema erkennen
- internes Lock-/Audit-Modell bereitstellen
- vorhandene Spalten sauber mappen
- fehlende Felder sichtbar machen
- produktive Writes blockieren, solange Pflichtfelder fehlen
- Diagnose lesbar ausgeben
- keine Daten veraendern, solange read-only
- keine Secrets oder Rohpayloads ausgeben

## Interner Lock-Adapter

### Internes Lock-Modell

```text
lockId
resourceType
resourceKey
resourceVersion
ownerUserUid
editSessionId
clientId
status
heartbeatAt
expiresAt
createdAt
updatedAt
releasedAt
```

### Reales dashboard_locks Schema

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

### Mapping

```text
lock_uid        -> lockId
resource_key    -> resourceKey
version_token   -> resourceVersion
owner_user_uid  -> ownerUserUid
status          -> status
heartbeat_at    -> heartbeatAt
expires_at      -> expiresAt
created_at      -> createdAt
updated_at      -> updatedAt
```

### Fehlende Felder

```text
resourceType
editSessionId
clientId
releasedAt
```

### Adapter-Regeln fuer Locks

Pflicht fuer read-only Diagnose:

```text
lockId oder lock_uid
resourceKey oder resource_key
ownerUserUid oder owner_user_uid
status
heartbeatAt oder heartbeat_at
expiresAt oder expires_at
```

Pflicht fuer spaetere produktive Writes:

```text
resourceType oder eindeutig typisierter resourceKey
lockId
resourceKey
ownerUserUid
status
heartbeatAt
expiresAt
```

Empfohlen fuer sichere Bedienung im Dashboard:

```text
editSessionId
clientId
releasedAt
resourceVersion
```

### Write-Block-Regeln Lock

Spaetere Lock-Writes muessen blockiert bleiben, wenn:

- `writeEnabled=false`
- `databaseWriteEnabled=false`
- Login/Auth/Session nicht aktiv ist
- Permission fehlt
- Confirm/Safety fehlt
- `resourceType` weder als Spalte noch als eindeutig typisierter `resourceKey` vorhanden ist
- `ownerUserUid` nicht eindeutig bestimmbar ist
- `expiresAt` fehlt oder nicht berechenbar ist
- bestehender Lock nicht eindeutig aufloesbar ist

## Interner Audit-Adapter

### Internes Audit-Modell

```text
auditId
requestId
correlationId
actorUserUid
actorLogin
actorDisplayName
source
action
permissionKey
resourceType
resourceKey
status
errorCode
oldValueSummary
newValueSummary
safeMetadata
createdAt
completedAt
```

### Reales dashboard_audit_log Schema

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

### Mapping

```text
audit_uid           -> auditId
request_id          -> requestId
correlation_id      -> correlationId
actor_user_uid      -> actorUserUid
actor_display_name  -> actorDisplayName
source              -> source
action              -> action
permission_key      -> permissionKey
resource_key        -> resourceKey
status              -> status
old_value_summary   -> oldValueSummary
new_value_summary   -> newValueSummary
created_at          -> createdAt
```

### Fehlende Felder

```text
actorLogin
resourceType
errorCode
safeMetadata
completedAt
```

### Adapter-Regeln fuer Audit

Pflicht fuer read-only Diagnose:

```text
auditId oder audit_uid/id
createdAt oder created_at
actorUserUid oder actor_user_uid
action
resourceKey oder resource_key
status
requestId oder request_id
correlationId oder correlation_id
```

Pflicht fuer spaetere produktive Audit-Writes:

```text
action
resourceKey
status
requestId
correlationId
actorUserUid oder system actor
createdAt
```

Empfohlen fuer saubere Auswertung:

```text
actorLogin oder actorDisplayName
source
permissionKey
resourceType
errorCode
safeMetadata
completedAt
oldValueSummary
newValueSummary
```

### Write-Block-Regeln Audit

Spaetere Audit-Writes muessen blockiert bleiben, wenn:

- `auditInsertEnabled=false`
- `databaseWriteEnabled=false`
- kein sicherer Actor bestimmbar ist
- `action` fehlt
- `resourceKey` fehlt
- `status` fehlt
- `requestId`/`correlationId` fehlen
- der Payload Secrets oder rohe sensible Daten enthalten wuerde
- das Schema keinen sicheren Speicherort fuer die geplanten Daten hat

## Resource-Key Strategie

Da `resource_type` real noch fehlt, darf produktiver Code spaeter nicht blind `resource_key` allein nutzen.

Empfohlene Uebergangsstrategie:

```text
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
command:twitch:clip
overlay:layout:event_winner
role:user:forrestcgn
```

Der Adapter soll spaeter aus typisierten Resource-Keys ableiten koennen:

```text
resourceType
resourceNamespace
resourceId
```

Wenn das nicht eindeutig moeglich ist:

```text
schemaCompatibleForWrites=false
reason=resource_type_missing_or_resource_key_not_typed
```

## Diagnose-Ausgabe spaeter

Eine spaetere read-only Adapter-Diagnose sollte liefern:

```json
{
  "ok": true,
  "readOnly": true,
  "schemaAdapterPrepared": true,
  "locks": {
    "tableDetected": true,
    "mappingReady": true,
    "compatibleForRead": true,
    "compatibleForWrite": false,
    "missingForWrite": ["resourceType", "editSessionId", "clientId", "releasedAt"]
  },
  "audit": {
    "tableDetected": true,
    "mappingReady": true,
    "compatibleForRead": true,
    "compatibleForWrite": false,
    "missingForWrite": ["resourceType", "errorCode", "safeMetadata", "completedAt"]
  }
}
```

## Empfohlene spaetere Dateien

Wenn RDAP14 als read-only Code-Skeleton umgesetzt wird, dann moeglichst klein und klar:

```text
remote-modboard/backend/src/services/lock-schema-adapter.service.js
remote-modboard/backend/src/services/audit-schema-adapter.service.js
remote-modboard/backend/src/routes/schema-adapter-diagnostic.routes.js
```

Optional, wenn besser in bestehende Diagnose integriert:

```text
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
```

Wichtig: Bestehende Dateien nur gezielt erweitern, keine Funktionalitaet entfernen.

## Empfohlene spaetere Route

```text
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

Alternativ Integration in bestehend:

```text
GET /api/remote/lock-audit/status?db=1&adapter=1
```

Empfehlung: eigene Route ist lesbarer und risikoaermer.

## Keine produktiven Writes bis mindestens

Produktive Lock-/Audit-Writes duerfen fruehestens geplant werden, wenn:

```text
schema adapter live read-only getestet
mapping eindeutig
write compatibility bewusst bewertet
Login/Auth/Session geplant und getestet
Permission-Gate read-only getestet
Confirm/Safety-Gate geplant
Audit-Speicherung sicher geplant
Backup/Rollback fuer DB vorhanden
```

## Migration vs Adapter

### Adapter zuerst

Vorteile:

- keine sofortige DB-Aenderung
- reales Schema bleibt erhalten
- Risiken sichtbar
- spaetere Migration kann besser geplant werden

Nachteile:

- produktive Writes bleiben begrenzt
- typisierte Resource-Keys muessen diszipliniert genutzt werden
- fehlende Felder bleiben technische Schulden

### Migration spaeter

Vorteile:

- sauberere Datenstruktur
- bessere Audit-Auswertung
- klare Lock-Sicherheit
- weniger Sonderlogik

Nachteile:

- braucht DB-Backup
- braucht Rollback
- braucht Live-Wartungsfenster oder klare Sicherheitsregeln
- darf nicht nebenbei passieren

## Naechster sinnvoller Schritt

```text
RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
```

Ziel:

- read-only Adapter-Service vorbereiten
- reale Schema-Mappings diagnostisch ausgeben
- keine Writes
- keine Migration
- kein Login/OAuth
- kein produktiver Lock/Audit-Write

Vor RDAP14 muss wieder Scope genannt werden.

## Server-Script-Regel

Falls RDAP14 spaeter deployed wird:

Nach `systemctl restart` immer auf Readiness warten:

```bash
for i in $(seq 1 20); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    READY=1
    break
  fi
  sleep 1
done
test "${READY:-0}" = "1"
```

Dann erst API-Tests.

## Unveraenderte Verbote

RDAP13 aktiviert nicht:

- Login
- Twitch-OAuth
- Cookies
- Sessions
- last_seen_at Update
- DB-Writes
- Migrationen
- Remote-Writes
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- produktive Permission-Erzwingung fuer Writes
