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
- RDAP5 Admin-User-Permission-Diagnose ist serverseitig getestet.
- RDAP_META1_BUILD_HEADER_CLEANUP ist remote getestet:
  - `X-Remote-Modboard-Build: RDAP_META1_BUILD_HEADER_CLEANUP`
  - `statusApiVersion: rdap_meta1.v1`
  - RDAP5 Permission-Diagnoseroute bleibt sichtbar.
- RDAP6 Confirm-/Audit-/Locking-Foundation wurde vorbereitet:
  - neue read-only Route `/api/remote/admin/users/write-foundation-diagnostic`
  - keine produktiven Writes
  - keine DB-Migration
  - keine UI-Schreibbuttons

## Local/LAN-Entscheidung

Forrest möchte langfristig:

```text
Online über mods.forrestcgn.de arbeiten.
Zusätzlich lokal im Heimnetz arbeiten können.
EngelCGN soll lokal im LAN ebenfalls arbeiten können.
Lokaler Login soll ebenfalls über Twitch laufen.
```

Dieser Punkt ist als TODO geparkt:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Erst weiterführen, wenn das Web-Dashboard stabiler ist.

## Wichtige aktuelle Doku-Dateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC.md
docs/current/RDAP_META1_BUILD_HEADER_CLEANUP.md
docs/current/RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION.md
docs/current/RDAP_LOCAL_MODE1_LAN_TWITCH_LOGIN_PLAN.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_RDAP6_2026-06-24.md
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
- Webserver-Deploy immer über `_deploy_tmp/` aus frischem Clone.

## Nächste sinnvolle Schritte

```text
RDAP_ADMIN_USERS7_CONFIRM_HELPER_DISABLED
```

Ziel:

- Confirm-Write-Helfer vorbereiten, aber produktive Writes deaktiviert lassen.
- Audit-/Locking-Zusammenspiel weiter vorbereiten.
- Keine User-/Rollen-/Gruppen-Writes ohne eigenen separaten Go.
