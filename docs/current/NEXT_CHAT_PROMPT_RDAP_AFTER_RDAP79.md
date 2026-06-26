# NEXT CHAT PROMPT - RDAP after RDAP79

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

## Verbindliche Arbeitsweise

```text
- Immer zuerst die genannten Startdateien wirklich lesen.
- GitHub/dev ist Wahrheit.
- Nicht blind aus Erinnerung arbeiten.
- Erst Plan nennen.
- Auf explizites go warten.
- Keine Code-/ZIP-Erstellung vor go.
- Bestehende Module/Services/Dateien bevorzugen.
- Keine neuen parallelen Strukturen, wenn Erweiterung bestehender Dateien passt.
- Keine apply_patch-/Regex-/Set-Content-Anweisungen fuer Forrest.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: installstep.cmd aus D:\Git\stream-control-center.
- Danach lokale Checks und git status.
- Nur wenn sauber: stepdone.cmd.
- stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur nach Codeaenderungen in remote-modboard/ und erst nach stepdone.cmd.
- Doku-only braucht keinen Webserver-Deploy.
- Keine Funktionalitaet entfernen.
- Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
- Neue Module nur, wenn bestehende Struktur wirklich nicht passt.
```

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN.md
docs/current/ADMIN_MODULE_REGISTRY_DESIGN_CONTRACT.md
docs/current/RDAP79_DOCS_CURRENT_STATE_AND_NEXT_STREAMPC_CONNECTION_PROMPT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP79.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP77B:
- Frontend-Registry / Admin-Unterseiten funktionieren.
- Admin ist Obermodul.
- Admin-Notizen und User-Detail sind getrennte Admin-Pages.
- Header, Navigation und sichtbares Panel sind synchron.

RDAP78C:
- Admin-Notes Zieluser-Kontext funktioniert.
- ForrestCGN zeigt eigene Notizen.
- EngelCGN zeigt keine falschen Forrest-Notizen mehr.
- Stale Count im Notice-Humanizer ist korrigiert.
```

## Admin-Notes jetzt einfrieren

```text
Keine weitere Admin-Notes-Politur.
Kein Delete/Deactivate.
Kein Community-Read.
Keine Rollen-/Gruppen-/Permission-Writes.
```

Nur anfassen, wenn ein echter Fehler gemeldet wird.

## Naechstes Hauptziel

```text
Verbindung Webserver <-> Stream-PC
```

Zielarchitektur:

```text
Browser -> mods.forrestcgn.de -> Webserver Remote-Modboard -> gesicherter Agent-Kanal -> Stream-PC Agent -> erlaubte lokale Aktionen
```

Wichtige Grenze:

```text
Stream-PC verbindet aktiv zum Webserver.
Keine Portfreigabe am Stream-PC.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven OBS-/Sound-/Overlay-/Command-Actions im ersten Step.
```

## Naechster empfohlener Step

```text
RDAP80_AGENT_CONNECTION_ARCHITECTURE_AND_STATUS_FOUNDATION
```

Ziel:

```text
- Bestehende Agent-/Remote-Dateien aus GitHub/dev pruefen.
- Bestehende Module bevorzugen.
- Architektur fuer Webserver <-> Stream-PC Agent konkret planen.
- Status-/Heartbeat-Foundation vorbereiten.
- Read-only Agent-Status im Remote-Modboard sichtbar machen.
- Keine produktiven Remote-Actions.
```

## Zu pruefende Dateien fuer RDAP80

```text
backend/modules/remote_agent.js
remote-modboard/backend/src/routes/*
remote-modboard/backend/src/services/*
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/index.html
tools/*
docs/current/*
project-state/*
```

Suche zusaetzlich nach:

```text
remote_agent
agent
heartbeat
websocket
wss
ws
remote
```

## Strikt verboten in RDAP80

```text
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine produktiven Writes.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und pruefe die vorhandenen Agent-/Remote-Dateien. Danach nenne ich nur den Plan fuer RDAP80. Kein Code/ZIP vor deinem go.
```
