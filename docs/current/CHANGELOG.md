# CHANGELOG – stream-control-center

Stand: 2026-06-14

## 2026-06-14 – CAN44.42 Dashboard Effective Stream State Display

### Ergebnis

```text
Live-Status-Monitor trennt jetzt:
- Effektiver Stream-State
- Echte Quellen

Bei aktivem Manual Override zeigt der Effektiv-Block ONLINE (Override), während OBS/Twitch/stream_status als echte Quellen weiter separat angezeigt werden.
```

### Dateien

```text
htdocs/dashboard/modules/live_status_monitor.js
htdocs/dashboard/modules/live_status_monitor.css
```

## 2026-06-14 – CAN44.41 Manual Override Lock Fix

### Ergebnis

```text
Manual Override ist während active=true harte Wahrheit.
Confirmed Online bleibt stabil live=true/status=live/provider=manual_override.
live_status_monitor überschreibt confirmed-online nicht mehr sofort zu ending/offline.
```

### Bestätigt

```text
status = live
live = True
provider = manual_override
source = manual_override
lastEventKey = twitch.stream.online
streamSession.twitchConfirmed = true
```

## 2026-06-14 – CAN44.40 Dashboard Stream-State Override Controls

### Ergebnis

```text
Live-Status-Monitor bekam Testbuttons:
- OBS/Pending simulieren
- Online bestätigt simulieren
- Offline simulieren
- Bandbreitentest
- Override löschen
- TTL-Auswahl
```

## 2026-06-14 – CAN44.39 Pending Event Guard

### Ergebnis

```text
Pending erzeugt kein twitch.stream.offline mehr.
offline wird nur gesendet, wenn vorher wirklich online emitted wurde.
```

### Bestätigt

```text
status = pending
live = False
streamSession.active = True
streamDayId vorhanden
onlineEmitted = 0
offlineEmitted = 0
lastEventKey = ""
```

## 2026-06-14 – CAN44.38 Stream Session Cleanup

### Ergebnis

```text
Bandbreitentest erzeugt kein Online/Offline.
clear-override räumt bandwidthTest/closedReason sauber auf.
Counter bandwidthTestDetected ergänzt.
```

## 2026-06-14 – CAN44.37 Stream Session Authority

### Ergebnis

```text
StreamSession/StreamDay eingeführt.
Streamtag nach Stream statt Kalendertag.
Pending, live, ending, reconnect, bandwidth_test getrennt.
AutoShoutout nutzt zentralen streamState/streamDayId.
```

## 2026-06-14 – CAN44.36 AutoShoutout Stream Bus Consumer

### Ergebnis

```text
clip_shoutout/AutoShoutout abonniert twitch.stream online/offline.
Consumer-Test mit Manual Override erfolgreich.
```

## 2026-06-14 – CAN44.35 Twitch Events Stream State Provider

### Ergebnis

```text
twitch_events wurde zentraler Owner für twitch.stream.online/offline.
stream_status bleibt source-only.
Manual Override und stream-state Routen eingeführt.
```

## 2026-06-14 – CAN44.34 Twitch Stream Bus Events

### Ergebnis

```text
Zwischenschritt: Online/Offline über Bus vorbereitet.
Danach in CAN44.35 korrekt in twitch_events zentralisiert.
```

## 2026-06-14 – CAN44.33 AutoShoutout Settings Truth Fix

### Ergebnis

```text
settings.autoShoutout zeigt effektive DB-/Runtime-Config.
legacyAutoShoutoutConfig ist nur noch Diagnose.
```

## 2026-06-14 – CAN44.32 AutoShoutout StreamDay Reliability

### Ergebnis

```text
Stale StreamDays werden nicht mehr endlos weiterverwendet.
StreamDay-Fallback blockiert AutoShoutout nicht mehr still über neue Streamtage hinweg.
```

## Vorheriger dokumentierter Stand

```text
CAN44.31 – AutoShoutout Bus + ShoutoutV2 Activity Bridge
```

Diese Doku ersetzt den alten CAN44.31-Doku-Fokus für den aktuellen Shoutout/AutoSO/Live-Arbeitsstand.
