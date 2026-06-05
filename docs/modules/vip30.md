# VIP30 / 30 Tage VIP

## Stand: VIP30-STEP4 DB-/Dashboard-Config

Dieses Modul verwaltet den geplanten 30-Tage-VIP-Reward vollständig im Node-System.

Aktueller Stand:

- keine Streamer.bot-Abhängigkeit
- kein Datenimport aus alten JSON-Dateien
- Kanalpunkte-Kosten: **40.000**
- Laufzeit: **30 Tage**
- Maximal gleichzeitige Slots: **10**
- Reward-Key: `vip30`
- Action-Key: `vip30.redeem`
- Channelpoints-Reward lokal in DB verknüpft
- Twitch-Live-Aktionen weiterhin deaktiviert
- kein VIP-Grant
- kein Fulfill/Cancel

## DB-Tabellen

### `vip30_slots`

Speichert spätere aktive/abgelaufene VIP30-Slots.

### `vip30_log`

Speichert Dashboard-/Historien-Logs. Normale VIP30-Vorgänge sollen nicht ausführlich im Server-Log landen.

### `vip30_settings`

Neue STEP4-Tabelle für dashboardfähige Konfiguration. `config/vip30.json` bleibt nur Seed/Fallback.

Konfigurierbare Kernwerte:

- `reward.cost`
- `reward.title`
- `reward.prompt`
- `slots.maxSlots`
- `slots.durationDays`
- `channelpoints.rewardSyncEnabled`
- `channelpoints.twitchIsEnabled`
- `alerts.enabled`
- `alerts.soundKey`
- `cleanup.enabled`
- `logging.enabled`
- `twitch.liveActionsEnabled`

## API-Routen

```txt
GET  /api/vip30/status
GET  /api/vip30/health
GET  /api/vip30/slots
GET  /api/vip30/logs
GET  /api/vip30/stats
GET  /api/vip30/twitch/capability
GET  /api/vip30/twitch/scopes
GET  /api/vip30/channelpoints/reward/status
POST /api/vip30/channelpoints/reward/ensure?confirm=YES
GET  /api/vip30/settings
POST /api/vip30/settings/save
```

## Settings speichern

Beispiel:

```powershell
$body = @{ settings = @{ "reward.cost" = 40000; "slots.maxSlots" = 10 } } | ConvertTo-Json -Depth 8
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/vip30/settings/save" -ContentType "application/json" -Body $body
```

## Safety

STEP4 schreibt nur in lokale DB-Settings und bestehende lokale Channelpoints-Tabellen.

Nicht enthalten:

- Twitch-Reward aktivieren
- VIP vergeben
- VIP entfernen
- Redemption fulfillen/canceln
- Dashboard-Frontend

