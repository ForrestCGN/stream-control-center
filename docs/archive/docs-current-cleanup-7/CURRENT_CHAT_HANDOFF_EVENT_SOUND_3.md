# CURRENT CHAT HANDOFF – EVENT-SOUND-3

Stand: 2026-06-16

## Step

`EVENT-SOUND-3 – Kontrollierter EventSound-PreRoll-Testflow`

## Ziel

Der Sound-System-PreRoll-Gate aus EVENT-SOUND-2 kann jetzt kontrolliert getestet werden, ohne normale Sounds, Soundalerts, Dashboard oder das Sound-Overlay umzubauen.

Der Testflow läuft bewusst über das Sound-System:

1. Test-Request mit `confirm=1`
2. Sound-System erstellt ein explizit als `stream_events` markiertes Test-Item
3. Sound-System reserviert das Item in der normalen Queue/Current-Logik
4. Sound-System sendet Runtime-Bus-Event `countdown.start`
5. Event-Runtime-Overlay zeigt Countdown
6. Sound-System sendet `guessing.start`
7. Sound-System startet Playback
8. bei `audio-ended` oder Fallback sendet Sound-System `hide`

## Geänderte Dateien

- `backend/modules/sound_system.js`
- `backend/modules/stream_events.js`

## Versionen

- `sound_system.js`: `0.1.24`, Build `STEP_EVENT_SOUND_3_PREROLL_TEST_FLOW`
- `stream_events.js`: `0.5.29`, Build `STEP_EVENT_SOUND_3_PREROLL_TEST_FLOW`

## Neue Route

```text
GET  /api/sound/event-preroll/test?confirm=1
POST /api/sound/event-preroll/test?confirm=1
```

Die Route nutzt ausschließlich einen generierten Beep (`generated_beep`) und benötigt bewusst `confirm=1`.

Optionale Parameter:

```json
{
  "countdownSeconds": 3,
  "durationMs": 1200,
  "frequency": 880,
  "volume": 0.35,
  "caption": "Sound startet gleich",
  "finalLabel": "LOS!",
  "guessingLabel": "Jetzt raten!"
}
```

`countdownSeconds` ist bereits vorbereitet und konfigurierbar. Default ist 3 Sekunden, aber Tests können z. B. 5 Sekunden nutzen.

## Nicht geändert

- `htdocs/overlays/sound_system_overlay.html`
- `htdocs/overlays/stream_events/event_runtime_overlay.html`
- normale Sound-Queue für nicht markierte Items
- normale Soundalerts
- Dashboard
- DB-Schema
- Media-System
- Antwort-/Punkte-Logik

## Sicherheitsregeln

- Sound-System bleibt Playback-/Queue-Owner.
- Runtime-Overlay startet niemals Sound.
- PreRoll-Gate greift nur bei explizitem `meta.eventPreRoll.enabled=true` und Owner `stream_events`.
- Test-Route benötigt `confirm=1`.
- Test nutzt generierten Beep, keinen frei geratenen Sound.
- Countdown-Dauer ist nicht hart auf 3 Sekunden festgelegt.

## Tests nach Deploy + StepDone

Erst deployen, dann:

```powershell
.\stepdone.cmd "EVENT-SOUND-3 - Kontrollierter EventSound PreRoll Testflow"
```

Dann prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.eventPreRoll.testFlow
```

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
$e.eventSoundBusIntegration
```

Route ohne Confirm muss blocken:

```powershell
try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test"
} catch {
  $_.Exception.Response.StatusCode.value__
}
```

Kontrollierter Test mit 3 Sekunden:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test?confirm=1&countdownSeconds=3"
$t | Select-Object ok,module,moduleVersion,moduleBuild,step,message,countdownSeconds,durationMs
$t.result
```

Kontrollierter Test mit 5 Sekunden:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/test?confirm=1&countdownSeconds=5&durationMs=1500"
$t | Select-Object ok,module,moduleVersion,moduleBuild,step,message,countdownSeconds,durationMs
```

Während/nach Test:

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/event-preroll/status"
$p | Select-Object ok,module,moduleVersion,moduleBuild,step,prepared,enabled,active
$p.last
$p.recentEvents | Select-Object -First 10
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.phase
$r.countdown
```

Overlay sichtbar offen halten:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

## Erwartung

- Countdown erscheint im Event-Runtime-Overlay.
- Nach Countdown startet der generierte Beep über das Sound-System.
- `LOS!` / `Jetzt raten!` bleibt während Playback sichtbar.
- Nach `audio-ended` oder Fallback blendet das Runtime-Overlay wieder aus.
- Normale Sounds bleiben unverändert.

## Nächster sinnvoller Schritt

`EVENT-SOUND-4` – EventSound-Playback aus einer echten vorbereiteten Soundrunde kontrolliert an das Sound-System übergeben, weiterhin nur explizit und nicht über produktive Live-Buttons.
