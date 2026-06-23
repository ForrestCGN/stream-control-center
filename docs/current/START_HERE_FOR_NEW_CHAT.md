# START HERE FOR NEW CHAT

Stand: RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN  
Datum: 2026-06-23

## Zuerst lesen

Bitte zuerst diese Dateien lesen, bevor geplant oder gebaut wird:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN.md
docs/current/RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT.md
```

## Aktueller gesicherter Stand

```text
RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN
```

RDAP7F ist ein reiner Plan-/Doku-Step. Es wurden keine Code-, DB-, Service-, Auth-, Session-, Cookie-, Agent- oder Remote-Write-Aenderungen vorgenommen.

## Kurzstatus

```text
RDAP6K produktive Auth-DB-Migration auf c3stream_control erfolgreich
RDAP7B read-only Auth-Status-Endpunkte gebaut
RDAP7C Live-Deploy/Test bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Cleanup-Doku abgeschlossen
RDAP7F Twitch OAuth Dry-Run Plan dokumentiert
```

## Live Remote-Modboard

```text
URL: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

## Server-Ordnerregel

Nicht mehr verwenden:

```text
/root fuer RDAP-Deploy-Clones, Arbeitsordner, Temp-Ordner oder Backups
```

Stattdessen:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Runtime-/Temp:       /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
```

## Arbeitsweise

```text
GitHub/dev als Single Source of Truth.
Echte Dateien pruefen, nicht raten.
Keine Funktionalitaet entfernen.
Vor Umsetzung Scope nennen und auf go warten.
Maximal ein Befehlsblock pro Antwort.
Vor Befehlen sagen: Wo ausfuehren, was macht der Befehl, wann stoppen, welche Ausgabe schicken.
Keine langen unnoetigen Ausgaben anfordern.
Kein git add . verwenden.
ZIPs mit echten Repo-Pfaden liefern.
StepDone erst nach Einspielen/Deploy/Test.
```

## Naechster sinnvoller Schritt

```text
RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED
```

Nur ENV-/Server-Vorbereitung fuer OAuth, weiterhin disabled. Noch kein produktiver Login, keine Cookies, keine Sessions, keine Writes.
