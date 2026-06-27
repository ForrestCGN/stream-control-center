# START HERE – Version 0.1.2

Stand: `VERSION_0_1_2_STREAMING_PC_COMPONENT_STATUS_TEXT_CLEANUP`.

Erreicht:
- Version 0.1.0: Streaming-PC verbindet ausgehend zum Webserver `/agent-ws` und sendet Heartbeats.
- Version 0.1.0 Dashboard-Anzeige: Dashboard zeigt unter Admin -> Verbindungen den Streaming-PC verständlich als online/offline mit letztem Kontakt.
- Version 0.1.1: Streaming-PC sendet zusätzlich einen sicheren read-only Komponentenstatus im Heartbeat.

Aktuelle Leitlinie:
- Online- und lokales Dashboard immer parallel denken.
- Menschen melden sich per Twitch an; Rechte bleiben eigenes Dashboard-Modell.
- Streaming-PC nutzt Verbindungsschlüssel, kein Twitch-User.
- Keine Admin-Notizen weiter ausbauen, außer ausdrücklich verlangt.
- Keine Steuerung, keine Shell, keine Datei-/Prozessaktionen, keine DB-Migration ohne separaten Scope.

Nach Version 0.1.1 sinnvoll:
`VERSION_0_1_3_FIRST_SAFE_MODULE_ACTION_PLAN` – erste echte Modul-Anbindung planen, aber nur über Allowlist und weiterhin ohne freie Befehle.
