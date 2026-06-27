# Restore: Backend EVS52.19 + Dashboard/Overlay EVS52.21

Zweck: Wiederherstellung des zuletzt gemeinsam getesteten Stands vor den fehlerhaften EVS52.22-/Mischstand-Arbeiten.

Quelle:
- Backend: STEP_EVS52_19_WINNER_FINALE_MANUAL_END.zip
- Dashboard + Winner-Overlay: STEP_EVS52_21_WINNER_FINALE_REPLAY_BUTTON.zip

Enthaltene Dateien:
- backend/modules/stream_events.js
- htdocs/dashboard/modules/stream_events.js
- htdocs/overlays/stream_events/event_winner_overlay.html

Nicht enthalten / nicht geändert:
- keine Datenbank
- keine Config
- keine CSS-Datei
- keine weiteren Backend-Module
- kein Reveal-Video-Fix EVS52.22

Nach Entpacken in D:\Git\stream-control-center:
.\stepdone.cmd "RESTORE EVS52.19 Backend + EVS52.21 Dashboard"

Danach Backend neu starten und Dashboard mit STRG+F5 hart neu laden.
