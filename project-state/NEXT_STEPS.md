# NEXT STEPS - stream-control-center

Stand: RDAP_UI1_LIVE_CONFIRMED
Datum: 2026-06-24

## Aktueller Abschluss

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

ist live abgeschlossen.

Bestätigt:

- Remote-Modboard UI sichtbar unter `https://mods.forrestcgn.de/`
- eigener ISPConfig-vHost aktiv
- SSL/Let's Encrypt ok
- Node-Service intern weiter `127.0.0.1:3010`
- API read-only erreichbar
- OAuth Start/Callback weiter HTTP 403
- keine Login-/Write-/Agent-Aktivierung

## Nächster sinnvoller Schritt

Vor weiteren UI-/Backend-Schritten zuerst den Deploy-Ablauf sauber machen, damit sich das Server-Chaos nicht wiederholt.

Empfohlen:

```text
RDAP_DEPLOY_RUNBOOK_OR_SCRIPT
```

Ziel:

- dokumentierter Server-Deploy-Ablauf für `remote-modboard`
- kein Git-Pull in `/opt/stream-control-center`, weil dort kein Git-Repo liegt
- GitHub/dev nach `_deploy_tmp` klonen/aktualisieren
- Backup nach `_runtime_tmp`
- gezieltes `rsync` nur für `remote-modboard/`
- Rechte setzen
- JS-Syntaxcheck
- `systemctl restart scc-remote-modboard.service`
- Readiness-Wait
- API-/UI-/OAuth-403-Tests
- keine Arbeitsordner/Backups in `/root`

Danach erst UI2 planen.

## Möglicher UI2-Fokus

Nur read-only Komfort, kein Login, keine Writes:

- Auto-Refresh für Diagnosekarten
- letzte Aktualisierung sichtbar
- bessere Fehleranzeige bei API-Ausfall
- kompakte Routen-/Security-Details
- keine Steuerbuttons
- keine POST/PUT/PATCH/DELETE Calls
