# CURRENT CHAT HANDOFF – VIP30 / 30TageVIP – STEP8.9 Dashboard Settings

Stand: 2026-06-06

## Ergebnis

STEP8.9 ergänzt das VIP30-Dashboard um einen Config-Tab.

Backend wurde nicht geändert, weil bereits vorhanden:

```txt
GET  /api/vip30/settings
POST /api/vip30/settings/save
```

Der vorher getestete Endpoint `POST /api/vip30/settings` existiert nicht. Das Dashboard nutzt korrekt `/api/vip30/settings/save`.

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

## Sicherheitskonzept

Direkt editierbar im Dashboard:

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

Bewusst nur sichtbar/gesperrt:

```txt
live.*
twitch.*
bridge.*
channelpoints.*
cleanup.enabled
cleanup.removeVipOnExpire
enabled
```

Grund: Diese Schalter beeinflussen produktive Twitch-Aktionen, Live-Gates, Bridge-Verhalten oder Cleanup-Revoke. Dafür braucht es später einen separaten Confirm-/Audit-Step.

## Datenbank/Helper-Kompatibilität

Keine neue DB-Logik in STEP8.9.

Das bestehende Backend nutzt die vorhandene DB-Schicht und Tabelle:

```txt
vip30_settings
```

Damit bleibt die bestehende SQLite-Struktur erhalten und spätere DB-Portabilität über die vorhandene Datenbank-Abstraktion wird nicht verschlechtert.

## Test

Nach Entpacken:

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.9 Dashboard Settings"
```

Danach Dashboard öffnen:

```txt
/dashboard
Community -> 30 Tage VIP -> Config
```

Test mit harmlosem Feld:

```txt
reward.prompt
alerts.soundKey
```

## Nächster Schritt

STEP8.10 planen:

```txt
VIP30 Dashboard manuelle Admin-Aktionen
```

Nur mit Confirm/Audit planen, z. B.:

```txt
Cleanup Check ausführen
External Remove Status refresh
später Cleanup Run mit Confirm
später manuelle Slot-Korrektur mit Confirm
```
