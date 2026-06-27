# HT3.0 – HypeTrain Event-Aktionen + Overlay-Basis

## Ziel

HypeTrain soll künftig technische Möglichkeiten für Sounds und Overlay-Einblendungen bei Start, Stufenaufstieg, Ende und Rekord besitzen. Die fertigen Designs/Animationen werden später gebaut.

## Umsetzung

### Backend

Datei:

```text
backend/modules/hypetrain.js
```

Version/Build:

```text
0.2.0 / STEP_HT3_0_HYPETRAIN_EVENT_ACTIONS_OVERLAY_BASE
```

Neue Event-Actions:

```text
start
levelUp
end
record
```

Sounds werden ausschließlich über das bestehende Sound-System per `/api/sound/play` angefordert.

### Overlay

Datei:

```text
htdocs/overlays/hypetrain/hypetrain_overlay.html
```

Das Overlay ist absichtlich leer/transparent. Mit `?debug=1` zeigt es empfangene Events an.

## Standardverhalten

Alle neuen Sound- und Overlay-Aktionen sind standardmäßig deaktiviert.

HT2.9 bleibt unverändert:

- HypeTrain-Ende schreibt ins Tagebuch.
- Discord sichtbarer Name kommt vom Tagebuch-Webhook (`CGN Posty`).
- Direkt-Discord bleibt aus.
- Rekord-Sound-EndAction bleibt aus, solange nicht aktiviert.

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild

$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/hypetrain/test/event-actions?confirm=1" `
  -ContentType "application/json" `
  -Body '{"actionType":"start","level":1,"points":1200}'

$r.result | Select-Object actionType,dryRun,trigger
$r.result.actions.sound | Select-Object ok,dryRun,wouldRun,skipped,reason
$r.result.actions.overlay | Select-Object ok,dryRun,wouldRun,skipped,reason,channel
```
