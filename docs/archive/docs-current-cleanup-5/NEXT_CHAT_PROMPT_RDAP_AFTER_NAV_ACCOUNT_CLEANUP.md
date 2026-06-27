# NEXT_CHAT_PROMPT_RDAP_AFTER_NAV_ACCOUNT_CLEANUP

Du arbeitest im Projekt `stream-control-center` / RDAP Remote-Modboard von ForrestCGN.

Sprache: Deutsch.

## Arbeitsweise

Strikt nach vorhandener Arbeitsweise arbeiten:

```text
Erst echte Dateien/Repo/Dokus prüfen.
Dann kurzen Plan nennen.
Dann auf Forrests ausdrückliches `go` warten.
Nicht raten.
Fehlende Dateien gezielt anfordern.
Keine Funktionalität entfernen.
Keine Parallelstrukturen bauen.
Bestehende Systeme nutzen.
Keine funktionierenden Workflow-Tools überschreiben.
```

## Single Source of Truth

GitHub:

```text
https://github.com/ForrestCGN/stream-control-center
Branch: dev
```

Lokales Repo:

```text
D:\Git\stream-control-center
```

Lokales Live-Ziel:

```text
D:\Streaming\stramAssets
```

Webserver:

```text
mods.forrestcgn.de
/opt/stream-control-center
/opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
```

## Pflicht zuerst lesen

Bitte zuerst im GitHub/dev prüfen/lesen:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_CURRENT_HANDOFF_2026-06-24.md
docs/current/RDAP_ADMIN_USERS10_BACKUP_ROLLBACK_MINI_WRITE_PLAN.md
docs/current/RDAP_ADMIN_USERS10B_PROJECT_STATE_SYNC.md
docs/current/RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED.md
docs/current/RDAP_ADMIN_USERS11B_DEPLOY_CONFIRMED_DOCS.md
docs/current/RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED.md
docs/current/RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP_LIVE_CONFIRMED.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller bestätigter Stand

Backend/Security:

```text
RDAP_ADMIN_USERS11_MINI_WRITE_FOUNDATION_DISABLED
```

Frontend/Login:

```text
RDAP_DESIGN2_LOGIN_TEXT_POLISH_LIVE_CONFIRMED
```

Konto-/Navigation-UX:

```text
RDAP_ACCOUNT_PANEL_CLEANUP_V2
RDAP_NAV_ACCOUNT_TO_PROFILE_MENU_CLEANUP
RDAP_NAV_ACCOUNT_CLEANUP_DOCS_UPDATE
```

## Bestätigte UX-Entscheidungen

Konto-Panel oben rechts zeigt nur normale Nutzerinfos:

```text
Avatar
Displayname
@twitch-login
Rolle
Profil aktualisieren
Ausloggen
```

Nicht mehr im Konto-Panel:

```text
Dashboard-Zugriff
Access-Grund
Twitch/User UID
leere Gruppen-Zeile
Session
remote.view
Hinweisbox „Nur dein eigenes Konto“
```

Sidebar enthält keine eigene Gruppe `Benutzer & Rechte` mehr. Persönliches Konto/Rechte gehört oben rechts ins Profilmenü. Verwaltung gehört in den Admin-Bereich.

## Workflow-Schutz

Vor weiteren Steps immer beachten:

```text
installstep.cmd ist der allgemeine ZIP-Installer.
Design-/Frontend-/Doku-Steps dürfen installstep.cmd, stepdone.cmd, testdeploy.cmd oder Deploy-Skripte nicht überschreiben.
ZIPs müssen echte Zielpfade enthalten.
Keine Patch-Skripte unter tools/steps/*.ps1 in ZIPs verwenden.
```

Falls lokal eingespielt wird:

```powershell
cd D:\Git\stream-control-center

.\installstep.cmd "$env:USERPROFILE\Downloads\STEP_NAME.zip" "STEP-Beschreibung"

.\stepdone.cmd "STEP-Beschreibung lokal geprüft"
```

Webserver-Deploy nur aus frischem GitHub/dev-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf STEP_NAME
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
cd STEP_NAME
sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
sudo systemctl restart scc-remote-modboard.service

for i in $(seq 1 30); do
  if curl -fsS http://127.0.0.1:3010/api/remote/status >/dev/null; then
    echo "ready_after=${i}s"
    break
  fi
  sleep 1
done
```

Nicht `/opt/stream-control-center` als Git-Repo behandeln. Dort kein `git pull` empfehlen.

## Weiterhin verboten/nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
DB-Migration
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Backup-Ausführung
Rollback-Ausführung
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Nächster Fachstep

```text
RDAP_ADMIN_USERS12_FIRST_MINI_WRITE_SCOPE_PLAN
```

RDAP12 ist nur Planung. Noch keinen echten Write bauen.

RDAP12 muss klären:

```text
Welcher kleinste Admin-Write später sinnvoll ist
Welche Tabelle/Felder betroffen sind
Backup-Befehl
Rollback-Befehl
Permission-Prüfung
Confirm-Write-Anforderung
Audit-Payload
Lock-Scope
Read-Back-Prüfung
Fehlerfälle/Abbruchbedingungen
```

Ein echter Mini-Write darf erst nach RDAP12 mit separatem Scope, Backup/Rollback, Permission, Confirm-Write, Audit, Locking, Read-Back-Prüfung und weiterem ausdrücklichem `go` gebaut werden.
