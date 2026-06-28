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
- Keine parallelen Strukturen erfinden.
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
backend/modules/obs_shared.js
backend/modules/local_remote_modboard_adapter.js
backend/modules/obs_live_status.js
remote-modboard/backend/server.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/obs-readonly.routes.js
remote-modboard/backend/public/assets/modules/system/obs.js
htdocs/dashboard-v2/assets/modules/system/obs.js
```

Aktueller Stand:

```text
0.2.21 - OBS Allowlist-/Rechte-Modell read-only vorbereitet.
```

Bestaetigt:

```text
- Stream-PC-Agent ist per WSS verbunden.
- Heartbeat ist schlank und stabil.
- Live-State ist vom Heartbeat getrennt.
- OBS aktuelle Szene kommt online an.
- /api/remote/agent/obs/live/status liefert active=true, status=live_scene_available, currentScene.
- UI zeigt Online-Live-Szene.
- OBS-Allowlist-/Rechte-Modell ist read-only vorbereitet.
```

Architektur:

```text
Heartbeat = klein/stabil, Verbindung, ca. 30s.
Live-State = schnelle kleine Daten, aktuell OBS-Szene, ca. 500ms.
Inventory = langsam/groesser, Szenen/Quellen/Audioquellen.
Allowlist/Rechte = Modell fuer spaetere Bedienbarkeit, aktuell read-only.
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
0.2.22 - OBS Control-Preflight read-only.
```

Ziel 0.2.22:

```text
- noch keine OBS-Actions aktivieren
- pro Ziel anzeigen, ob es nach Modell theoretisch bedienbar waere
- Safety-/Lock-/Audit-Zielbild fuer spaetere Control-Actions vorbereiten
- keine freien OBS requestType Payloads
```
