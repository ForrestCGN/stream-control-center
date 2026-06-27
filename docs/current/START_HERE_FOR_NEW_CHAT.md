# START HERE – RDAP nach RDAP121

Stand: `RDAP121_STREAMING_PC_COMPONENT_STATUS_READONLY`.

Erreicht:
- RDAP119: Streaming-PC verbindet ausgehend zum Webserver `/agent-ws` und sendet Heartbeats.
- RDAP120: Dashboard zeigt unter Admin -> Verbindungen den Streaming-PC verständlich als online/offline mit letztem Kontakt.
- RDAP121: Streaming-PC sendet zusätzlich einen sicheren read-only Komponentenstatus im Heartbeat.

Aktuelle Leitlinie:
- Online- und lokales Dashboard immer parallel denken.
- Menschen melden sich per Twitch an; Rechte bleiben eigenes Dashboard-Modell.
- Streaming-PC nutzt Verbindungsschlüssel, kein Twitch-User.
- Keine Admin-Notizen weiter ausbauen, außer ausdrücklich verlangt.
- Keine Steuerung, keine Shell, keine Datei-/Prozessaktionen, keine DB-Migration ohne separaten Scope.

Nach RDAP121 sinnvoll:
`RDAP122_FIRST_SAFE_MODULE_ACTION_PLAN` – erste echte Modul-Anbindung planen, aber nur über Allowlist und weiterhin ohne freie Befehle.
