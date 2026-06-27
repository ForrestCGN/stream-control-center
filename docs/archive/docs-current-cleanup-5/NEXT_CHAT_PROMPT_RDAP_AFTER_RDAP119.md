Du bist im Projekt stream-control-center / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten.
Erst die Startdateien wirklich lesen, dann Plan nennen, dann auf go warten.

Verbindliche Arbeitsweise:
- Immer zuerst die genannten Startdateien wirklich aus GitHub/dev lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine parallelen Strukturen erfinden.
- Neue Dateien nur, wenn fachlich wirklich getrennt ist.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.
- Webserver Deploy Standard:
  bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh STEP_NAME dev
- Produktive Writes nur mit separatem Scope, Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.

Lies zuerst wirklich aus GitHub/dev:

docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP_WORKFLOW_DEPLOY_STANDARD_UPDATE_2026-06-25.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP119.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md

Aktueller Stand:
- RDAP119_STREAMING_PC_CONNECTION_CLIENT_MVP ist vorbereitet.
- backend/modules/remote_agent.js ist jetzt lokaler Streaming-PC-Verbindungsclient-MVP.
- Der lokale Server kann ausgehend zu wss://mods.forrestcgn.de/agent-ws verbinden.
- Heartbeat wird als rdap-agent-heartbeat.v1 gesendet.
- Lokaler lesbarer Status: /api/streaming-pc-connection/status.
- Bestehende Route /api/remote-agent/status bleibt erhalten.
- Webserver-Seite RDAP94 kann /agent-ws und Heartbeat bereits read-only/in-memory annehmen.
- Keine Aktionen, keine produktiven Writes, keine DB-Migration, keine Admin-Notizen-Erweiterung.

Naechster sinnvoller Schritt:
- RDAP119 lokal installieren und testen.
- Env fuer Verbindung setzen, Verbindungsschluessel nicht posten.
- Lokalen Node-Server neu starten.
- Lokal /api/streaming-pc-connection/status pruefen.
- Webserver /api/remote/agent/status pruefen.
- Danach Online-/Lokal-Twitch-Login zusammenfuehren und Rollen/Rechte minimal bedienbar machen.
