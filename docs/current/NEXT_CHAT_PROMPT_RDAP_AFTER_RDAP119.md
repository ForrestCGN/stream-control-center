Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
GitHub/dev ist Wahrheit. Erst Startdateien wirklich lesen, dann Plan nennen, dann auf `go` warten.

Verbindliche Arbeitsweise:
- Immer zuerst echte Dateien aus GitHub/dev lesen.
- Keine Code-/ZIP-Erstellung vor `go`.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine parallelen Strukturen erfinden.
- Modulnamen sprechend halten, keine kryptischen Stepnamen als sichtbare Modulnamen.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber: `stepdone.cmd`.
- Webserver-Deploy nur nach Codeaenderungen in `remote-modboard/` und erst nach `stepdone`.
- Deploy-Standard: `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev`.
- Produktive Writes nur mit separatem Scope, Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.

Pflicht-Startdateien:
- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
- `docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md`
- `docs/current/CURRENT_REMOTE_MODBOARD_STATE.md`
- `docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md`
- `docs/current/RDAP119_MODULAR_UI_AND_LOCAL_DASHBOARD_FOUNDATION.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`

Aktueller Stand nach RDAP119:
- `index.html` ist zur Shell reduziert.
- Menue-/Seiteninhalte werden ueber sprechende Moduldateien nachgeladen.
- Core-Loader liegt in `remote-modboard/backend/public/assets/remote-modboard.js`.
- Erste ausgelagerte Module liegen unter `remote-modboard/backend/public/assets/modules/...`.
- Local-Dashboard-Grundlage ist vorbereitet ueber `REMOTE_MODBOARD_MODE`, `REMOTE_MODBOARD_HOST` und `REMOTE_MODBOARD_LOCAL_ALLOWED_CIDRS`.
- Keine DB-Migration.
- Keine neuen produktiven Writes.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.

Naechster sinnvoller Schritt:
- RDAP120: Browser-/Deploy-Auswertung und dann weitere Module aus altem Dashboard read-only uebernehmen, zuerst OBS-/Streamer.bot-Status read-only.
