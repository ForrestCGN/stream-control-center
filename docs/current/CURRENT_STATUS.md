# CURRENT_STATUS – stream-control-center

Stand: 2026-06-15

## Aktueller bestätigter Stand

```text
LC-CORE-LIVE-1.1 – Loyalty nutzt twitch_events Stream-State als effektive Live-Wahrheit
```

## Kurzfazit

Der aktuelle bestätigte Stand erweitert den stabilen CAN44.42 Shoutout-/AutoShoutout-/Twitch-Events-/Live-Status-Stand um die Loyalty-Core-Anbindung an den zentralen Stream-State.

Loyalty liest für Live/Offline-Entscheidungen jetzt nicht mehr die rohe `stream_status`-/Twitch-API-Abfrage mit `forceApi=1`, sondern die effektive zentrale Stream-State-Wahrheit aus `twitch_events`:

```text
/api/twitch/events/stream-state
```

Damit verwendet Loyalty dieselbe Quelle, die auch der Live-Status-Monitor für den effektiven Override-Zustand nutzt.

## Bestätigt am 2026-06-15

### LC-CORE-LIVE-1

```text
- Loyalty wurde an eine zentrale Statusquelle angebunden.
- Alter lokaler Manual-Blocker in loyalty_stream_state wurde deaktiviert.
- Binding-/Diagnoserouten wurden ergänzt:
  GET  /api/loyalty/stream-status-binding/status
  GET  /api/loyalty/stream-status-binding/sync
  POST /api/loyalty/stream-status-binding/sync
```

Ergebnis aus dem ersten Test:

```text
binding.installed = true
subscriptionId = loyalty:twitch.stream:central_status
errors = 0
manual.active = false
```

### LC-CORE-LIVE-1.1

```text
- Falsche Quelle /api/stream-status/status?forceApi=1 wurde ersetzt.
- Neue Quelle ist /api/twitch/events/stream-state.
- Parser berücksichtigt manualOverride.active, live, status, provider/source, streamSessionId und streamDayId.
- Online-Override-Test erfolgreich.
- Override-Clear/Offline-Test erfolgreich.
```

Online-Test mit Dashboard-Override:

```text
url = /api/twitch/events/stream-state
parsed.live = true
parsed.source = manual_override
parsed.manualOverrideActive = true
state.effective.live = true
runner.enabled = true
runner.timerActive = true
```

Offline-Test nach Override-Clear:

```text
url = /api/twitch/events/stream-state
parsed.live = false
parsed.source = live_status_monitor
parsed.manualOverrideActive = false
state.effective.live = false
runner.enabled = false
runner.timerActive = false
```

## Aktuelle fachliche Wahrheit

```text
twitch_events ist zentrale Twitch-/Stream-State-Schicht.
/api/twitch/events/stream-state ist die effektive Live-Wahrheit für Module.
stream_status bleibt source-only und darf nicht als alleinige Effektiv-Wahrheit genutzt werden.
Live-Status-Monitor zeigt effektiven Stream-State und echte Quellen getrennt.
Loyalty ist Consumer des zentralen Stream-State.
```

## Wichtige bestätigte Modulbereiche

```text
backend/modules/twitch_events.js        zentrale Stream-State-/Bus-Schicht
backend/modules/stream_status.js        source-only Statusquelle
backend/modules/live_status_monitor.js  Diagnose/Quellenvergleich
backend/modules/clip_shoutout.js        AutoShoutout Consumer
backend/modules/loyalty.js              Loyalty Core, jetzt Stream-State Consumer
```

## Aktueller nächster Arbeitsblock

```text
LC-CORE-CLEANUP-1 – alte Loyalty-StreamState-/Twitch-Direktlogik entfernen
```

Ziel: Jetzt nicht nur deaktivieren, sondern wirklich alte, nicht mehr benötigte Logik entfernen. Vorher müssen echte Verwendungen im Code geprüft werden.

## Verbindliche Arbeitsregel aus diesem Stand

```text
StepDone-Reihenfolge:
1. Dateien/ZIP einspielen/deployen
2. stepdone.cmd ausführen
3. danach testen
4. nach erfolgreichem Test kein zweites StepDone
```
