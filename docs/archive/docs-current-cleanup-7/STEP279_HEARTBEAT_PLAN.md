# STEP279 Heartbeat-Plan

Stand: 2026-06-01

## Ziel

Heartbeat soll als Diagnose- und Dashboard-Grundlage dienen. Er soll keine produktive Logik ersetzen.

## Warum sinnvoll

Module koennen regelmaessig oder ereignisbasiert melden:

```text
Ich lebe noch
Ich bin bereit
Meine Queue hat X Eintraege
Meine letzte Aktion war Y
Mein letzter Fehler war Z
Mein Zustand ist ok/warning/error
```

## Empfohlenes Eventformat

```json
{
  "op": "module.heartbeat",
  "module": "sound_system",
  "version": "0.1.18",
  "status": "ok",
  "startedAt": "2026-06-01T00:00:00.000Z",
  "lastSeenAt": "2026-06-01T00:00:30.000Z",
  "uptimeMs": 30000,
  "lastAction": "queue.idle",
  "lastError": "",
  "details": {}
}
```

## Statuswerte

```text
ok       Modul laeuft normal
idle     Modul laeuft, aktuell nichts zu tun
warning  Modul laeuft, aber es gibt Auffaelligkeiten
error    Modul hat einen Fehlerzustand gemeldet
disabled Modul ist bewusst deaktiviert
unknown  kein Heartbeat oder Status abgelaufen
```

## Sinnvolle Pilotmodule

```text
sound_system.js
alert_system.js
obs.js
```

Danach:

```text
twitch.js
twitch_presence.js
overlay_monitor.js
stream_status.js
message_rotator_scheduler.js
channelpoints_eventsub_bus_bridge.js
vip_sound_overlay.js
```

## Frequenzvorschlag

```text
Kernmodule: alle 10-30 Sekunden
Queue-/Scheduler-Module: bei Queue-/Statusaenderung + gelegentlich
API-Module: loaded/ready/error, kein Dauerfeuer
Helper-/Core-Module: kein Heartbeat, nur Status/Meta
```

## Wichtig

```text
Heartbeat ist Diagnose, nicht Steuerlogik.
Keine produktiven Flows ersetzen.
Keine Funktionalitaet entfernen.
```
