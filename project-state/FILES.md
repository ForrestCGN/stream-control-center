# FILES - stream-control-center

Stand: 2026-06-23

## Dokumentationsdateien

### Aktuelle Start-/Statusdateien

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Zweck:

- Einstieg fuer neue Chats.
- Arbeitsregeln.
- zuerst zu lesende Dateien.
- aktueller RDAP5I-Status.
- kritische DB-Korrektur.
- naechste Schritte.

```text
docs/current/NEXT_CHAT_PROMPT_RDAP5I_REMOTE_READONLY_LIVE.md
```

Zweck:

- kompletter Prompt fuer neuen Chat zum Stand RDAP5I Remote Read-only Live.
- enthaelt Server-Fakten, nginx/ISPConfig-Block, DB-Korrektur und Alt-TODO.

```text
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
```

Zweck:

- technische Live-/Installationsdoku fuer RDAP5I.
- dokumentiert Endpunkte, Service, nginx/ISPConfig, DB-Korrektur und Sicherheitsstatus.

```text
project-state/CURRENT_STATUS.md
```

Zweck:

- aktueller Projektstatus.
- RDAP5I live read-only.
- naechster sinnvoller Step.

```text
project-state/NEXT_STEPS.md
```

Zweck:

- naechste geplante Steps.
- RDAP5J Monitoring/Hardening.
- RDAP4B remote_agent.js -> RDAP5C3.
- RDAP6 Auth/DB Migration Prep.

```text
project-state/TODO.md
```

Zweck:

- offene Aufgaben und erledigte Dokumentationsstaende.

```text
project-state/FILES.md
```

Zweck:

- Uebersicht wichtiger Dateien und Pfade.

## Noch erwartete / relevante Projektdateien

Diese Dateien sollen bei passenden naechsten Steps zuerst echt gelesen werden. Nicht raten, wenn sie fehlen.

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md
docs/current/REMOTE_DASHBOARD_RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE.md
remote-modboard/backend/package.json
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/security/safety.js
backend/modules/remote_agent.js
```

## Live-/Serverpfade RDAP5I

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

Passwort/Secrets stehen nur auf dem Server in der `.env` und duerfen nicht ins Repo, Frontend oder Chat.

## Remote API

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
https://mods.forrestcgn.de/api/remote/health?db=1
```

## Wichtige Korrektur

Korrekt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Falsch/alt:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```
