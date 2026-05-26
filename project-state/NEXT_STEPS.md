# NEXT_STEPS

Stand: 2026-05-26 / nach STEP487

## Direkt prüfen

```bat
cd D:\Git\stream-control-center
node --check backend\modules\helpers\helper_communication_contract.js
```

## Optionaler Smoke-Test später

Wenn ein erstes Modul den Contract nutzt:

```text
1. Modul mit createModuleClient registrieren.
2. Status über client.status senden.
3. Test-Event abonnieren.
4. Test-Event senden.
5. Prüfen, ob Subscriber ausgeführt wird.
```

## Nächster sinnvoller Fach-STEP

```text
STEP488_CHANNELPOINTS_BACKEND_SKELETON
```

Ziel:

```text
channelpoints.js Grundmodul
moduleVersion 0.1.0
/api/channelpoints/status
Communication-Bus-Contract nutzen
Modul-Registrierung/Status/Heartbeat vorbereiten
noch keine Twitch-Schreibaktionen
noch keine riskante DB-Migration
```

## Weiterhin offen aus STEP486

```text
GET /api/clip-shoutout/production-check lokal prüfen
GET /api/clip-shoutout/live-test lokal prüfen
Debug-Inbound-Event lokal ausführen
Echte Twitch-Shoutout-Events beobachten
Produktive !so-Umstellung nur ausdrücklich und nach Prüfung
```
