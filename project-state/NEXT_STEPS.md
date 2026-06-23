# NEXT STEPS

Stand: RDAP7E_SERVER_WORKDIR_CLEANUP_DOCS  
Datum: 2026-06-23

## Aktueller Stand

Fertig und dokumentiert:

```text
RDAP7B Auth Read-only Status Endpoints gebaut
RDAP7C Remote Auth Status Deploy/Test bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Cleanup-/Status-Doku erstellt
```

Remote-Modboard bleibt read-only:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
```

## Sofort naechster sinnvoller Schritt

```text
RDAP8_TWITCH_OAUTH_DRY_RUN_PLAN
```

Ziel:

```text
Twitch-OAuth-Login als Dry-Run planen, ohne produktiven Login, Callback, Cookies oder Session-Erstellung zu aktivieren.
```

Dabei zu klaeren:

```text
Twitch OAuth Redirect-URI fuer mods.forrestcgn.de
no-secret-in-repo Regel
ENV-Namen fuer Client-ID/Secret/Callback
serverseitige Callback-Sicherheitsregeln
State/Nonce-Konzept
Cookie-Regeln
Session-Hash-Regeln
User-/Identity-Anlage erst in separatem Write-Step
Rollback/Disable-Schalter
```

## Server-Arbeitsorte ab sofort

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Run-/Temp-Dateien:   /opt/stream-control-center/_runtime_tmp/
Backups:             /var/backups/stream-control-center/
```

Nicht mehr verwenden:

```text
/root/rdap*-deploy
/root/rdap*-migration
/root/rdap*-precheck
/root/rdap*_backup_*
```

## Noch nicht erlaubt

```text
kein produktiver Login
keine Twitch-OAuth-Secrets ins Repo
keine OAuth-Callback-Aktivierung ohne separaten Go
keine Session-Cookies setzen
keine Session-Erstellung
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Spaeter, nicht jetzt

```text
RDAP8B Twitch OAuth ENV/Callback Readiness Check
RDAP8C OAuth Callback Dry-Run Code ohne Session-Erstellung
RDAP8D Session Store Read-only/Validation Layer
RDAP9 Permission Check Middleware Plan
RDAP10 Lock-/Audit-Konzept fuer spaetere Writes
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen.
