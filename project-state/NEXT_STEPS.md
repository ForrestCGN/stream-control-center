# NEXT_STEPS

Stand: 2026-05-26 / nach STEP490

## Direkt prüfen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
```

## Nach stepdone + Deploy + Server-Neustart testen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/model"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/media-plan"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus-test?message=hello"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

## Erwartung

- `channelpoints.js` erscheint in `/api/_status`.
- `moduleVersion` ist `0.2.0`.
- `/api/channelpoints/model` meldet `planning_only_no_db_migration`.
- `/api/channelpoints/media-plan` meldet `planning_only_uses_existing_media_system`.
- Bus-Test liefert weiter `subscriberDeliveredCount >= 1`.

## Offener Cleanup

Falls noch vorhanden:

```bat
del backend\modules\helpers\helper_communication_contract.js
```

Live ggf.:

```powershell
Remove-Item D:\Streaming\stramAssets\backend\modules\helpers\helper_communication_contract.js -Force
```

## Nächster sinnvoller Fach-STEP

```text
STEP491_CHANNELPOINTS_DB_MIGRATION_PREP
```

Ziel:

```text
- DB-Schema für channelpoints_categories, channelpoints_rewards und channelpoints_redemptions vorbereiten
- Migration sanft mit CREATE TABLE IF NOT EXISTS planen
- keine Daten überschreiben
- vor produktivem Einbau noch einmal bestätigen
```

## Danach

- STEP492: Read-only lokale Reward-Liste.
- STEP493: Dashboard-Skeleton.
- STEP494: Media-Picker an Rewards anbinden.
- Später: Twitch Read-Sync.
- Noch später: Twitch Write/Deactivate mit is_enabled=false.
