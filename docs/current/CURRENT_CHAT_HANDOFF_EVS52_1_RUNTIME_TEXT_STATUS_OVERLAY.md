# CURRENT CHAT HANDOFF – EVS52.1 Runtime-Overlay Satzstatus

Stand: EVS52.1

## Geändert

- Backend `stream_events` auf `0.5.72 / STEP_EVS52_1_RUNTIME_TEXT_STATUS_OVERLAY`.
- Runtime-Overlay-State liefert jetzt einen sicheren `text`-Statusblock.
- `event_runtime_overlay.html` zeigt bei laufendem Text-/Satzteil eine kleine Statuskarte.

## Verhalten

- Bei Sound-Countdown, Sound-Antwortfenster und Sound-Ergebnis bleibt die Sound-Anzeige vorrangig.
- Wenn kein Sound gerade angezeigt wird, aber Text aktiv ist, zeigt das Overlay:
  - Eventname
  - gelöste Sätze / Gesamtzahl
  - offene Sätze
  - Worttreffer
  - letzte Satzlösung

## Sicherheit

- Keine AcceptedAnswers im Overlay-State.
- Keine vollständigen Satztexte im Overlay-State.
- Keine Sound-System-Playback-Änderung.
- Keine Punkte-/DB-Schema-Änderung.

## Tests

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

$o = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state"
$o.phase | ConvertTo-Json -Depth 4
$o.text | ConvertTo-Json -Depth 6
```

## Nächster Schritt

- Live/OBS prüfen: Runtime-Overlay zeigt Satzstatus zwischen Soundrunden.
- Danach ggf. Position/Größe/Einblenddauer optisch feinjustieren.
