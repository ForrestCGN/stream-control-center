# CURRENT CHAT HANDOFF – EVENT-SOUND-2

Stand: 2026-06-16

## Step

`EVENT-SOUND-2 – Sound-System PreRoll-Gate minimal additiv vorbereitet`

## Ziel

Der Countdown vor einem Event-Sound wird nicht vom Overlay und nicht am Sound-System vorbei gesteuert.
Das Sound-System bleibt Playback-/Queue-Owner und reserviert den Sound zuerst. Erst danach wird über den Communication/EventBus das Event-Runtime-Overlay informiert.

## Geänderte Dateien

```text
backend/modules/sound_system.js
backend/modules/stream_events.js
docs/current/CURRENT_CHAT_HANDOFF_EVENT_SOUND_2.md
```

## Sound-System

`backend/modules/sound_system.js`

Version:

```text
0.1.23
STEP_EVENT_SOUND_2_PREROLL_GATE
```

Neu/additiv:

```text
GET /api/sound/event-preroll/status
```

Der neue Gate läuft nur für Sound-Items, die explizit als Stream-Events-PreRoll markiert sind, z. B. über `meta.eventPreRoll.enabled=true` und `owner/module/eventUid/roundUid` aus `stream_events`.

Normale Sounds, Alerts, Soundalerts, Tests und bestehende Queue-Flows bleiben unverändert, solange dieses Flag nicht gesetzt ist.

## Gate-Punkt

```text
sound_system.startItem(item)
```

Genauer:

```text
nach state.current/state.parallel Reservierung
vor item_starting / activateItemAudio(item)
```

Dadurch kann kein anderer Sound zwischen Countdown und exakt diesem Sound dazwischenfunken.

## Runtime-Overlay-Kommunikation

Sound-System sendet über den bestehenden Communication/EventBus:

```text
channel: stream_events.runtime
target.capability: stream_events.runtime_display
```

Aktionen:

```text
countdown.start
guessing.start
hide
cancel
failed
```

Das Runtime-Overlay startet keinen Sound. Es zeigt nur State/Animation.

## Stream-Events

`backend/modules/stream_events.js`

Version:

```text
0.5.28
STEP_EVENT_SOUND_2_PREROLL_GATE
```

Neu/additiv:

- Stream-Events abonniert `stream_events.runtime` Bus-Events.
- `runtime-overlay/state` kann Countdown-/Guessing-State aus den Sound-System-Bus-Events ableiten.
- Prepared Sound-Payloads enthalten jetzt eine zukünftige `meta.eventPreRoll`-Struktur, ohne aktuell selbst Sound zu starten.

## Nicht geändert

```text
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/stream_events/event_runtime_overlay.html
Dashboard
DB-Schema
Media-System
Antwort-/Punkte-Logik
normale Sound-Queue für nicht markierte Items
```

## Safety-Regeln

```text
Sound-System bleibt Playback-/Queue-Owner.
Runtime-Overlay startet keinen Sound.
Sound-System-Overlay bleibt unverändert.
Kein neues WebSocket-System.
Communication/EventBus wird mit Target-Capabilities genutzt.
Normale Sounds bleiben ohne explizites PreRoll-Flag unverändert.
```

## Tests nach Deploy + StepDone

Erst einspielen/deployen, dann:

```powershell
.\stepdone.cmd "EVENT-SOUND-2 - Sound-System PreRoll Gate minimal additiv vorbereitet"
```

Danach testen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.eventPreRoll
```

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/status"
$p | Select-Object ok,module,moduleVersion,moduleBuild,step,prepared,enabled,active
$p.safetyRules
$p.last
```

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
$e.runtimeOverlay.busBridge
$e.eventSoundBusIntegration
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.mode
$r.phase
$r.countdown
```

## Erwartung

```text
sound_system moduleVersion: 0.1.23
sound_system moduleBuild: STEP_EVENT_SOUND_2_PREROLL_GATE
stream_events moduleVersion: 0.5.28
stream_events moduleBuild: STEP_EVENT_SOUND_2_PREROLL_GATE
sound eventPreRoll prepared/enabled = true
runtimeOverlay.busBridge.subscribed = true
normale Sounds starten weiterhin wie vorher
```

## Nächster Schritt

`EVENT-SOUND-3` sollte erst nach diesen Status-Tests geplant werden.
Dann kann ein gezielter Test-Sound mit explizitem `meta.eventPreRoll`-Flag durch den realen Sound-System-Flow laufen.
