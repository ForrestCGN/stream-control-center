# START HERE FOR NEW CHAT - stream-control-center

Stand: 2026-06-23

Projekt: `stream-control-center` / Remote Dashboard / Modboard fuer ForrestCGN.

## Arbeitsweise

- Immer zuerst echten Stand pruefen: GitHub/dev, echte Dateien, Projekt-Dokus, Live-Ausgaben.
- Nicht raten. Wenn Dateien fehlen oder unklar sind, exakt nach den benoetigten Dateien fragen.
- Keine Funktionalitaet entfernen.
- Bestehende Module, Helper und Systeme nutzen; kein Modul-Wildwuchs.
- Vor Umsetzung immer Ziel, Scope, Dateien, Nicht-Aenderungen und Tests nennen.
- Umsetzung erst nach ausdruecklichem `go`.
- ZIPs immer mit echten Repo-Pfaden ab Repo-Root liefern.
- Keine losen Dateien ohne Zielpfad.
- Kein Desktop als Standardziel; bevorzugt Downloads oder Repo `_handoff` / `_tmp`.
- `installstep.cmd` spielt ZIPs ein und startet Tests.
- `stepdone.cmd` erst nach erfolgreichem Live-Test ausfuehren.
- Bei Fehlern `stepundo.cmd` nutzen.
- Keine produktive SQLite ersetzen, loeschen oder neu bauen.
- Keine MariaDB-Migration ohne Backup-/Migrationsplan und eigenes Go.
- Keine Secrets ins Repo, Frontend oder Chat.
- Keine freien Shell-, Datei- oder Prozessbefehle in Agent-/Dashboard-Systemen.
- Backend prueft Rechte; Frontend ist nie Sicherheitsentscheidung.
- Rollen und Gruppen getrennt halten.
- `sound_profi` ist Gruppe/Markierung, keine Rolle und keine feste globale Rechte-Sammlung.

## Zuerst lesen

1. `docs/current/START_HERE_FOR_NEW_CHAT.md`
2. `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`
3. `project-state/CURRENT_STATUS.md`
4. `project-state/NEXT_STEPS.md`
5. `project-state/TODO.md`
6. `project-state/FILES.md`
7. `docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md`

Falls relevant danach:

- `docs/current/REMOTE_DASHBOARD_RDAP5C3_DB_SCHEMA_ROLE_GROUP_REVISION.md`
- `docs/current/REMOTE_DASHBOARD_RDAP5H_REMOTE_NODE_SERVER_INSTALL_PACKAGE.md`
- `remote-modboard/backend/package.json`
- `remote-modboard/backend/server.js`
- `remote-modboard/backend/src/app.js`
- `remote-modboard/backend/src/routes/health.routes.js`
- `remote-modboard/backend/src/routes/status.routes.js`
- `remote-modboard/backend/src/routes/routes.routes.js`
- `remote-modboard/backend/src/services/config.service.js`
- `remote-modboard/backend/src/services/db-health.service.js`
- `remote-modboard/backend/src/security/safety.js`

## Aktueller Stand RDAP5I

RDAP5I ist nach Forrests Live-Pruefung technisch live und read-only erfolgreich.

Remote API:

- `https://mods.forrestcgn.de/api/remote/health`
- `https://mods.forrestcgn.de/api/remote/status`
- `https://mods.forrestcgn.de/api/remote/routes`
- `https://mods.forrestcgn.de/api/remote/health?db=1`

Bestaetigt:

- `ok: true`
- `readOnly: true`
- `writeEnabled: false`
- `actionEnabled: false`
- `productiveAgentRuntime: false`
- `connectionTested: true`
- `reachable: true`
- `migrationEnabled: false`
- `error: null`

Status bestaetigt:

- `agent.enabled: false`
- `agent.connected: false`
- `agent.actionsEnabled: false`
- `plannedTransport: wss`
- `plannedDirection: stream-pc-agent-to-webserver`
- `plannedModel: RDAP5C3 roles-and-groups-separated`
- `soundProfiIsRole: false`
- `soundProfiIsGroupMarker: true`
- `modulePermissionMatrixUsesTargetTypeAndTargetKey: true`

## Kritische DB-Korrektur

Korrekt und live bestaetigt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Nicht mehr verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

Das Passwort steht nur auf dem Server in:

```text
/etc/stream-control-center/remote-modboard.env
```

Passwort niemals posten oder dokumentieren.

## Naechster sinnvoller Step

Sofort abgeschlossen/zu pruefen:

- `RDAP5I_DOCS_FINALIZE_REMOTE_READONLY_LIVE`

Danach optional:

- `RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING`
- `RDAP6_AUTH_DB_MIGRATION_PREP`

RDAP6 nur mit separatem Plan, Backup, Migrationstabelle und ausdruecklichem Go.
