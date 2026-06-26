# NEXT CHAT PROMPT - RDAP after RDAP76D

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP76D.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

```text
RDAP76B: Doku-Konsolidierung abgeschlossen.
RDAP76D: Admin-Modul-/Page-Registry-Zielstruktur dokumentiert.
GitHub/dev enthaelt nach stepdone den getesteten Doku-Stand.
```

## Wichtiger Befund

```text
Die aktuelle Webseite hat eine echte Haupt-App mit Router in remote-modboard.js.
Admin-Notizen und User-Detail sind aber historisch in rdap28-admin-notes.js nachtraeglich injiziert.
Dadurch konkurrieren Haupt-Router und Feature-Datei teilweise um Header, Navigation und sichtbare Panels.
```

## Zielstruktur

```text
Ein Modul beschreibt sich selbst.
Die App-Shell liest die Beschreibung.
Navigation, Header und Page-State werden zentral daraus erzeugt.
Feature-Dateien rendern nur ihren eigenen Inhalt.
```

## Naechster empfohlener Code-Step

```text
RDAP77_ADMIN_MODULE_REGISTRY_FOUNDATION
```

Ziel:

```text
- Frontend-only Modul-/Page-Registry-Fundament schaffen.
- Admin als erstes Modul registrieren.
- Admin-Notizen und User-Detail als echte Admin-Pages registrieren.
- Haupt-Router bleibt einzige Wahrheit fuer Header, aktive Navigation und sichtbares Panel.
- rdap28-admin-notes.js entlasten: keine eigene Router-/Header-/Nav-Wahrheit mehr.
```

## Erlaubter Scope RDAP77

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional neue Frontend-Datei unter remote-modboard/backend/public/assets/, wenn sie die Registry sauber kapselt
optional docs/current/*
optional project-state/*
```

## Strikt verboten RDAP77

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
Keine neuen Schreibbuttons.
Keine Write-Freigabe nebenbei.
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die Startdateien aus GitHub/dev und nenne danach nur den Plan fuer RDAP77. Kein Code/ZIP vor deinem go.
```
