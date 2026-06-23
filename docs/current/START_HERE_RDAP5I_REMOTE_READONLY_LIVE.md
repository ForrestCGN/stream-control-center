# START HERE - RDAP5I Remote Read-only Live

Stand: 2026-06-23

Dieser kurze Einstieg gilt fuer den naechsten Chat, bis `START_HERE_FOR_NEW_CHAT.md` vollstaendig aktualisiert ist.

## Wichtigster aktueller Stand

RDAP5I ist live read-only erfolgreich:

```text
https://mods.forrestcgn.de/api/remote/health?db=1
https://mods.forrestcgn.de/api/remote/status
https://mods.forrestcgn.de/api/remote/routes
```

Bestaetigt:

```text
ok=true
readOnly=true
writeEnabled=false
database.reachable=true
agent.enabled=false
agent.actionsEnabled=false
```

## Sofort zuerst tun

```bash
systemctl is-enabled scc-remote-modboard.service
systemctl is-active scc-remote-modboard.service
journalctl -u scc-remote-modboard.service -n 30 --no-pager
```

## Kritische Korrektur

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Fruehere Angaben mit vertauschtem User/Name sind falsch.

## Weitere Details

Siehe:

```text
docs/current/NEXT_CHAT_PROMPT_RDAP5I_REMOTE_READONLY_LIVE.md
docs/current/REMOTE_DASHBOARD_RDAP5I_REMOTE_SERVER_READONLY_INSTALL_EXECUTION.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/NEXT_STEPS.md
project-state/FILES.md
```
