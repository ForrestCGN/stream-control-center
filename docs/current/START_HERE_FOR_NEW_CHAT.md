# START HERE FOR NEW CHAT

Stand: RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT  
Datum: 2026-06-23

## Zuerst lesen

Bitte zuerst diese Dateien lesen, bevor geplant oder gebaut wird:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT.md
docs/current/NEXT_CHAT_PROMPT_RDAP7F.txt
```

## Aktueller gesicherter Stand

```text
RDAP7E_SERVER_WORKDIR_CLEANUP_DOCS
```

RDAP7E wurde laut User lokal installiert, committed und nach GitHub/dev gepusht. `git status --short` war leer.

## Kurzstatus

```text
RDAP6K produktive Auth-DB-Migration auf c3stream_control erfolgreich
RDAP7B read-only Auth-Status-Endpunkte gebaut
RDAP7C Live-Deploy/Test bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Cleanup-Doku abgeschlossen
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
RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN
```

Nur Plan/Doku. Noch kein Login, keine Cookies, keine Sessions, keine Writes.
