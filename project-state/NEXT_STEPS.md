# NEXT STEPS - stream-control-center

Stand: RDAP_DEPLOY_RUNBOOK_OR_SCRIPT
Datum: 2026-06-24

## Aktueller Abschluss

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

ist live abgeschlossen.

```text
RDAP_DEPLOY_RUNBOOK_OR_SCRIPT
```

bereitet den festen Remote-Modboard-Serverdeploy vor.

## Nächster sinnvoller Schritt

Den Deploy-Runbook-/Script-Step einmal testen und bestätigen.

Testziel:

```text
tools/remote-modboard-deploy.sh
```

auf dem Webserver mit einem harmlosen Deploy aus GitHub/dev laufen lassen.

Erwartung:

- Clone nach `_deploy_tmp`
- Backup nach `_runtime_tmp`
- rsync nach `/opt/stream-control-center/remote-modboard`
- Rechte gesetzt
- JS-Syntaxcheck ok
- Service restart ok
- Readiness ok
- Public UI ok
- Public API ok
- OAuth Start/Callback bleiben HTTP 403

Danach:

```text
UI2 read-only Komfort planen
```

## Möglicher UI2-Fokus

Nur read-only Komfort, kein Login, keine Writes:

- Auto-Refresh für Diagnosekarten
- letzte Aktualisierung sichtbar
- bessere Fehleranzeige bei API-Ausfall
- kompakte Routen-/Security-Details
- keine Steuerbuttons
- keine POST/PUT/PATCH/DELETE Calls
