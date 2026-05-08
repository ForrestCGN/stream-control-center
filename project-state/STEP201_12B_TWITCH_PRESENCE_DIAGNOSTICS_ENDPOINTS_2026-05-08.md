# STEP201.12b – Twitch-Presence Diagnose-Endpunkte

Datum: 2026-05-08

## Ziel

Twitch-Presence wird als Chat-/Bridge-Modul vorsichtig auf den STEP201-Diagnose-Standard gebracht.

Produktiver Prefix:

```text
/api/twitch/presence
```

Legacy-Prefix bleibt:

```text
/twitch/presence
```

## Betroffene Datei

```text
backend/modules/twitch_presence.js
```

## Ergänzte Endpunkte

```text
GET  /api/twitch/presence/config
GET  /api/twitch/presence/settings
GET  /api/twitch/presence/routes
GET  /api/twitch/presence/integration-check
POST /api/twitch/presence/reload
```

`GET /api/twitch/presence/status` existierte bereits und bleibt unverändert.

## Nicht geändert

```text
/twitch/presence/start
/api/twitch/presence/start
/twitch/presence/stop
/api/twitch/presence/stop
/twitch/presence/status
/api/twitch/presence/status
/twitch/presence/send
/api/twitch/presence/send
Twitch IRC Connect-/Reconnect-Logik
Chat-Send-Logik
Bot OAuth Refresh-Logik
Join-Message-Logik
```

## Reload-Verhalten

`POST /api/twitch/presence/reload` ist nicht-destruktiv:

```text
destructive: false
startTriggered: false
stopTriggered: false
reconnectTriggered: false
chatMessageSent: false
```

Der Reload liest nur Status und Config-Diagnose. Er startet oder stoppt keine Verbindung und sendet keine Chatnachricht.

## Secrets

Tokens und Secrets werden nicht ausgegeben. Der neue Config-/Settings-Output zeigt nur, ob Werte konfiguriert/vorhanden sind.

## Test

Nach Deploy:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File .\tools\STEP201_12B_TWITCH_PRESENCE_ENDPOINT_TEST_LOG.ps1
```

Erwartung:

```text
/api/twitch/presence = 6/6 grün
/twitch/presence/status bleibt verfügbar
/api/twitch/presence/send ohne message = 400 erwartet
```
