# RDAP12 - Lock-/Audit Schema-Kompatibilitaetsplan

Stand: RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
Datum: 2026-06-24

## Zweck

RDAP12 dokumentiert den Schema-Kompatibilitaetsplan fuer die spaetere produktive Nutzung von `dashboard_locks` und `dashboard_audit_log` im Remote-Modboard.

RDAP12 ist ein reiner Doku-/Planungsstand.

Es werden keine Tabellen geaendert, keine Migrationen ausgefuehrt, keine DB-Writes gebaut und keine Remote-Writes aktiviert.

## Ausgangslage

RDAP11/RDAP11B hat live read-only diagnostiziert:

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
```

Ergebnis:

- beide Diagnose-Routen liefern `HTTP=200`
- `statusApiVersion=rdap11.v1`
- `readOnly=true`
- `writeEnabled=false`
- `databaseWriteEnabled=false`
- `authEnabled=false`
- `loginEnabled=false`
- `agentActionsEnabled=false`
- `lockAcquireEnabled=false`
- `auditInsertEnabled=false`
- OAuth-Start/Callback bleiben HTTP 403

Die Tabellen existieren bereits:

```text
dashboard_locks
dashboard_audit_log
```

Das reale Schema weicht aber vom RDAP9/RDAP10/RDAP11-Erwartungsmodell ab.

## Reales Schema: dashboard_locks

Live erkannte Spalten:

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

RDAP11-Erwartungsmodell:

```text
id
lock_id
resource_type
resource_key
resource_version
edit_session_id
user_uid
client_id
heartbeat_at
expires_at
created_at
updated_at
released_at
```

Fehlend nach RDAP11-Erwartungsmodell:

```text
lock_id
resource_type
resource_version
edit_session_id
user_uid
client_id
released_at
```

## Bewertung: dashboard_locks

### Direkt nutzbar

```text
id
resource_key
heartbeat_at
expires_at
created_at
updated_at
status
```

### Wahrscheinlich mappbar

```text
lock_uid        -> lock_id
owner_user_uid  -> user_uid
version_token   -> resource_version
```

### Nicht direkt vorhanden

```text
resource_type
edit_session_id
client_id
released_at
```

### Risiko

`resource_key` allein reicht langfristig wahrscheinlich nicht, wenn verschiedene Resource-Typen denselben Key haben koennen.

Beispiele:

```text
texts:welcome
config:welcome
media:welcome
```

Ohne `resource_type` muesste der Typ in `resource_key` codiert werden, z. B.:

```text
texts:message_key:welcome
config:module:loyalty
media:sound:1602
```

Das ist moeglich, aber weniger sauber als eigene Spalte `resource_type`.

## Reales Schema: dashboard_audit_log

Live erkannte Spalten:

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

RDAP11-Erwartungsmodell:

```text
id
request_id
correlation_id
actor_user_uid
actor_login
action
resource_type
resource_key
status
error_code
safe_metadata_json
created_at
completed_at
```

Fehlend nach RDAP11-Erwartungsmodell:

```text
actor_login
resource_type
error_code
safe_metadata_json
completed_at
```

## Bewertung: dashboard_audit_log

### Direkt nutzbar

```text
id
request_id
correlation_id
actor_user_uid
action
resource_key
status
created_at
```

### Wahrscheinlich mappbar

```text
actor_display_name -> actor_login oder actor_label, aber nur wenn Inhalt eindeutig ist
source             -> Quelle wie remote_modboard/dashboard/agent/system
permission_key     -> betroffene Permission
old_value_summary  -> entschärfte vorherige Zusammenfassung
new_value_summary  -> entschärfte neue Zusammenfassung
audit_uid          -> externe Audit-ID
```

### Nicht direkt vorhanden

```text
resource_type
error_code
safe_metadata_json
completed_at
```

### Risiko

Ohne `safe_metadata_json` muessen strukturierte Zusatzdaten in getrennte Summary-Felder oder gar nicht gespeichert werden.

Ohne `error_code` wird Fehlerauswertung spaeter ungenauer.

Ohne `completed_at` kann Dauer/Abschlusszeitpunkt nicht sauber dokumentiert werden, wenn Audit vor und nach einer Aktion geschrieben werden soll.

## Empfohlene Strategie

### Kurzfristig: Kompatibilitaetslayer statt sofortiger Migration

Fuer die naechsten Schritte sollte kein produktiver Write direkt gegen das RDAP11-Erwartungsmodell gebaut werden.

Stattdessen sollte ein Kompatibilitaetslayer geplant werden:

```text
lock-schema.adapter
audit-schema.adapter
```

Aufgaben:

- reales Schema erkennen
- Mapping bereitstellen
- fehlende Felder explizit als nicht verfuegbar markieren
- Writes blockieren, wenn notwendige Felder fehlen
- nie stillschweigend Daten in falsche Spalten schreiben
- keine Secrets oder Rohpayloads speichern

### Mittelfristig: kontrollierte Schema-Erweiterung

Wenn produktive Writes naeherruecken, sollte eine Migration geplant werden, die bestehende Tabellen erweitert, statt sie zu ersetzen.

#### dashboard_locks moegliche Erweiterungen

```sql
ALTER TABLE dashboard_locks
  ADD COLUMN resource_type VARCHAR(80) NULL,
  ADD COLUMN edit_session_id VARCHAR(128) NULL,
  ADD COLUMN client_id VARCHAR(128) NULL,
  ADD COLUMN released_at DATETIME NULL;
