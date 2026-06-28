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
- Keine langen Diagnose-Schleifen, wenn der Fehler aus dem Step selbst kommt: dann Hotfix planen.
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
0.2.22E - Local/Online OBS Status Parity read-only, fast gut; spaeter mit echten Situationen testen.
```

Bestaetigt:

```text
- Stream-PC-Agent verbindet per WSS.
- Heartbeat ist schlank.
- Live-State sendet aktuelle OBS-Szene schnell.
- Inventory-Sync sendet Szenen/Quellen/Audio separat, nicht im Heartbeat.
- Online Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.
- Lokales Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.
- currentScene: Live Gameplay Forrest&Engel.
- Lokale und Online-OBS-Seite sollen dieselbe Status-/Refresh-Logik nutzen.
```

Architektur:

```text
Heartbeat = klein/stabil, Verbindung, ca. 30s.
Live-State = schnelle kleine Daten, aktuell OBS-Szene, ca. 500ms.
Inventory-Sync = groessere OBS-Listen, separat, read-only, ca. 30s.
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
Live-State und Inventory nur in Memory.
```

Offener Testplan:

```text
OBS an/aus.
Agent an/aus.
Szenenwechsel.
OBS-Neustart.
Webserver-Neustart.
Lokal vs online.
Reload vs ohne Reload.
Inventory nach ca. 30s.
Live -> Wartet/Offline ohne Reload.
```

Wichtig fuer den naechsten Chat:

```text
Forrest war unzufrieden mit unnoetigen Mini-/Kosmetik-Schritten und zu viel technischem Text.
Nicht nur Anzeigen kaschieren, wenn echte Daten fehlen.
Mod-Ansicht muss fuer Mods verstaendlich sein: keine Diagnosebegriffe wie Inventory, Endpoint, Payload, unless in Admin/Diagnose.
Bei Fehlern kurz sagen, was Fakt ist, was der echte Fix ist, und nicht lange erklaeren.
```

Naechster sinnvoller Schritt:

```text
Erst Sichttest mit echten Situationen.
Danach entweder kleine Sprach-/Mod-UX-Korrektur oder naechster read-only Bedienvorbereitungs-Step.
Keine OBS-Actions ohne separaten Control-Step.
```
