# CURRENT CHAT HANDOFF – EVENT-SOUND-5B

Stand: 2026-06-16

## Step

EVENT-SOUND-5B – EventSound-Ausgabeziel an Sound-System-Config koppeln

## Ziel

EventSound-Snippets sollen nicht mehr hart `outputTarget: overlay` erzwingen. Standardmäßig soll das Sound-System seine eigene Ausgabequelle nutzen, damit bestehende Sound-System-Einstellungen wie `defaultOutputTarget`, Device/Overlay/Both und spätere Routing-Regeln nicht umgangen werden.

## Geändert

- `backend/modules/stream_events.js`
  - `MODULE_VERSION` auf `0.5.36`
  - `MODULE_BUILD` auf `STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG`
  - Sound-Defaults erweitert:
    - `outputTarget: "default"`
    - `target: "stream"`
  - Sound-Runtime-Config normalisiert:
    - `outputTarget`: `default|overlay|device|both`
    - `target`: `stream|discord|both`
  - EventSound-Payload setzt `outputTarget` nur noch, wenn explizit nicht `default` konfiguriert ist.
  - Bei `default` entscheidet das Sound-System selbst über `defaultOutputTarget`.

## Nicht geändert

- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html`
- `htdocs/overlays/stream_events/event_runtime_overlay.html`
- Dashboard
- DB-Schema
- normale Sound-Queue
- normale Soundalerts

## Grund

Der letzte Test hat gezeigt: echte Media-Datei und URL waren korrekt, aber das Sound-Overlay meldete Browser-Autoplay-Fehler. Ursache war nicht die Media-Datei, sondern dass EventSound hart `outputTarget: overlay` gesetzt hatte. Mit EVENT-SOUND-5B wird standardmäßig die Sound-System-Ausgabe genutzt.

## Tests nach Deploy + StepDone

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
```

Erwartung:

```text
stream_events 0.5.36 / STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG
```

Sauberer Test:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/reset-test-state?confirm=1"
$ev = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1"
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
$r.playbackResult.soundSystemResult.item | Select-Object soundId,label,file,audioUrl,mediaUrl,durationMs,hasAudio,target,outputTarget
```

Erwartung:

- echtes Media-Snippet
- `outputTarget` leer/nicht explizit gesetzt, sofern keine Config es überschreibt
- Sound-System nutzt seine eigene Standardausgabe
- Countdown bleibt über Runtime-Overlay sichtbar
