# STEP195 - Twitch title/duration FULLFILE

Diese ZIP enthält vollständige Dateien:

- backend/modules/clips.js
- backend/modules/twitch.js
- project-state/STEP195_CLIP_TWITCH_TITLE_DURATION_2026-05-06.md

In dein Repo entpacken:

D:\Git\stream-control-center

Dann:

cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "feat: pass title and duration to twitch clip create"
.\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd

Backend neu starten.

Test:

cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=BackendTitelTest&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 60
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=3" | ConvertTo-Json -Depth 30

Dann Twitch-Clip öffnen und sichtbaren Titel prüfen.
