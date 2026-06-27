# NEXT TODO – STEP279 Heartbeat Standard

## Ziel

Ein einheitlicher Heartbeat-Standard für Module im `stream-control-center`.

## Nicht-Ziele

- keine komplette Modulmigration
- keine produktiven Abläufe ersetzen
- keine Heartbeat-Pflicht für reine API-/Helper-Module
- kein Spam durch alle Module alle paar Sekunden

## Vorschlag Datenmodell

```json
{
  "module": "sound_system",
  "version": "0.1.18",
  "status": "ok",
  "startedAt": "ISO_DATE",
  "lastSeenAt": "ISO_DATE",
  "uptimeMs": 123456,
  "lastAction": "queue_idle",
  "lastError": "",
  "details": {
    "queueLength": 0,
    "active": false
  }
}
```

## Offene Entscheidungen

- Heartbeat-Intervall für Kernmodule
- Statuswerte finalisieren
- Wo Heartbeats gespeichert werden
- Wie lange alte Heartbeats gültig bleiben
- Wie Dashboard offline/stale/warning/error anzeigen soll

## Empfohlene Pilot-Umsetzung

1. `communication_bus.js`: Registry/Storage vorbereiten
2. `/api/communication/status`: Heartbeats anzeigen
3. `sound_system.js`: erster Pilot
4. `alert_system.js`: zweiter Pilot
5. `obs.js`: dritter Pilot
6. Dashboard-Ansicht planen

