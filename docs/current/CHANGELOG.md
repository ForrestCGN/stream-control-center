# CHANGELOG – stream-control-center

Stand: 2026-06-14

## 2026-06-14 – CAN44.42 Real-Test bestätigt

### Ergebnis

```text
CAN44.42 wurde mit echtem OBS/Twitch-Streamstart und echtem Streamende live-real bestätigt.
```

### Bestätigter Streamstart

```text
status = live
live = True
source = twitch_confirmed
confidence = high
streamId = 317679322342
twitchConfirmed = true
obsStarted = true
bandwidthTest = false
lastEventKey = twitch.stream.online
onlineEmitted = 1
offlineEmitted = 0
errors = 0
sessionStarted = 1
sessionConfirmed = 1
```

### Bestätigter AutoShoutout Online-Consumer

```text
moduleVersion = 0.2.49
streamBusSubscriber.installed = True
delivered = 1
onlineReceived = 1
offlineReceived = 0
errors = 0
lastEventKey = twitch.stream.online
lastResultReason = accepted
streamDayId = stream_forrestcgn_20260614t140137581z_pending
streamSessionId = forrestcgn_20260614t140137581z_pending
```

### Bestätigtes Streamende

```text
status = offline
live = False
lastEventKey = twitch.stream.offline
onlineEmitted = 1
offlineEmitted = 1
errors = 0
sessionGrace = 1
sessionEnded = 1
bandwidthTestDetected = 0
```

### Bestätigter AutoShoutout Offline-Consumer

```text
delivered = 2
onlineReceived = 1
offlineReceived = 1
errors = 0
lastEventKey = twitch.stream.offline
lastResultReason = accepted
```

### Bewertung

```text
- twitch.stream.online wurde live-real genau einmal gesendet.
- twitch.stream.offline wurde live-real genau einmal gesendet.
- AutoShoutout empfing beide Events über den Communication Bus.
- StreamSession/StreamDay blieb während des Streams stabil.
- Nach Streamende wurde die aktive Session korrekt geschlossen.
- Keine Fehler, keine doppelten Events, kein Bandbreitentest-Fehlverhalten.
```

### Dateien

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_CAN44_42_SHOUTOUT_AUTOSO_LIVE.md
docs/current/CURRENT_CHAT_HANDOFF_CAN44_43_AFTER_REAL_TEST.md
```

### Nächster Schritt

```text
Tagebuch als nächstes Modul an zentralen StreamState anbinden.
```

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
Live-Real-Test mit echtem Streamstart/Streamende erfolgreich.
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
