# VIP30 / 30TageVIP

Stand: 2026-06-06  
Modul: `vip30`  
Backend-Version: `0.8.6` / `step8.6-external-vip-remove-slot-release`  
Dashboard-Stand: STEP8.9

## Zweck

VIP30 verwaltet den Kanalpunkte-Reward „30 Tage VIP“ im Node-/stream-control-center-System.

## Backend

Wichtige Datei:

```txt
backend/modules/vip30.js
```

Wichtige Tabellen:

```txt
vip30_slots
vip30_log
vip30_settings
```

Produktive DB:

```txt
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Dashboard

Wichtige Dateien:

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

Dashboard-Funktionen:

```txt
Übersicht
Slots
Logs
Config
Diagnose
```

## Settings

Vorhandene Routen:

```txt
GET  /api/vip30/settings
POST /api/vip30/settings/save
```

`POST /api/vip30/settings` existiert nicht.

STEP8.9 nutzt `/api/vip30/settings/save`.

## Safe Edit Allowlist im Dashboard

```txt
alerts.enabled
alerts.soundKey
logging.enabled
reward.title
reward.prompt
slots.maxSlots
slots.durationDays
cleanup.releaseSlotOnExternalVipRemove
```

## Kritisch / gesperrt im Dashboard

```txt
live.*
twitch.*
bridge.*
channelpoints.*
cleanup.enabled
cleanup.removeVipOnExpire
enabled
```

Diese Felder beeinflussen produktive Live-/Twitch-/Bridge-/Cleanup-Flows und brauchen später einen separaten Confirm-/Audit-Step.

## EventSub VIP Remove

Bestätigt:

```txt
Twitch channel.vip.remove
-> twitch.js
-> Communication Bus
-> vip30.js
-> Slot external_removed
-> Log external_vip_remove_slot_released
```

## Nächster Schritt

STEP8.10:

```txt
Dashboard manuelle Admin-Aktionen planen
```

Mit Confirm/Audit, keine produktiven Aktionen ohne Schutz.
