# CURRENT_STATUS – stream-control-center

Stand: 2026-06-14

## Aktueller bestätigter Stand

```text
CAN44.42 – Shoutout / AutoShoutout / Twitch-Events / Live-Status stabiler Arbeitsstand
```

## Kurzfazit

Der aktuelle Shoutout-/AutoShoutout-/Live-Status-Umbau ist technisch abgeschlossen und intern getestet.

```text
SO / Shoutout:
✅ bestehender Shoutout-Pfad bleibt erhalten
✅ DisplayQueue / OfficialQueue bleiben erhalten

AutoShoutout:
✅ effektive DB-Config ist die Wahrheit
✅ alte JSON-Fallback-Werte werden nicht mehr als aktive Wahrheit angezeigt
✅ AutoShoutout hängt am Communication Bus
✅ AutoShoutout empfängt twitch.stream.online/offline
✅ Pending/Bandbreitentest erzeugen keine falschen Streamtage/Online-Events

Twitch Events / Bus:
✅ twitch_events ist zentrale Twitch-Event-Schicht
✅ Chat-Events werden weiter zentral bereitgestellt
✅ Stream-State / StreamSession werden zentral bereitgestellt
✅ Online/Offline werden über Communication Bus verteilt
✅ Module können abfragen und abonnieren

Live / StreamSession:
✅ Streamtag ist nicht mehr Kalendertag
✅ streamDayId basiert auf StreamSession
✅ Stream über 00:00 bleibt derselbe Streamtag
✅ OBS/Pending, Twitch-Bestätigung, Grace/Ending und Bandbreitentest sind getrennt
✅ Dashboard Manual Override funktioniert
✅ Dashboard zeigt effektiven Override-Status und echte Quellen getrennt
```

## Bestätigte Modulversionen

```text
backend/modules/twitch_events.js       0.1.12  CAN44.41_MANUAL_OVERRIDE_LOCK
backend/modules/clip_shoutout.js       0.2.49  CAN44.37 StreamSession-aware AutoShoutout
backend/modules/stream_status.js       0.1.4   stream_status source-only, twitch_events owner for stream bus
backend/modules/live_status_monitor.js 0.1.5   Live-Status-Monitor Backend
htdocs/dashboard/modules/live_status_monitor.js CAN44.42 Dashboard Effective Stream State Display
```

## Abgeschlossene Schritte seit CAN44.31

### CAN44.32 – AutoShoutout StreamDay Reliability

```text
- Stale/alte StreamDay-Zeilen werden nicht mehr endlos wiederverwendet.
- Alte active/grace StreamDays blockieren AutoShoutout nicht mehr still.
- storeSkippedEvents wurde sichtbar/testbar gemacht.
```

### CAN44.33 – AutoShoutout Settings Truth Fix

```text
- /api/clip-shoutout/settings zeigt settings.autoShoutout jetzt als effektive DB-/Runtime-Wahrheit.
- legacyAutoShoutoutConfig ist nur noch Diagnose/Alt-JSON.
- Das frühere „enabled=false“-Anzeigechaos ist entschärft.
```

### CAN44.34 – Twitch Stream Bus Events

```text
- stream_status wurde zunächst um Online/Offline-Bus-Events erweitert.
- Ergebnis wurde danach zugunsten von twitch_events als zentralem Owner weiterentwickelt.
```

### CAN44.35 – Twitch Events Stream State Provider

```text
- twitch_events wurde zentrale Stream-State-Schicht.
- Online/Offline kann ohne Twitch-EventSub-Abo aus Statusquellen kommen.
- /api/twitch/events/stream-state und Override-Routen wurden eingeführt.
- stream_status wurde source-only; twitch_events besitzt twitch.stream.online/offline.
```

### CAN44.36 – AutoShoutout Stream Bus Consumer

```text
- clip_shoutout/AutoShoutout abonniert twitch.stream online/offline.
- AutoShoutout speichert empfangenen streamState.
```

### CAN44.37 – Stream Session Authority

