# RDAP Current Handoff - 2026-06-24

Projekt: `stream-control-center` / Remote-Modboard  
Public URL: `https://mods.forrestcgn.de/`  
Service: `scc-remote-modboard.service`  
Branch: `dev`

## Aktueller Stand

- `mods.forrestcgn.de` läuft.
- Twitch Login ist live.
- Dashboard-Zugriff wird serverseitig geprüft.
- ForrestCGN und EngelCGN sind sichtbar.
- Dashboard-v2/V13-Look ist portiert.
- Login-/Denied-Seite ist zentriert.
- Grid-/Spacing ist korrigiert.
- Avatar oben rechts wird angezeigt.
- Profilpanel oben rechts ist Self-Service.
- `Profil aktualisieren` synchronisiert eigene Twitch-Daten.
- Profilpanel zeigt nur noch `Profil aktualisieren` und `Ausloggen`.
- Admin -> User & Rollen ist read-only sichtbar.
- Topbar hat keinen doppelten Ausloggen-Button mehr.
- RDAP5 Admin-User-Permission-Diagnose ist serverseitig getestet:
  - ohne Browser-Session: `401 Unauthorized` korrekt
  - mit ForrestCGN Browser-Session: `ok:true`, `loggedIn:true`, `roles:["owner"]`, `isOwner:true`, `isAdmin:true`, `canReadAdminUsers:true`, `canWriteAdminUsers:false`
  - keine User-/Rollen-/Gruppen-/Session-Writes
  - keine DB-Migration
- Lokaler/LAN-Betrieb soll künftig berücksichtigt werden:
  - Online weiter über `mods.forrestcgn.de`
  - zusätzlich lokales Modboard im Heimnetz
  - EngelCGN soll im LAN arbeiten können
  - lokaler Login soll ebenfalls über Twitch erfolgen

## Wichtige aktuelle Doku-Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC.md
docs/current/RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN.md
```

## Korrekte Arbeitsweise

1. GitHub/dev und Dokus prüfen.
2. Plan nennen.
3. Auf Forrests `go` warten.
4. ZIP mit echten Zielpfaden bauen.
5. Forrest lädt ZIP in Downloads.
6. Lokal `installstep.cmd` ausführen.
7. Lokale Checks/Syntax/git status.
8. Bei Erfolg `stepdone.cmd`.
9. Erst danach Webserver-Deploy aus frischem GitHub/dev-Clone.
10. Service-Restart.
11. Readiness-Loop auf `127.0.0.1:3010/api/remote/status`.
12. Erst danach Server-/Browser-Tests.

Wichtig:

- `stepdone.cmd` ist lokaler Commit/Push nach GitHub/dev.
- `stepdone.cmd` bedeutet nicht Webserver-Deploy.
- Lokale Windows-Tests dürfen nicht fälschlich Port `3010` voraussetzen.
- `/opt/stream-control-center` ist kein Git-Repository.
- Webserver-Deploy immer über `_deploy_tmp/<STEP_NAME>` aus frischem Clone.

## Nächste sinnvolle Schritte

### Lokal/LAN

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Ziel:

- lokale Env-Strategie planen
- lokales Startscript planen
- LAN-Erreichbarkeit sauber vorbereiten
- Twitch-Login lokal weiter planen
- keine Secrets ins Repo

### Admin-Userverwaltung

```text
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Ziel:

- Confirm-Write-Grundlage
- Audit-Write-Grundlage
- Locking-Grundlage
- noch keine produktiven User-/Rollen-Writes

### Cleanup

```text
RDAP_META1_BUILD_HEADER_CLEANUP
```

Ziel:

- veraltetes `moduleBuild`/Header `RDAP_AUTH2_CENTRAL_LOGIN_READY` bereinigen oder zentralisieren
- Statusausgaben sollen aktuelle Steps weniger verwirrend anzeigen

## Offene Hinweise

- RDAP5 funktioniert, aber `moduleBuild`/Header zeigt weiterhin `RDAP_AUTH2_CENTRAL_LOGIN_READY`.
- Owner/Admin-Fallback funktioniert diagnostisch; Reason-Ausgaben könnten später verständlicher werden.
- Lokal/LAN mit Twitch-Login ist geplant, aber noch nicht gebaut.
