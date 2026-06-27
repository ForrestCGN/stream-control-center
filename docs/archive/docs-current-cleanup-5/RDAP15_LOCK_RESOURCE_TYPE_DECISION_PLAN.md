# RDAP15 - Lock resourceType Decision Plan

Stand: RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
Datum: 2026-06-24

## Zweck

RDAP15 dokumentiert die Entscheidungsvorbereitung fuer `resourceType` bei spaeteren Lock-Writes im Remote-Modboard.

RDAP15 ist ein reiner Doku-/Planungsstand.

Es werden keine Backend-Dateien geaendert, keine DB-Aenderungen ausgefuehrt, keine Migrationen gebaut und keine produktiven Writes aktiviert.

## Ausgangslage

RDAP14B/RDAP14C hat live bestaetigt:

```text
locks.compatibleForRead=true
locks.compatibleForWrite=false
missingForWrite=["resourceType"]
writeBlockReason=resource_type_column_missing_typed_resource_key_required_and_writes_disabled
```

Das bedeutet:

- Lock-Tabellenstruktur reicht fuer read-only Diagnose.
- Produktive Lock-Writes bleiben blockiert.
- Ursache ist der fehlende `resourceType`.
- Ohne `resourceType` koennen verschiedene Objektarten denselben `resource_key` nutzen und sich gegenseitig blockieren.
- Eine Entscheidung ist noetig, bevor Lock-Writes gebaut werden.

## Reales Lock-Schema

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

Fehlender Kernpunkt fuer sichere Writes:

```text
resource_type
```

## Problem ohne resourceType

Wenn nur `resource_key` genutzt wird, sind Kollisionen moeglich.

Beispiele:

```text
welcome
loyalty
1602
event_winner
```

Ohne Typ ist nicht eindeutig, ob gemeint ist:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
```

Fuer Dashboard-Locks ist diese Eindeutigkeit wichtig, weil Locks sonst falsche Bereiche blockieren koennen.

## Optionen

### Option A - Migration: `resource_type` als Spalte ergaenzen

Vorteile:

- sauberste Datenstruktur
- klare Querys
- weniger Sonderlogik im Adapter
- langfristig beste Grundlage fuer produktive Writes
- eindeutige Locks pro Ressourcentyp und Key

Nachteile:

- DB-Migration noetig
- Backup/Rollback zwingend
- Live-Planung erforderlich
- bestehende Daten muessen sinnvoll eingeordnet werden

Moegliche spaetere Migration, nur als Planung:

```sql
ALTER TABLE dashboard_locks
  ADD COLUMN resource_type VARCHAR(80) NULL;
```

Spaeter eventuell Index:

```sql
CREATE INDEX idx_dashboard_locks_resource
  ON dashboard_locks (resource_type, resource_key, status);
