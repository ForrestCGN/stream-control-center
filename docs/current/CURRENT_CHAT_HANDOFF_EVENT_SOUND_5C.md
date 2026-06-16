# CURRENT CHAT HANDOFF – EVENT-SOUND-5C

Stand: 2026-06-16

## Ziel

Runtime-/Countdown-Overlay soll wieder sichtbar werden, auch wenn die direkte Communication-Bus-Zustellung an den Overlay-Client `deliveredCount: 0` liefert.

## Hintergrund

Nach EVENT-SOUND-5B funktioniert das echte Sound-Snippet-Playback ueber die Sound-System-Config. Der Ton ist hoerbar.

Die PreRoll-Events werden vom Sound-System korrekt erzeugt:

- `countdown.start`
- `guessing.start`
- `hide`

Status zeigte aber:

- `deliveredCount: 0`
- `subscriberDeliveredCount: 1`

Das Backend/Stream-Events-Bridge bekommt die Events, der geoeffnete Runtime-Overlay-Client aber nicht direkt.

## Geaendert

Datei:

- `htdocs/overlays/stream_events/event_runtime_overlay.html`

Overlay-Version:

- `0.2.5` -> `0.2.6`

## Fix

Das Runtime-Overlay hat jetzt einen Fallback-Poll auf:

- `/api/sound/event-preroll/status`

Wenn `/api/stream-events/runtime-overlay/state` gerade `hidden` oder nicht sichtbar liefert, liest das Overlay die letzten PreRoll-Events direkt aus dem Sound-System-Status und baut daraus lokal einen sichtbaren Overlay-State:

- `countdown.start` -> Countdown sichtbar
- `guessing.start` -> `LOS! / Jetzt raten!` sichtbar
- `hide/cancel/failed` -> Overlay ausblenden

Polling wurde fuer diese Runtime-Phase auf ca. 300 ms gesetzt.

## Nicht geaendert

- `backend/modules/stream_events.js`
- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html`
- Dashboard
- DB
- Sound-Playback

## Test

Nach Einspielen/Deploy:

```powershell
.\stepdone.cmd "EVENT-SOUND-5C - Runtime Overlay PreRoll Fallback fuer Countdown Anzeige"
```

Danach Browserquelle einmal refreshen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

Dann Test:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/reset-test-state?confirm=1"
$ev = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1"
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
```

Erwartung:

- Countdown 3/2/1 sichtbar
- danach `LOS! / Jetzt raten!`
- echter Sound bleibt hoerbar
- Overlay blendet nach Sound-Ende wieder aus

