# NEXT_STEPS

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Priorität A: Lokal/LAN-Betrieb planen

Nächster sinnvoller Local-Mode-Step:

```text
RDAP_LOCAL_MODE2_ENV_AND_START_SCRIPT_PLAN
```

Ziele:

- lokale Env-Strategie planen
- lokales Startscript planen
- LAN-Zugriff vorbereiten
- Twitch-Login lokal weiter vorbereiten
- ForrestCGN und EngelCGN als echte Twitch-Identitäten berücksichtigen
- lokale DB-Strategie vorbereiten
- keine Secrets ins Repo
- keine DB-Migration
- keine produktiven Writes

## Priorität B: Admin-Userverwaltung fortsetzen

Nächster Admin-Step:

```text
RDAP_ADMIN_USERS6_CONFIRM_AUDIT_LOCK_FOUNDATION
```

Ziele:

- Confirm-Write-Pattern vorbereiten
- Audit-Pflicht vorbereiten
- Locking-Grundlage vorbereiten
- weiterhin keine produktiven User-/Rollen-/Gruppen-Writes

## Priorität C: Build-/Header-Cleanup

Empfohlener Cleanup-Step:

```text
RDAP_META1_BUILD_HEADER_CLEANUP
```

Ziele:

- veraltete Build-Anzeige `RDAP_AUTH2_CENTRAL_LOGIN_READY` bereinigen
- Status-/Header-Metadaten zentralisieren
- Tests weniger verwirrend machen

## Nicht als nächstes bauen

Noch nicht:

- echte User-Freigabe/Sperre
- Rollen-/Gruppenvergabe
- Session-Widerruf
- DB-Migration
- Agent-Actions
- OBS-/Sound-/Overlay-/Command-Steuerung
- lokaler Fake-Admin-Bypass

## Test-/Deploy-Regel

Lokal:

```text
installstep.cmd
node --check
git status
stepdone.cmd
```

Webserver erst danach:

```text
frischer GitHub/dev-Clone in _deploy_tmp/<STEP_NAME>
remote-modboard-deploy.sh <STEP_NAME> dev
systemctl restart
Readiness
curl/browser tests
```
