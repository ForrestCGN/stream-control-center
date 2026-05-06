# STEP194 - Clip Chat Helper

In dein Repo entpacken:

D:\Git\stream-control-center

Danach:

cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "feat: send clip chat messages from backend"
.\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd

Backend neu starten.

Vor Test:
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status" | ConvertTo-Json -Depth 30

Dann Clip-Test:
cd D:\Streaming\stramAssets

try {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip/create?input=LiveBackendTest5&triggerUser=ForrestCGN&triggerLogin=forrestcgn" | ConvertTo-Json -Depth 30
} catch {
  $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 30
}

Start-Sleep -Seconds 60
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/history?limit=3" | ConvertTo-Json -Depth 30
