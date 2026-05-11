# STEP203.6 - Loyalty Real Event Bonuses Shadow

Stand: 2026-05-09

## Ziel

Echte Twitch/EventSub-Events zusätzlich ins Loyalty-System schreiben.

Weiterhin gilt:

```text
mode = shadow
StreamElements bleibt aktiv
keine StreamElements-Abschaltung
keine Punkte/Transaktionen löschen
kein zweiter Twitch-Listener
```

## Geänderte Dateien

```text
backend/modules/loyalty.js
backend/modules/twitch.js
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
```

## Neue Loyalty-Funktion

Neue Event-Bonus-Engine:

```text
recordEventBonus()
listLoyaltyEvents()
```

Neue Tabelle:

```text
loyalty_events
```

## Neue Routen

```text
GET  /api/loyalty/events
POST /api/loyalty/events/ingest
GET  /api/loyalty/events/test/:type
```

## Twitch-Anbindung

`backend/modules/twitch.js` nutzt den vorhandenen EventSub-Listener.

Verarbeitete Twitch-Typen:

```text
channel.follow
channel.subscribe
channel.subscription.message
channel.subscription.gift
channel.cheer
channel.raid
```

## Aktivierung

Punkte werden nur gebucht, wenn:

```text
features.eventBonusesEnabled = true
```

Dashboard:

```text
Community -> Loyalty -> Konfig -> Features
```

API:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings" -Method POST -ContentType "application/json" -Body '{"features.eventBonusesEnabled":true}' | ConvertTo-Json -Depth 20
```
