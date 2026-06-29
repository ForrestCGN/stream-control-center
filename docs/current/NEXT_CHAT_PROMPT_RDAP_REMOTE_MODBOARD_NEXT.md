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
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
docs/current/LOCAL_DASHBOARD_REPLACEMENT_PLAN_CURRENT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
project-state/PARKED_TODOS.md
```

Aktueller Stand:

```text
RDAP_0.2.23_PARK_OBS_START_MEDIA_DOCS
OBS ist bei 0.2.22E geparkt.
Naechster aktiver Fokus: Media-System ins Remote-Modboard bringen.
```

OBS-Stand beim Parken:

```text
- Stream-PC-Agent verbindet per WSS.
- Heartbeat ist schlank.
- Live-State sendet aktuelle OBS-Szene schnell.
- Inventory-Sync sendet Szenen/Quellen/Audio separat, nicht im Heartbeat.
- Online Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.
- Lokales Inventory bestaetigt: 19 Szenen, 48 Quellen, 35 Audioquellen.
- currentScene: Live Gameplay Forrest&Engel.
- Lokale und Online-OBS-Seite nutzen gleiche Status-/Refresh-Logik.
```

OBS-Offenpunkte sind geparkt in:

```text
project-state/PARKED_TODOS.md
```

Wichtig fuer den naechsten Chat:

```text
Forrest moechte OBS jetzt pausieren und das Media-System ins Modboard bringen.
Nicht mit OBS 0.2.20 weitermachen. GitHub/dev ist weiter: 0.2.22E.
Vor Media-Planung echte Media-/Sound-/Dashboard-Dateien aus GitHub/dev lesen.
Keine Media-Uploads, Deletes, produktiven Writes oder DB-Migrationen im ersten Media-Step ohne separate Freigabe.
Modboard bleibt die einzige UI-Wahrheit; lokales dashboard-v2 ist nur dasselbe Runtime-Profil.
```

Sicherheitsgrenzen:

```text
Keine OBS-Steuerung.
Keine Agent-Actions.
Keine Writes.
Keine DB-Migration.
Keine Shell-/Datei-/Prozess-Actions.
Keine freien OBS-Payloads.
Keine Secrets in Logs, Status, UI oder Doku.
```

Naechster sinnvoller Schritt:

```text
Echte Media-System-Dateien aus GitHub/dev lesen, Ist-Stand zusammenfassen, kleinen read-only Plan fuer die erste Media-System-Integration ins Remote-Modboard nennen, dann auf go warten.
```
