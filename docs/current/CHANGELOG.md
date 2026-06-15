# CHANGELOG – stream-control-center

Stand: 2026-06-15

## 2026-06-15 – LC-CORE-LIVE-1.1 Loyalty nutzt twitch_events Stream-State

### Ergebnis

```text
Loyalty nutzt für Live/Offline-Entscheidungen jetzt /api/twitch/events/stream-state.
Die vorherige Quelle /api/stream-status/status?forceApi=1 war für Override-Tests falsch, weil sie rohe Twitch-API/source-only Daten lieferte.
```

### Bestätigt Online Override

```text
url = /api/twitch/events/stream-state
parsed.live = true
parsed.source = manual_override
parsed.manualOverrideActive = true
state.effective.live = true
runner.enabled = true
runner.timerActive = true
```

### Bestätigt Override-Clear / Offline

```text
url = /api/twitch/events/stream-state
parsed.live = false
parsed.source = live_status_monitor
parsed.manualOverrideActive = false
state.effective.live = false
runner.enabled = false
runner.timerActive = false
```

### Dateien

```text
backend/modules/loyalty.js
docs/current/STEP_LC_CORE_LIVE_1_1_LOYALTY_TWITCH_EVENTS_STREAM_STATE.md
```

### Bewertung

```text
LC-CORE-LIVE-1.1 ist fachlich bestätigt.
Loyalty liest jetzt dieselbe effektive Stream-State-Wahrheit wie der Live-Status-Monitor.
Der nächste Schritt kann echtes Aufräumen alter Loyalty-StreamState-/Twitch-Direktlogik sein.
```

## 2026-06-15 – LC-CORE-LIVE-1 Loyalty initiale zentrale Anbindung

### Ergebnis

```text
Loyalty wurde initial an zentrale Stream-Status-/Bus-Strukturen angebunden.
Binding-Routen wurden ergänzt.
Alter lokaler Manual-Blocker in loyalty_stream_state wurde entfernt/deaktiviert.
```

### Dateien

```text
backend/modules/loyalty.js
docs/current/STEP_LC_CORE_LIVE_1_LOYALTY_CENTRAL_STREAM_STATUS.md
```

### Nachkorrektur

```text
Die erste Implementierung nutzte /api/stream-status/status?forceApi=1.
Das war für den effektiven Override-Status nicht korrekt und wurde in LC-CORE-LIVE-1.1 korrigiert.
```

## 2026-06-15 – Dokumentationsregel StepDone/Test

```text
StepDone wird künftig nach Einspielen/Deploy und vor Tests ausgeführt.
Nach erfolgreichem Test wird kein zweites StepDone ausgeführt.
```

## 2026-06-14 – CAN44.42 Real-Test bestätigt

```text
CAN44.42 wurde mit echtem OBS/Twitch-Streamstart und echtem Streamende live-real bestätigt.
AutoShoutout empfing twitch.stream.online/offline über den Communication Bus.
StreamSession/StreamDay blieb stabil.
Keine doppelten Events, keine Fehler, kein Bandbreitentest-Fehlverhalten.
```
