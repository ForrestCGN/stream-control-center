# STEP193.1 - Clip Live-Guard entfernen

In dein Repo entpacken:
D:\Git\stream-control-center

Dann ausführen:
cd D:\Git\stream-control-center
.\tools\clip_step193_1_disable_live_guard.cmd

Danach:
git status --short
.\stepdone.cmd "fix: remove clip create live guard"
.\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd

Backend neu starten.

Dann /api/clip/create erneut testen.
