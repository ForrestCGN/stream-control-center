Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Forrest arbeitet mit `go`, `ok`, `weiter`.

WICHTIG:
GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten.
Erst die Startdateien wirklich aus GitHub/dev lesen, dann Plan nennen, dann auf mein explizites `go` warten.

Verbindliche Arbeitsweise:

```text
- Immer zuerst echte Dateien aus GitHub/dev lesen.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: cd D:\Git\stream-control-center; .\installstep.cmd "$env:USERPROFILE\Downloads\<ZIP>.zip" "<Beschreibung>"
- Danach lokale Checks und git status.
- Wenn sauber: .\stepdone.cmd "<Beschreibung>"
- Webserver-Deploy nur nach Code-/Remote-Modboard-Aenderungen.
```

Startdateien zuerst lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
backend/modules/remote_agent.js
remote-modboard/backend/server.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/obs-readonly.routes.js
remote-modboard/backend/public/assets/modules/system/obs.js
htdocs/dashboard-v2/assets/modules/system/obs.js
```

Aktueller Stand:

```text
0.2.22 - OBS Inventory-Sync read-only vorbereitet.
```

Architektur:

```text
Heartbeat = klein/stabil, Verbindung, ca. 30s.
Live-State = schnelle Daten, aktuell OBS-Szene, ca. 500ms.
Inventory-Sync = Szenen/Quellen/Audioquellen, separat/langsamer, nicht im Heartbeat.
```

Sicherheitsgrenzen:

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine Writes.
Keine DB-Migration.
Keine Shell-/Datei-/Prozess-Actions.
Keine freien OBS-Payloads.
Webserver baut keine OBS-WebSocket-Verbindung auf.
```

Naechster sinnvoller Step:

```text
0.2.22 testen und ggf. Inventory-Sync/UI glätten. Noch keine OBS-Actions aktivieren.
```