```

Wichtig: Keine Ausfuehrung in RDAP15.

### Option B - Nur typisierter resource_key

Dabei wird keine neue DB-Spalte angelegt.

Stattdessen muss `resource_key` immer ein festes Format haben:

```text
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
command:twitch:clip
role:user:forrestcgn
```

Vorteile:

- keine DB-Migration
- sofort im Konzept nutzbar
- weniger Risiko fuer bestehende Datenbank
- Adapter kann Typ aus Key ableiten

Nachteile:

- Disziplin im Code zwingend
- alte/unklare Keys bleiben problematisch
- Querys und Auswertungen sind weniger sauber
- Tippfehler/Formatfehler koennen Locks unbrauchbar machen
- langfristig technische Schuld

### Option C - Hybrid

Kurzfristig:

- `resource_key` wird ab sofort in Planung und spaeterem Code zwingend typisiert.
- Adapter erkennt nur typisierte Keys als write-kompatibel.
- Produktive Writes bleiben trotzdem deaktiviert, bis alle anderen Gates stehen.

Mittelfristig:

- eigene DB-Migration fuer `resource_type` planen.
- bestehende typisierte Keys koennen genutzt werden, um `resource_type` sauber abzuleiten.
- `resource_key` bleibt danach Objekt-Key oder kann weiterhin voll typisiert bleiben.

Vorteile:

- kein sofortiger DB-Eingriff
- trotzdem klare Richtung
- spaetere Migration wird einfacher
- keine Lock-Writes gegen unklare Keys
- kompatibel mit aktuellem Read-only-Stand

Nachteile:

- zwei Phasen noetig
- Adapter muss Uebergang sauber behandeln
- Migration bleibt spaeter trotzdem notwendig, wenn wir sauberes Langzeitmodell wollen

## Entscheidung RDAP15

Empfehlung:

```text
Hybrid
```

Begruendung:

- Kein sofortiger DB-Eingriff.
- Keine Migration ohne eigenen Scope.
- Trotzdem ab jetzt klare Resource-Key-Regel.
- Adapter kann spaeter typisierte Keys erkennen.
- Produktive Lock-Writes bleiben bis zur vollstaendigen Safety-Kette blockiert.
- Spaetere Migration auf `resource_type` bleibt sauber planbar.

## Verbindliche Resource-Key-Regel ab RDAP15

Fuer alle zukuenftigen Lock-Konzepte gilt:

```text
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
text:category:loyalty
config:module:loyalty
config:module:stream_events
media:sound:1602
media:video:reveal_alf
overlay:layout:event_winner
overlay:visibility:shot_alarm
command:twitch:clip
command:twitch:shotdone
role:user:forrestcgn
permission:remote:lock_admin
```

Nicht mehr akzeptabel fuer neue Lock-Konzepte:

```text
welcome
loyalty
1602
event_winner
clip
```

## Adapter-Regel

Ein spaeterer read-only Adapter darf `resourceType` aus `resource_key` nur ableiten, wenn das Format eindeutig ist.

Erlaubt:

```text
text:message:welcome
```

Nicht eindeutig:

```text
welcome
```

Wenn nicht eindeutig:

```text
compatibleForWrite=false
reason=resource_key_not_typed
```

## Lock-Write Gate

Produktive Lock-Writes bleiben blockiert, bis mindestens gilt:

```text
writeEnabled=true
databaseWriteEnabled=true
authEnabled=true
loginEnabled=true
session valid
permission allowed
confirm/safety passed
resource key typed
resource type known
lock owner known
expires_at calculable
audit pre-entry possible
```

Wenn eine Bedingung fehlt:

```text
write blocked
no DB write
no partial action
safe error response
no secrets
```

## Migration spaeter

Eine Migration fuer `resource_type` darf spaeter nur mit eigenem Scope passieren.

Pflicht:

- MariaDB-Backup oder Tabellenbackup
- Schema-Dump vorher
- konkrete ALTER-Statements
- Rollback-Plan
- Read-only Test nach Migration
- keine produktiven Writes waehrend unklarer Migration
- keine Secrets im Chat/Repo/Logs

Moegliche spaetere Phasen:

1. `resource_type` nullable ergaenzen
2. Adapter erkennt Spalte
3. neue Keys typisiert schreiben, aber Writes weiterhin aus
4. bestehende Keys klassifizieren, wenn sicher moeglich
5. erst nach Review Lock-Writes planen
6. spaeter optional NOT NULL/Index, wenn Daten sauber sind

## Keine Entscheidung fuer sofortige Migration

RDAP15 gibt keine Freigabe fuer:

- ALTER TABLE
- CREATE INDEX
- Backfill
- DB-Writes
- produktive Lock-Writes

## Naechster sinnvoller Schritt

```text
RDAP16_TYPED_RESOURCE_KEY_RULES_AND_ADAPTER_PLAN
```

Ziel:

- konkrete Resource-Key-Namespaces definieren
- erlaubte Ressourcentypen fuer Dashboard-Bereiche festlegen
- Parser-/Validator-Regeln planen
- Adapter-Verhalten fuer untypisierte Keys festlegen
- weiterhin keine DB-Aenderung und keine Writes

Alternative:

```text
RDAP15B_LOCK_RESOURCE_TYPE_DECISION_DOCS
```

Falls zuerst nur Live-/Projektstatus-Doku konsolidiert werden soll.

## Unveraenderte Verbote

RDAP15 aktiviert nicht:

- Login
- Twitch-OAuth
- Cookies
- Sessions
- last_seen_at Update
- DB-Writes
- Migrationen
- Tabellen-Aenderungen
- Lock-Writes
- Audit-Writes
- Remote-Writes
- Agent-Actions
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-Steuerung
- produktive Permission-Erzwingung fuer Writes
