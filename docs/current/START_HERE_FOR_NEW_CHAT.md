# START HERE FOR NEW CHAT — RDAP120

Aktueller Stand: `RDAP120_STREAMING_PC_CONNECTION_VISIBLE_AND_STABLE` vorbereitet.

Wichtig:
- RDAP119 ist erfolgreich geprüft: Streaming-PC verbindet ausgehend zum Webserver, Webserver sieht Heartbeats, `actionsEnabled=false`.
- RDAP120 macht diese Verbindung im Remote-Modboard sichtbar und verständlicher.
- UI-Sprache: Streaming-PC Verbindung, online/offline, letzter Kontakt, Lebenszeichen. Keine neue Admin-Notizen-Arbeit.
- Keine produktiven Writes, keine DB-Migration, keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Aktionen.

Workflow:
1. GitHub/dev und diese Datei lesen.
2. Plan nennen.
3. Auf `go` warten.
4. ZIP mit echten Zielpfaden bauen.
5. Lokal installieren, Checks, `stepdone.cmd`.
6. Bei Änderung unter `remote-modboard/`: Webserver-Deploy über Wrapper:
   `bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP120_STREAMING_PC_CONNECTION_VISIBLE_AND_STABLE dev`
