# NEXT STEPS - stream-control-center

Stand: RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
Datum: 2026-06-24

## Aktueller Abschluss

```text
RDAP_DEPLOY_SCRIPT_LIVE_TEST_CONFIRMED
```

ist abgeschlossen.

Bestätigt:

- `tools/remote-modboard-deploy.sh` live auf dem Webserver getestet
- Clone nach `_deploy_tmp`
- Backup nach `_runtime_tmp`
- `rsync` nach `/opt/stream-control-center/remote-modboard`
- Rechte gesetzt
- JS-Syntaxcheck ok
- Service restart ok
- Readiness ok
- Public UI ok
- Public API ok
- OAuth Start/Callback bleiben HTTP 403

## Nächster sinnvoller Schritt

```text
RDAP_UI2_READONLY_COMFORT
```

Ziel:

- erste UI bleibt read-only
- Auto-Refresh für Diagnosekarten
- letzte Aktualisierung sichtbar
- bessere Fehleranzeige bei API-Ausfall
- kompaktere Routen-/Security-Details
- keine Steuerbuttons
- keine POST/PUT/PATCH/DELETE Calls
- kein Login
- kein OAuth
- keine Cookies
- keine Sessions
- keine Writes
- keine Agent-Actions

## Danach

Erst nach UI2 erneut prüfen:

- ob Login/Auth/OAuth separat geplant werden soll
- ob Lock-/Audit-UI nur read-only sichtbar gemacht wird
- ob User-/Rollenplanung als eigener großer Scope gestartet wird
