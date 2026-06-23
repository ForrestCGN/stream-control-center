# NEXT CHAT PROMPT - stream-control-center / RDAP5J Monitoring and Hardening

Du bist ChatGPT im Projekt `stream-control-center` fuer ForrestCGN. Arbeite auf Deutsch, direkt, sauber und schrittweise.

## Wichtigste Arbeitsregeln

- Immer zuerst echten Stand pruefen: GitHub/dev, echte Dateien, Projekt-Dokus, Live-Ausgaben.
- Nicht raten. Wenn Dateien fehlen oder unklar sind, exakt nach den benoetigten Dateien fragen.
- Keine Funktionalitaet entfernen.
- Bestehende Module/Helper/Systeme nutzen, kein Modul-Wildwuchs.
- Vor jeder Umsetzung: Ziel, Scope, Dateien, Nicht-Aenderungen und Tests nennen.
- Umsetzung erst nach ausdruecklichem `go`.
- ZIPs immer mit echten Repo-Pfaden ab Repo-Root liefern.
- Keine losen Dateien ohne Zielpfad.
- Kein Desktop als Standardziel; bevorzugt Downloads oder Repo `_handoff`/`_tmp`.
- `installstep.cmd` spielt ZIPs ein und startet Tests, `stepdone.cmd` erst nach erfolgreichem Live-Test.
- Bei Fehlern `stepundo.cmd` nutzen.
- Keine produktive SQLite ersetzen, loeschen oder neu bauen.
- Keine MariaDB-Migration ohne Backup-/Migrationsplan und eigenes Go.
- Keine Secrets ins Repo, Frontend oder Chat.
- Keine freien Shell-/Datei-/Prozessbefehle in Agent-/Dashboard-Systemen.
- Backend prueft Rechte; Frontend ist nie Sicherheitsentscheidung.
- Rollen und Gruppen getrennt halten.
- `sound_profi` ist Gruppe/Markierung, keine Rolle und keine feste globale Rechte-Sammlung.

## Startdateien zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
docs/current/REMOTE_DASHBOARD_RDAP5J_REMOTE_NODE_MONITORING_AND_HARDENING.md
```

## Aktueller Stand

RDAP5I ist live read-only erfolgreich.

RDAP5J ist als Monitoring-/Hardening-Runbook dokumentiert. Es wurden keine Code-, DB-, Service- oder nginx-Aenderungen vorgenommen.

Remote API:

```text
https://mods.forrestcgn.de/api/remote/health
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
https://mods.forrestcgn.de/api/remote/health?db=1
```

Bestaetigte RDAP5I-Sicherheitslage:

```text
readOnly: true
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
migrationEnabled: false
agent.enabled: false
agent.actionsEnabled: false
```

Kritische DB-Zuordnung:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Falsch/alt, nicht verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

Passwort steht nur auf dem Server in:

```text
/etc/stream-control-center/remote-modboard.env
```

Passwort niemals posten oder dokumentieren.

## RDAP5J Akzeptanztests

Auf dem Webserver:

```bash
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
systemctl status scc-remote-modboard.service --no-pager
journalctl -u scc-remote-modboard.service -n 80 --no-pager
ss -ltnp | grep ':3010'
curl -fsS http://127.0.0.1:3010/api/remote/health
curl -fsS http://127.0.0.1:3010/api/remote/status
curl -fsS http://127.0.0.1:3010/api/remote/routes
curl -fsS "http://127.0.0.1:3010/api/remote/health?db=1"
nginx -t
```

Auf dem lokalen PC:

```powershell
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/health" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/routes" | ConvertTo-Json -Depth 8
Invoke-RestMethod "https://mods.forrestcgn.de/api/remote/health?db=1" | ConvertTo-Json -Depth 8
```

Erwartung:

- Service enabled/active
- keine Crash-Loops
- Node lauscht nur auf `127.0.0.1:3010`
- API liefert Health/Status/Routes
- DB-Lesetest funktioniert
- read-only bleibt aktiv
- Writes/Auth/Migration/Agent-Actions bleiben aus
- keine Secrets im Journal oder Output

## Naechste moegliche Steps

1. Forrest fuehrt RDAP5J-Akzeptanztests aus und postet Output.
2. Danach `stepdone.cmd` mit passender Meldung ausfuehren, falls Tests sauber sind.
3. Danach separat planen:
   - `RDAP4B_REMOTE_AGENT_RDAP5C3_ROLE_GROUP_REVISION`
   - oder `RDAP6_AUTH_DB_MIGRATION_PREP`

Bei RDAP6: kein Start ohne Backup-/Migrationsplan und eigenes Go.
