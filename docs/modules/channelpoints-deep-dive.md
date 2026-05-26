# Channelpoints Deep Dive

Stand: 2026-05-26 / STEP491

## Modul

```text
backend/modules/channelpoints.js
```

Version: `0.3.0`

## Zweck

Das Kanalpunkte-System ist ein eigenes Fachmodul fuer Twitch Custom Rewards / Kanalpunkte-Belohnungen. Es soll langfristig Rewards lokal konfigurieren, mit Twitch synchronisieren, Redemptions verarbeiten und Aktionen ueber Backend, Streamer.bot, Media-System, Sound-System, Overlays und Communication Bus ausloesen.

## Aktueller Stand

STEP491 ist weiterhin sicher und vorbereitend:

- keine Twitch-Schreibaktionen
- keine echte DB-Migration
- keine Dashboard-Aenderung
- keine zweite Upload-/Media-Struktur

## Routen

```text
GET /api/channelpoints/status
GET /api/channelpoints/model
GET /api/channelpoints/media-plan
GET /api/channelpoints/schema-preview
GET /api/channelpoints/bus-test
```

## Schema-Preview

`GET /api/channelpoints/schema-preview` liefert geplante SQLite-kompatible SQL-Vorschauen fuer:

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

Die Route darf in STEP491 keine DB-Schreiboperation ausfuehren. Sie dient nur zur Pruefung vor der echten Migration.

## Geplante Tabellen

### channelpoints_categories

Dashboard-Gruppierung, Sortierung und Sichtbarkeit.

Wichtige Felder:

```text
id
category_key
label
description
sort_order
enabled
created_at
updated_at
```

### channelpoints_rewards

Lokale Reward-Konfiguration, Twitch-Mapping, Action-Mapping und Media-Referenzen.

Wichtige Felder:

```text
reward_key
twitch_reward_id
title
prompt
cost
category_key
sort_order
system_enabled
twitch_is_enabled
is_paused
action_type
action_key
action_payload_json
media_asset_id
media_role
queue_mode
priority
cooldown_seconds
max_per_stream
max_per_user_per_stream
auto_fulfill
```

### channelpoints_redemptions

Spaetere Redemption-Historie, Queue-Status und Fulfill-/Cancel-Tracking.

Wichtige Felder:

```text
twitch_redemption_id
twitch_reward_id
reward_key
user_id
user_login
user_display_name
user_input
status
queue_group
result_json
redeemed_at
created_at
updated_at
```

## Media-Regel

Kanalpunkte duerfen kein eigenes Upload-System erhalten.

Stattdessen:

```text
backend/modules/media.js
htdocs/dashboard/components/media_picker.js
htdocs/dashboard/components/media_field.js
bestehende Dashboard-Media-Upload-Maske
```

Reward-Felder fuer Media:

```text
media_asset_id
media_role
action_payload_json.media
```

## Twitch-Regel

Spaeteres Deaktivieren darf nicht nur lokal passieren. Es muss Twitch Custom Reward `is_enabled=false` setzen.

Dafuer werden spaeter benoetigt:

```text
channel:manage:redemptions
channel:read:redemptions
```

## Communication Bus

Das Modul registriert sich am Bus und nutzt Heartbeat/Status. Capability ab STEP491:

```text
channelpoints.schema
```

Reward-Ausfuehrung soll spaeter bevorzugt ueber Bus-Events entkoppelt werden.

## Naechster Schritt

STEP492: echte additive DB-Migration nach explizitem Go.