```text
- StreamSession/StreamDay eingeführt.
- streamDayId ist Stream-basiert, nicht Kalendertag-basiert.
- Statuswerte: offline, pending, live, ending, reconnect, bandwidth_test usw.
- OBS/Pending und Twitch-Bestätigung werden getrennt.
- Bandbreitentest zählt nicht als echter Stream.
```

### CAN44.38 – Stream Session Cleanup

```text
- Bandbreitentest erzeugt kein online/offline Event.
- clear-override räumt Bandbreitentest-Reste auf.
- Diagnose-Counter bandwidthTestDetected ergänzt.
```

### CAN44.39 – Pending Event Guard

```text
- Pending erzeugt kein twitch.stream.offline mehr.
- Offline wird nur gesendet, wenn vorher ein echtes Online-Event veröffentlicht wurde.
- Pending erzeugt eine Session/streamDayId, aber kein Online/Offline.
```

### CAN44.40 – Dashboard Stream-State Override Controls

```text
- Live-Status-Monitor bekam Buttons:
  OBS/Pending simulieren
  Online bestätigt simulieren
  Offline simulieren
  Bandbreitentest
  Override löschen
- TTL-Auswahl ergänzt.
```

### CAN44.41 – Manual Override Lock Fix

```text
- Manual Override ist während active=true harte Wahrheit.
- live_status_monitor darf confirmed-online Override nicht sofort auf ending/offline überschreiben.
- Confirmed Online bleibt provider=manual_override, live=true, status=live.
```

### CAN44.42 – Dashboard Effective Stream State Display

```text
- Dashboard trennt effektiven Stream-State und echte Quellen.
- Bei Override wird unten ONLINE (Override) angezeigt.
- Echte Quellen bleiben separat sichtbar: OBS/Twitch/Streams/Search/stream_status.
```

## Aktueller bestätigter Datenfluss

```text
Twitch/OBS/Statusquellen
  → live_status_monitor / stream_status
  → twitch_events Stream-State Provider
  → Communication Bus
  → Consumer-Module, z. B. clip_shoutout AutoShoutout
```

Für Chat:

```text
Twitch Chat / EventSub / IRC
  → twitch_events
  → Communication Bus twitch.chat/message
  → Module abonnieren selektiv
```

Für Stream-State:

```text
OBS/Pending/Manual/Twitch API
  → twitch_events streamState + streamSession
  → Bus Events:
     twitch.stream.online
     twitch.stream.offline
  → Module können zusätzlich GET /api/twitch/events/stream-state abfragen
```

## Dashboard-Verhalten

```text
Live-Status Monitor:
- Stream-State Override zeigt Test-/Override-Zustand.
- Effektiver Stream-State zeigt den Zustand, der für Module gilt.
- Echte Quellen zeigen OBS/Twitch/API-Rohstatus getrennt.
```

Bestätigtes Beispiel:

```text
Effektiver Stream-State:
ONLINE (Override)

Quelle:
manual_override

Echte Quellen:
OBS NEIN
Twitch /streams NEIN
Twitch Search NEIN
Stream Status NEIN
```

## Noch nicht real getestet

```text
Echter OBS-Streamstart:
OBS StreamStarted
→ pending
→ Twitch /streams bestätigt
→ live
→ echte streamId
→ stabile streamDayId
→ AutoShoutout nutzt diese Session
```

Dieser Test ist erst beim nächsten echten Streamstart möglich.

## Aktueller Status

```text
SO / AutoSO / Live: intern abgeschlossen.
Nächster Real-Test: nächster echter Streamstart.
Keine akuten Codeänderungen offen.
```

## Wichtige Projektregeln

```text
Keine Funktionalität entfernen.
SQLite-Datenbank niemals überschreiben/ersetzen.
GitHub/dev und echte Dateien als Single Source of Truth verwenden.
ZIPs immer mit echten Zielpfaden liefern.
Bei neuem STEP StepDone ausführen.
Bei Dashboard-Arbeiten zuerst prüfen, welche Datei die sichtbare Ansicht rendert.
```