```

Optional, nur wenn `lock_uid` nicht als Lock-ID verwendet werden soll:

```sql
ALTER TABLE dashboard_locks
  ADD COLUMN lock_id VARCHAR(128) NULL;
```

Optional, nur wenn `version_token` nicht als Resource-Version verwendet werden soll:

```sql
ALTER TABLE dashboard_locks
  ADD COLUMN resource_version VARCHAR(128) NULL;
```

#### dashboard_audit_log moegliche Erweiterungen

```sql
ALTER TABLE dashboard_audit_log
  ADD COLUMN actor_login VARCHAR(128) NULL,
  ADD COLUMN resource_type VARCHAR(80) NULL,
  ADD COLUMN error_code VARCHAR(120) NULL,
  ADD COLUMN safe_metadata_json JSON NULL,
  ADD COLUMN completed_at DATETIME NULL;
```

Wichtig: Das ist nur Planung, keine Freigabe zur Ausfuehrung.

## No-Write Gate

Bis eine Migration oder ein sauberer Adapter existiert, muessen alle produktiven Lock-/Audit-Writes blockiert bleiben.

Pflichtbedingungen fuer spaetere Writes:

```text
loginEnabled=true
authEnabled=true
session valid
permission allowed
writeEnabled=true
databaseWriteEnabled=true
resource schema compatible
confirm/safety passed
lock required? lock acquired/owned
audit pre-entry possible
write action performed
audit completion possible
```

Wenn eine dieser Bedingungen nicht erfuellt ist:

```text
write blocked
audit write not attempted unless safe and enabled
no partial action
clear error code
no secrets in response/logs
```

## Lock-Kompatibilitaetsregeln

Spaetere Lock-Logik darf erst produktiv werden, wenn mindestens diese Felder sicher verfuegbar oder sauber gemappt sind:

```text
lock_uid oder lock_id
resource_key
owner_user_uid oder user_uid
status
heartbeat_at
expires_at
created_at
updated_at
```

Fuer Multi-Resource-Sicherheit wird empfohlen:

```text
resource_type
```

Fuer Mehrtab-/Mehrclient-Sicherheit wird empfohlen:

```text
edit_session_id
client_id
```

Fuer sauberes Freigeben/History wird empfohlen:

```text
released_at
```

## Audit-Kompatibilitaetsregeln

Spaetere Audit-Logik darf erst produktiv werden, wenn mindestens diese Felder sicher verfuegbar oder sauber gemappt sind:

```text
audit_uid oder id
created_at
actor_user_uid
action
resource_key
status
request_id
correlation_id
```

Empfohlen fuer saubere Auswertung:

```text
actor_login oder actor_display_name
source
permission_key
resource_type
error_code
safe_metadata_json
completed_at
old_value_summary
new_value_summary
```

## Datenhaltung / keine sensiblen Rohdaten

Audit darf spaeter niemals speichern:

- OAuth-Codes
- Access Tokens
- Refresh Tokens
- Cookies
- Session IDs im Klartext
- ENV-Werte
- Passwoerter
- rohe Request-Bodies mit Secrets
- freie Shell-/Datei-/Prozessbefehle
- personenbezogene Rohdaten, die fuer Audit nicht noetig sind

Erlaubt sind entschärfte Werte:

```text
resource_key
action
permission_key
status
safe summary
error_code
request_id
correlation_id
```

## Migrations-Sicherheitsregeln

Eine spaetere Migration darf nur mit eigenem Scope erfolgen.

Pflicht:

- Backup der MariaDB bzw. betroffener Tabellen
- SQL-Dry-Run oder Schema-Dump vorher
- Rollback-Plan
- konkrete ALTER-Statements vorab dokumentieren
- keine Secrets ausgeben
- keine Migration in `/root`
- keine produktiven Writes waehrend unklarer Migration
- Live-Test nach Migration nur mit read-only Diagnose
- erst danach separate Freigabe fuer produktive Write-Logik

## Empfohlener naechster Schritt

```text
RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
```

Ziel:

- Read-only Adapter-Konzept fuer reale Schema-Erkennung
- keine Migration
- keine Writes
- klare Mapping-Ausgabe fuer `dashboard_locks`
- klare Mapping-Ausgabe fuer `dashboard_audit_log`
- Diagnose zeigt, ob spaetere Writes blockiert bleiben muessen

Alternativ, wenn zuerst DB-Struktur exakter dokumentiert werden soll:

```text
RDAP13_LOCK_AUDIT_SCHEMA_DUMP_READONLY_DOCS
```

Dann wird nur ein sicherer read-only INFORMATION_SCHEMA-Dump dokumentiert, ohne DB-Aenderung.

## Unveraenderte Verbote

RDAP12 aktiviert nicht:

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
