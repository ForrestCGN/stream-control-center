param(
  [string]$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
)

$ErrorActionPreference = "Stop"

function Append-Block {
  param(
    [string]$RelativePath,
    [string]$StartMarker,
    [string]$EndMarker,
    [string]$Body
  )

  $path = Join-Path $RepoRoot $RelativePath
  $dir = Split-Path -Parent $path
  if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
  }

  $block = "`r`n$StartMarker`r`n$Body`r`n$EndMarker`r`n"

  if (Test-Path $path) {
    $current = Get-Content -Raw -Encoding UTF8 $path
    if ($current -like "*$StartMarker*") {
      Write-Host "Schon vorhanden, überspringe: $RelativePath"
      return
    }
    Set-Content -Path $path -Value ($block + "`r`n" + $current) -Encoding UTF8
  } else {
    Set-Content -Path $path -Value $block -Encoding UTF8
  }

  Write-Host "Aktualisiert: $RelativePath"
}

Append-Block `
  -RelativePath "project-state/CURRENT_STATUS.md" `
  -StartMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:CURRENT_STATUS:START -->" `
  -EndMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:CURRENT_STATUS:END -->" `
  -Body @'
## STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

Stand: 2026-06-21

Bestätigt:

- `clip_shoutout` Version `0.2.51` ist aktiv.
- SoundSync-Listener ist installiert und empfängt Sound-Bus-Events.
- Finaler Test `so_sync_final_test_20260621_124845.txt` bestätigt den gewünschten Ablauf:
  - Clip-Shoutout läuft über Sound-System/Overlay.
  - Sound-System meldet `client_audio_ended`.
  - DisplayQueue wird auf `done` gesetzt.
  - OfficialQueue wird erst nach Clip-Ende befüllt.
  - Kein zu frühes offizielles Twitch-Shoutout mehr.

Einschränkung:

- Test lief im Offline-/Grace-Zustand; finaler `officialStatus=sent` muss im nächsten echten Livebetrieb geprüft werden.

Details:

- `docs/current/STEP_SO_SYNC_FINAL_VERIFIED_2026-06-21.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SO_SYNC_2026-06-21.md`
'@

Append-Block `
  -RelativePath "project-state/NEXT_STEPS.md" `
  -StartMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:NEXT_STEPS:START -->" `
  -EndMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:NEXT_STEPS:END -->" `
  -Body @'
## Nächste Schritte nach STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

1. Beim nächsten echten Live-Stream einen finalen SO-Sync-Test durchführen.
2. Einen laufenden Sound/Video im Sound-System haben oder die Queue bewusst beschäftigen.
3. `!so @user --force` auslösen.
4. Prüfen:
   - Clip läuft über Sound-System/Overlay.
   - OfficialQueue wird erst nach Clip-Ende befüllt.
   - Nach Twitch-Cooldown wird `officialStatus=sent` erreicht.
5. Wenn Live-Test bestätigt ist, SO-Sync als stabil dokumentieren.

Nicht tun:

- Alte Timer-Freigabe für Official-SO nicht zurückbringen.
- Official-SO nicht wieder direkt nach Display-Start senden.
- Sound-System-Playback-/Queue-Ownership nicht umgehen.
'@

Append-Block `
  -RelativePath "project-state/TODO.md" `
  -StartMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:TODO:START -->" `
  -EndMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:TODO:END -->" `
  -Body @'
## TODO – Clip-Shoutout SO Sync

- [x] SoundSync-Listener im `clip_shoutout` installieren.
- [x] Sound-System-Fertig-Events empfangen.
- [x] Clip-Ende über `client_audio_ended` verarbeiten.
- [x] DisplayQueue nach echtem Clip-Ende auf `done` setzen.
- [x] OfficialQueue erst nach echtem Clip-Ende befüllen.
- [x] Offline-/Grace-Funktionstest mit `so_sync_final_test_20260621_124845.txt` bestätigen.
- [ ] Im echten Livebetrieb final prüfen, dass der offizielle Twitch-SO nach Cooldown `sent` wird.
- [ ] Danach Status `SO Sync stabil/live bestätigt` dokumentieren.
'@

Append-Block `
  -RelativePath "project-state/CHANGELOG.md" `
  -StartMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:CHANGELOG:START -->" `
  -EndMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:CHANGELOG:END -->" `
  -Body @'
## 2026-06-21 – STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

### Fixed

- `clip_shoutout` verarbeitet Sound-System-Fertig-Events für Clip-Shoutouts korrekt.
- OfficialQueue wird erst nach echtem Clip-Ende über Sound-System/Overlay befüllt.
- Zu frühe offizielle Twitch-Shoutouts während wartender/queued Clip-Playback-Items werden verhindert.

### Confirmed

- Finaler Test: `so_sync_final_test_20260621_124845.txt`.
- DisplayQueue-ID `236` wurde nach `client_audio_ended` auf `done` gesetzt.
- OfficialQueue-ID `177` wurde erst nach `displayFinishedAt` erstellt.

### Follow-up

- Im echten Livebetrieb noch final prüfen, ob `officialStatus=sent` nach Twitch-Cooldown sauber erreicht wird.
'@

Append-Block `
  -RelativePath "project-state/FILES.md" `
  -StartMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:FILES:START -->" `
  -EndMarker "<!-- STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED:FILES:END -->" `
  -Body @'
## Dateien – STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

Geändert im Fix-Step:

```text
backend/modules/clip_shoutout.js
```

Doku / Übergabe:

```text
docs/current/STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX.md
docs/current/STEP_SO_SYNC_FINAL_VERIFIED_2026-06-21.md
docs/current/CURRENT_CHAT_HANDOFF_SO_SYNC_2026-06-21.md
docs/current/NEXT_CHAT_PROMPT_SO_SYNC_2026-06-21.md
tools/docs/apply_so_sync_docs_2026-06-21.ps1
```

Testlogs lokal:

```text
D:\Git\stream-control-center\_tmp\logs\so_sync_final_test_20260621_124845.txt
```

Nicht geändert:

```text
Datenbank
Sound-System
Sound-System-Overlay
Dashboard
Twitch-API-Sendelogik
Clip-Auswahl
Auto-SO-Regeln
```
'@

Write-Host "SO-Sync-Doku-Blöcke wurden append-only aktualisiert."
