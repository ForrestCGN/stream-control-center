# Modul: VIP30 / 30 Tage VIP

Stand: VIP30-STEP1 / 2026-06-05  
Version: `0.1.0` / `step1-db-bus-diagnostics`

## Zweck

Das Modul `vip30` bildet die neue Node-Grundlage fuer das 30-Tage-VIP-System im `stream-control-center`.

Wichtig:

```text
- kein Streamer.bot mehr
- kein Import aus altem vip_slots.json
- Kanalpunkte-Reward wird im bestehenden Channelpoints-Modul angelegt
- VIP30 wird spaeter als Fachaktion aus dem Channelpoints-Execution-Flow aufgerufen
- Logs und Statistiken laufen ueber SQLite/API/Dashboard, nicht ueber normale Server-Logs
```

## STEP1 Umfang

Dieser Stand baut nur die sichere Grundlage:

```text
backend/modules/vip30.js
config/vip30.json
docs/modules/vip30.md
```

Funktionen in STEP1:

```text
- Modul laedt ueber den bestehenden Modul-Loader
- SQLite-Schema wird additiv angelegt
- Communication-Bus registerModule
- Communication-Bus heartbeatModule
- Communication-Bus publishModuleStatus
- Status-/Health-/Slots-/Logs-/Stats-Routen
- Diagnose-Registry-Eintrag vorbereitet
```

Noch nicht enthalten:

```text
- kein Twitch Add VIP
- kein Twitch Remove VIP
- kein Redemption Fulfill/Cancel
- keine Channelpoints-Execution-Anbindung
- kein Sound-System-Alert
- kein Dashboard-UI
```

## Reward-Festlegung

Der Reward soll im bestehenden Kanalpunkte-Modul eingetragen werden:

```text
reward_key: vip30
title: 30 Tage VIP
cost: 50000
category_key: vip
action_type: vip30
action_key: vip30.redeem
auto_fulfill: false
```

`auto_fulfill` bleibt bewusst `false`, weil erst nach erfolgreichem Twitch-VIP-Grant fulfilled werden darf.

## Config

Datei:

```text
config/vip30.json
```

Wichtige Werte:

```text
slots.maxSlots = 10
slots.durationDays = 30
reward.cost = 50000
alerts.mode = sound_system
textStyle.style = CGN/Altersheim/Rentner
twitch.liveActionsEnabled = false
```

## Datenbank

Neue Tabellen in der bestehenden produktiven SQLite-Datenbank:

```text
vip30_slots
vip30_log
```

Es wird keine bestehende Tabelle ersetzt oder geloescht.

### vip30_slots

Speichert kuenftig aktive/abgelaufene VIP30-Slots:

```text
id
user_id
user_login
user_display_name
avatar_url
start_utc
end_utc
status
twitch_reward_id
twitch_redemption_id
source
created_at
updated_at
revoked_at
last_error
```

Status-Zielwerte spaeter:

```text
active
revoke_pending
revoked
failed
cancelled
```

### vip30_log

Dashboard-/API-Logging fuer Einloesungen, Fehler, Refunds, Grants, Revokes und Alerts:

```text
event_type
user_id
user_login
user_display_name
twitch_reward_id
twitch_redemption_id
slot_id
success
reason
message
error_code
error_message
payload_json
created_at
```

## API-Routen

```text
GET /api/vip30/status
GET /api/vip30/health
GET /api/vip30/slots
GET /api/vip30/logs
GET /api/vip30/stats
```

## Communication Bus

VIP30 meldet sich als Modul an:

```text
id: module:vip30
module: vip30
capabilities:
- vip30.status
- vip30.slots
- vip30.logs
- vip30.stats
- vip30.cleanup.planned
- vip30.redeem.planned
```

Heartbeat und Status werden periodisch gesendet.

## Logging-Regel

Normale VIP30-Vorgaenge sollen nicht den Server-Log fluten.

Erlaubt im Server-Log:

```text
[vip30] v0.1.0 active (...)
[vip30] critical init error: ...
```

Normale Auswertung passiert ueber:

```text
/api/vip30/logs
/api/vip30/stats
Dashboard spaeter
```

## Naechste Steps

### VIP30-STEP2

Twitch Capability Check:

```text
channel:manage:redemptions
channel:manage:vips
broadcaster_id
Client-ID / Token-Quelle
```

### VIP30-STEP3

Channelpoints-Action-Anbindung:

```text
channelpoints.js erkennt action_type=vip30 / action_key=vip30.redeem
channelpoints delegiert an vip30-Modul
vip30 gibt Entscheidung an channelpoints zurueck
```

### VIP30-STEP4

Dry-Run-Redemption ohne Twitch-Schreibaktion.

### VIP30-STEP5

Live-Grant:

```text
Twitch Add VIP
DB Slot active
Redemption FULFILLED
Sound-System Alert
Chat-/Overlay-Zufallstexte
```

### VIP30-STEP6

Cancel-/Refund-Faelle:

```text
Slots voll
bereits Slot aktiv
bereits VIP
Moderator
Twitch-/DB-/Sound-Fehler
```

### VIP30-STEP7

Cleanup/Revoke nach Ablauf.
