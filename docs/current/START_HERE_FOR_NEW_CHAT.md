# Start hier

Aktueller Stand: Version 0.1.3 – Streaming-PC OBS-Status read-only.

Arbeitsweise:
- Erst Doku/Stand lesen.
- Erst Plan nennen, auf `go` warten.
- WINDOWS / POWERSHELL und WEBSERVER / LINUX strikt trennen.
- Keine `jq`-Befehle fuer Windows.
- ZIP ist nur vorbereitet. Lokal gilt erst nach `installstep.cmd` + Neustart + Test. Webserver gilt erst nach `stepdone.cmd` + Deploy-Wrapper + Test.
- Nutzerkommunikation mit Versionsnummern und sprechenden Namen, keine internen Step-Namen.

Sicherheitsstand:
- Streaming-PC verbindet ausgehend zum Webserver.
- Heartbeat + Komponentenstatus + OBS-Port-Erreichbarkeit read-only.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-Aktionen.
- Keine Shell, keine Datei-/Prozessaktionen, keine DB-Writes.
