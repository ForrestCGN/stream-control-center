# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.9.1 Config UX Polish

Stand: 2026-06-06

## Ergebnis

STEP8.9.1 verbessert nur die Darstellung des VIP30-Config-Tabs.

## Ziel

- Sichere editierbare Settings oben bündeln.
- Kritische/gesperrte Settings in eigene aufklappbare Kategorien verschieben.
- Weniger horizontales Scrollen.
- Beschreibung direkt in der Setting-Card anzeigen.
- Speichern-Button bleibt oben beim Config-Bereich.
- Keine Funktionsänderung.

## Geänderte Dateien

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Nicht geändert

```txt
backend/modules/vip30.js
backend/modules/twitch.js
backend/modules/communication_bus.js
htdocs/dashboard/app.js
htdocs/dashboard/index.html
```

## Safety

Keine neuen API-Routen, keine Twitch-Aktion, keine DB-Migration.

Das Dashboard nutzt weiter:

```txt
GET  /api/vip30/settings
POST /api/vip30/settings/save
```

Direkt editierbar bleiben nur:

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

## Test

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.9.1 Config UX Polish"
```

Danach:

```txt
/dashboard
Community -> 30 Tage VIP -> Config
```
