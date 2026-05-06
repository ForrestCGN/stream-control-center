# STEP193.3 - Clip Replay Prefix Fix

In dein Repo entpacken:

D:\Git\stream-control-center

Danach:

cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "fix: select replay files by prefix for clip rename"
.\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd

Backend neu starten.

Dann testen:

cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=LiveBackendTest4&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 60
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=3" | ConvertTo-Json -Depth 30
