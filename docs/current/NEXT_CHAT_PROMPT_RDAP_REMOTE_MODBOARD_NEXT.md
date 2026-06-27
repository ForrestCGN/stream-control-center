# NEXT CHAT PROMPT - Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
- Nutzerkommunikation mit Version und deutschem Buildnamen. Interne RDAP-Step-IDs nur fuer ZIP/Commit/Deploy/Handoff verwenden.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

Aktueller bestaetigter Stand:

```text
0.2.9 - Dashboard-v2 Navigation angeglichen
```

Umgesetzt:

- System, Module und Admin an die Online-Struktur angeglichen.
- Lokale Zukunftsbereiche Aktionen, Loyalty, Media und Overlays beibehalten.
- Sichtbare Unterpunkte bleiben deaktiviert.
- Nur System -> Uebersicht ist aktiv.
- Keine Online-Adminfunktion kopiert oder freigeschaltet.
- `/dashboard` bleibt unveraendert.
- Keine DB-Migration, keine Writes, keine Agent-Actions.

Vorher bestaetigt:

```text
0.2.8 - Dashboard-v2 Einstieg vorbereitet
```

- Erste lokale Startseite im Modboard-Look vorbereitet.
- Fake-Zustaende und Demo-Bedienelemente entfernt.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Readback.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- `/dashboard` nicht blind ersetzen.

## Naechster sinnvoller Arbeitsfokus

```text
0.2.10 - Stream-PC Status read-only vorbereitet
```

Vor dem Plan unbedingt lesen:

```text
backend/server.js
backend/modules/stream_status.js
backend/modules/diagnostics.js
frontend/dashboard-v2/src/services/apiClient.js
frontend/dashboard-v2/src/services/agentClient.js
frontend/dashboard-v2/src/modules/remote-agent/RemoteAgentPage.jsx
frontend/dashboard-v2/src/services/
frontend/dashboard-v2/src/modules/
```

Moeglicher Inhalt:

- vorhandenen Menuepunkt System -> Stream-PC aktivieren,
- nur bestehende sichere GET-Routen verwenden,
- Server-, WebSocket- und gecachten Streamstatus anzeigen,
- keine parallelen Statuswege bauen,
- `/dashboard` stabil lassen,
- keine Aktionen/Writes.
