# Channelpoints Deep Dive

Stand: 2026-05-26 / STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN

## Modul

- Datei: `backend/modules/channelpoints.js`
- Modulname: `channelpoints`
- Version: `0.2.0`
- Route-Prefix: `/api/channelpoints`
- Status: Plan-/Skeleton-Modul, noch keine produktiven Twitch-Schreibaktionen.

## Ziel

Das Kanalpunkte-System soll langfristig die Twitch-Kanalpunkte-Belohnungen im Control-Center verwalten und dabei dieselben Architekturregeln wie die anderen Module nutzen:

- Fachmodul statt Parallel-Script.
- Communication Bus für Status, Heartbeat und spätere Modulkommunikation.
- Dashboardfähig.
- DB-portabel geplant.
- Keine eigene Medien-/Upload-Welt.
- Keine Funktionalität entfernen.
- Twitch-Schreibaktionen erst nach separater Freigabe.

## Routen

| Route | Zweck | Schreibend |
|---|---|---:|
| `GET /api/channelpoints/status` | Modulstatus, Busstatus, Modellkurzstatus | Nein |
| `GET /api/channelpoints/model` | Geplantes Datenmodell für Kategorien, Rewards und Redemptions | Nein |
| `GET /api/channelpoints/media-plan` | Geplante Integration mit bestehendem Media-System | Nein |
| `GET /api/channelpoints/bus-test?message=hello` | Harmloser Bus-Selbsttest | Nein |

## Communication Bus

Das Modul registriert sich beim bestehenden Communication Bus:

- `registerModule`
- `heartbeatModule`
- `publishModuleStatus`
- `subscribe`

Aktuelle Capability-Liste:

```text
module.lifecycle
module.status
channelpoints.status
channelpoints.model
channelpoints.media
channelpoints.test.ping
```

Der Bus-Selftest nutzt:

```text
channel: channelpoints.test
action: ping
subscription: channelpoints:self-test
```

## Twitch-Status in STEP490

Noch nicht implementiert:

- Custom Rewards lesen/synchronisieren.
- Custom Rewards erstellen/ändern/löschen.
- Redemptions verarbeiten.
- Redemptions fulfill/cancel.
- Twitch-Schreibaktionen.

Wichtige spätere Regel:

```text
Deaktivieren muss Twitch is_enabled=false setzen.
```

Nur lokale Flags reichen nicht, weil die Belohnung sonst für Zuschauer weiterhin im Twitch-Kanalpunkte-Menü sichtbar bleiben kann.

## Geplantes Datenmodell

STEP490 legt noch keine DB-Tabellen an. Die Route `/api/channelpoints/model` beschreibt nur den Plan.

Geplante Tabellen:

| Tabelle | Zweck |
|---|---|
| `channelpoints_categories` | Kategorien, Sortierung, Sichtbarkeit |
| `channelpoints_rewards` | Lokale Reward-Konfiguration, Twitch-Mapping, Action-/Media-Mapping |
| `channelpoints_redemptions` | Spätere Redemption-Historie, Queue-Status, Fulfill-/Cancel-Tracking |

Wichtige Reward-Felder:

- `reward_key`
- `twitch_reward_id`
- `title`
- `prompt`
- `cost`
- `category_key`
- `sort_order`
- `system_enabled`
- `twitch_is_enabled`
- `require_user_input`
- `action_type`
- `action_key`
- `action_payload_json`
- `media_asset_id`
- `media_role`
- `queue_mode`
- `priority`
- `cooldown_seconds`
- `max_per_stream`
- `max_per_user_per_stream`
- `auto_fulfill`

## Medien/Uploads

Verbindliche Regel:

```text
Uploads und Medienauswahl laufen über das bestehende Medien-System.
```

Das Kanalpunkte-Modul soll keine eigenen Upload-Endpunkte, keine eigene Asset-Tabelle und keine separate Dateiverwaltung bauen.

Geplante Integration:

- Backend-Modul: `media.js`
- Dashboard-Picker: `htdocs/dashboard/components/media_picker.js`
- Dashboard-Feld: `htdocs/dashboard/components/media_field.js`
- Reward-Felder:
  - `media_asset_id`
  - `media_role`
  - `action_payload_json.media`

Geplante Rollen:

- `sound`
- `image`
- `video`
- `overlay`
- `icon`

## Spätere Dashboard-Idee

Noch nicht in STEP490 enthalten:

- Modulseite `Kanalpunkte`.
- Kategorien/Sortierung.
- Reward-Liste.
- Aktiv/Inaktiv lokal + Twitch-Sync-Status.
- Media-Picker pro Reward.
- Testauslösung.
- Sync-/Import-Ansicht für Twitch Custom Rewards.
- Warnhinweis bei lokal aktiv, aber Twitch deaktiviert oder umgekehrt.
- Audit-Log für Änderungen.

## Nächste sinnvolle Schritte

1. STEP491: DB-Migration vorbereiten und vor Umsetzung bestätigen.
2. STEP492: Read-only Reward-Liste aus lokaler DB.
3. STEP493: Dashboard-Skeleton mit Kategorien und Reward-Liste.
4. STEP494: Media-Picker im Dashboard anbinden.
5. Später: Twitch-Read-Sync.
6. Noch später und nur mit Freigabe: Twitch-Write-Aktionen.

## Nicht-Ziele in STEP490

- Keine Datenbankänderung.
- Keine Twitch-Schreibaktion.
- Keine produktive Redemption-Verarbeitung.
- Keine eigene Upload-Maske.
- Keine Entfernung bestehender Funktionen.
