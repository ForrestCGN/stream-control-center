# CHANGELOG ADDENDUM

## RDAP2.WEB1 / Webserver-Grundlage für Remote-Modboard geprüft – 2026-06-23

Dokumentiert:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`
- `docs/current/START_HERE_FOR_NEW_CHAT.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/FILES.md`

Festgehalten:

- Remote-Modboard-Subdomain ist jetzt `mods.forrestcgn.de`.
- Alte Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend.
- `mods.forrestcgn.de` ist per HTTPS, IPv4 und IPv6 erreichbar.
- nginx und Let's Encrypt sind für die Subdomain geprüft.
- `apt update` läuft wieder sauber.
- Node.js `v20.19.2`, npm `9.2.0` und npx `9.2.0` sind auf dem Webserver vorhanden.
- Node-App bleibt für später intern geplant, bevorzugt `127.0.0.1:3000`.
- Öffentlich bleibt nur HTTPS/WSS geplant.

Nicht geändert:

- kein Backend-Code
- kein Dashboard-Code
- kein Frontend-Code
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Änderung
- keine Runtime-Datei
- kein Reverse Proxy auf `127.0.0.1:3000`
- kein lokaler `stream-control-center`-Node-Neustart nötig

Nächster sinnvoller Schritt:

```text
RDAP3 / Minimal-Agent-Konzept planen
```
