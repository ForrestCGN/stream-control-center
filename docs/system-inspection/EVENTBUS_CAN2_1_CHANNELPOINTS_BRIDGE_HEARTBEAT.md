# EVENTBUS_CAN2_1_CHANNELPOINTS_BRIDGE_HEARTBEAT

Stand: 2026-06-01  
Status: Repo-Patch / Live nach stepdone testen  
Scope: `channelpoints_eventsub_bus_bridge` als vollwertiger Communication-Bus-Teilnehmer

## Ziel

CAN-2 hat gezeigt, dass `channelpoints_eventsub_bus_bridge` am Communication Bus registriert ist, aber keinen Heartbeat sendet. Diese Änderung ergänzt den Heartbeat additiv direkt im bestehenden Modul.

## Betroffene Datei

```text
backend/modules/channelpoints_eventsub_bus_bridge.js
```

## Änderung

```text
- Modulversion 0.9.1 -> 0.9.2
- Build eventbus-redemption-bridge -> eventbus-redemption-bridge-heartbeat
- heartbeatIntervalMs und statusPublishIntervalMs als optionale Config-Werte ergänzt
- heartbeatModule() per Timer ergänzt
- publishModuleStatus() gekapselt und periodisch/bei Events nutzbar gemacht
- canBus Diagnoseblock im Modulstatus ergänzt
- MODULE_META.bus.heartbeat auf true gesetzt
```

## Nicht geändert

```text
- Keine neue Backend-Datei
- Kein neuer Helper
- Keine Channelpoints-Redemption-Logik geändert
- Keine Twitch-/EventSub-Logik geändert
- Keine Queue-/Sound-/Alert-/Overlay-Logik geändert
- Keine DB-/Config-Datei angelegt oder geändert
```

## Tests

```powershell
node -c backend\modules\channelpoints_eventsub_bus_bridge.js
.\stepdone.cmd "STEP CAN-2.1 Channelpoints Bridge Heartbeat"
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/eventbus/redemption-bridge/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 10
```

## Erwartung

```text
- channelpoints_eventsub_bus_bridge Version 0.9.2
- canBus.heartbeatCount steigt
- Communication Bus zeigt module:channelpoints_eventsub_bus_bridge mit hasHeartbeat=true
- CAN-2 Matrix-Warnung matrix_channelpoints_eventsub_bus_bridge_warning verschwindet
- Bestehende Redemption-Bridge-Funktion bleibt unverändert
```
