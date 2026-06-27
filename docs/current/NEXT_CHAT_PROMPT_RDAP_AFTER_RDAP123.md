# NEXT CHAT PROMPT - RDAP nach RDAP123

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch. Direkt, pragmatisch, keine unnoetigen Wiederholungen.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/CURRENT_REMOTE_MODBOARD_STATE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/DOCS_CURRENT_FINAL_INDEX.md
docs/current/MODULE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/ROUTE_SERVICE_DOCS_CONSOLIDATED_CURRENT.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/RDAP122_LOCAL_DASHBOARD_RUNTIME_PROFILE.md
docs/current/RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Falls eine Datei fehlt: nicht improvisieren, exakt diese Datei aus `D:\Git\stream-control-center` anfordern.

## Aktueller Stand

RDAP123 ist vorbereitet/abgeschlossen, sobald lokal geprueft, `stepdone.cmd` ausgefuehrt und der Webserver deployed wurde.

Sichtbarer Zielstand:

```text
v0.2.4 - Routes-Status angeglichen
```

RDAP119 hat die Remote-Modboard-Oberflaeche modularisiert. RDAP120 hat Modul-Metadaten, Permission-Metadaten und Runtime-Scope eingefuehrt. RDAP121 hat zentrale Frontend-Sprachdateien eingefuehrt. RDAP122 bereitet den lokalen Dashboard-Betriebsmodus vor und zeigt den Runtime-Modus in der UI an. RDAP123 gleicht `/api/remote/routes` an den RDAP122-Status an und aktualisiert die Projektstatus-Doku.

## Sicherheitsstand

Weiterhin nicht aktiviert:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.

Bestehende Admin-Note-Create/Update-Writes bleiben unveraendert und nur serverseitig kontrolliert aktiv.

## Naechster sinnvoller Arbeitsfokus

Nach bestaetigtem RDAP123-Deploy:

1. Lokale Start-/Env-Doku fuer Stream-PC/LAN konkretisieren.
2. Danach lokale Dashboard-Module schrittweise planen.
3. Weiterhin keine Agent-Actions und keine OBS-/Sound-/Overlay-/Command-Steuerung aktivieren.

Vor Umsetzung immer:

1. echte Dateien aus GitHub/dev lesen,
2. bestehende Module/Services/Routes bevorzugen,
3. keine parallelen Strukturen bauen,
4. Plan nennen,
5. auf Forrests `go` warten.
