# START HERE FOR NEW CHAT

Stand: RDAP7D_AUTH_STATUS_DEPLOY_RESULT_DOCS  
Datum: 2026-06-23

## Sofort zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/RDAP7D_AUTH_STATUS_DEPLOY_RESULT_DOCS.md
```

## Wichtigster aktueller Stand

RDAP7B wurde auf dem Webserver deployed und in RDAP7C live getestet. RDAP7D dokumentiert das Ergebnis.

Live:

```text
https://mods.forrestcgn.de/api/remote/auth/me
https://mods.forrestcgn.de/api/remote/auth/session-status
```

Bestaetigt:

```text
Service: active
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
readOnly: true
writeEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
schema.ready: true
```

## Weiterhin NICHT aktiv

```text
kein Login
keine Twitch-OAuth-Callback-Aktivierung
keine produktiven Sessions
keine Cookies
keine DB-Writes ueber API
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Server-Ordnungsregel

Ab jetzt auf dem Webserver:

```text
keine Arbeitsordner direkt unter /root
keine Deploy-Clones nach /root/...
keine Backups lose nach /root/...
```

Standard:

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Run-/Log-/Temp-Kram: /opt/stream-control-center/_runtime_tmp/
Backups: /var/backups/stream-control-center/
```

RDAP7C1 Cleanup wurde vorbereitet, aber in dieser Doku nicht als erledigt markiert, weil keine Server-Ausgabe vorliegt.

## Naechster sinnvoller Schritt

```text
RDAP7E_TWITCH_OAUTH_DRY_RUN_PLAN
```

Nur planen. Keine Secrets ins Repo. Keine Login-Aktivierung ohne separaten Go-Step.

## Arbeitsweise

```text
immer echten GitHub/dev-Stand pruefen
keine Annahmen
keine Funktionalitaet entfernen
vor Umsetzung Scope nennen
auf klares go warten
ZIPs mit echten Repo-Pfaden ab Repo-Root
kein Desktop als Standard
keine Root-Wildwuchs-Ordner auf dem Server
maximal ein Befehlsblock pro Antwort
bei fehlenden Ergebnissen nicht als erledigt dokumentieren
kein git add .
```
