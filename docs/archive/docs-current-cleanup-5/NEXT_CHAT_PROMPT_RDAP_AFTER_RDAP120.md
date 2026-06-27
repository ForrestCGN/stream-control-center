# NEXT CHAT PROMPT — after RDAP120

Du arbeitest im Projekt `ForrestCGN/stream-control-center`, Branch `dev`.

Erst lesen:
- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
- `docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md`
- `docs/current/CURRENT_REMOTE_MODBOARD_STATE.md`
- `docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`

Stand:
- RDAP119 erfolgreich: Streaming-PC verbindet ausgehend zu `wss://mods.forrestcgn.de/agent-ws`; Webserver sieht Heartbeats; Aktionen bleiben aus.
- RDAP120: Remote-Modboard Seite Admin -> Verbindungen zeigt Streaming-PC-Verbindung verständlich sichtbar.

Regeln:
- Keine Admin-Notizen weiterbauen, außer Forrest fordert es ausdrücklich.
- Keine Navi-Kosmetik.
- Keine neuen parallelen Module, wenn vorhandene erweitert werden können.
- Keine geratenen Dienstnamen. Webserver-Deploy nur über Wrapper.
- Befehle für Forrest nur als robuste Copy/Paste-Blöcke.

Nächster sinnvoller Schritt:
`RDAP121_STREAMING_PC_CONNECTION_AUTOSTART_AND_RECONNECT_CHECK`

Ziel:
- prüfen/planen, wie der lokale Streaming-PC-Verbindungsclient beim Start zuverlässig läuft
- Reconnect bei Webserver-Neustart prüfen
- weiterhin keine Aktionen, keine Writes, keine DB-Migration
