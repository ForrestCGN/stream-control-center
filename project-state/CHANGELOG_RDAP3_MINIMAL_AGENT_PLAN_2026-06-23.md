# CHANGELOG RDAP3 MINIMAL AGENT PLAN 2026-06-23

Step: RDAP3.DOC1 / Minimal-Agent-Konzept  
Status: Doku-/Planungsstep, keine Umsetzung

## Neu

- Neue Plan-Datei ergänzt:
  - `docs/current/REMOTE_DASHBOARD_AGENT_RDAP3_MINIMAL_AGENT_PLAN.md`

## Aktualisiert

- Projektstatus aktualisiert:
  - `project-state/CURRENT_STATUS.md`
  - `project-state/NEXT_STEPS.md`
  - `project-state/TODO.md`
  - `project-state/FILES.md`
  - `project-state/CHANGELOG.md`

- Bestehende RDAP-Plan-Dateien nachgezogen:
  - `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
  - `docs/current/REMOTE_DASHBOARD_AGENT_RDAP2_DECISIONS.md`

## Festgehalten

- Remote-Modboard-Ziel bleibt `https://mods.forrestcgn.de`.
- Frühere Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend.
- Stream-PC-Agent wird als separater Node-Prozess geplant.
- Agent verbindet sich aktiv per WSS zum Webserver.
- Webserver-Node-App später intern, bevorzugt `127.0.0.1:3000`.
- Öffentlich nur HTTPS/WSS.
- Kein öffentlicher Node-Port.
- Lokales Backend bleibt produktive Runtime auf `http://127.0.0.1:8080`.
- Auth wird mit `agentId` + Secret geplant.
- Secret darf nicht ins Repo, nicht ins Frontend und nicht ins Audit.
- Heartbeat und Basisstatus wurden geplant.
- Minimal erlaubte Actions für RDAP3:
  - `agent.ping`
  - `agent.status.request`
- Request-/Result-/Audit-Struktur wurde konkretisiert.
- Offline-/Reconnect-Verhalten wurde konkretisiert.
- Keine Offline-Queue.
- Keine automatische spätere Ausführung nach Reconnect.

## Nicht geändert

- Kein Backend geändert.
- Kein Dashboard geändert.
- Kein Frontend geändert.
- Kein Agent-Code erstellt.
- Keine DB geändert.
- Keine Config geändert.
- Keine OBS-Quelle geändert.
- Keine Runtime-Datei geändert.
- Kein Reverse Proxy eingerichtet.
- Kein systemd-Service eingerichtet.
- Kein Node-Neustart nötig.

## Nächster sinnvoller Schritt

- RDAP4 / Permission- und Edit-Session-/Lock-Datenmodell planen.
