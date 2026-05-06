# STEP193.1 - Clip Live-Guard entfernt FULLFILE

Diese ZIP enthält die vollständige Datei:

- backend/modules/clips.js
- project-state/STEP193_1_CLIP_DISABLE_LIVE_GUARD_2026-05-06.md

In dein Repo entpacken:

D:\Git\stream-control-center

Dann:

cd D:\Git\stream-control-center
git status --short
.\stepdone.cmd "fix: remove clip create live guard"
.\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd

Danach Backend neu starten und /api/clip/create testen.
