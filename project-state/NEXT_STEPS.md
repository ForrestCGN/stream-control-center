# NEXT STEPS

Stand: RDAP7D_AUTH_STATUS_DEPLOY_RESULT_DOCS  
Datum: 2026-06-23

## Aktueller Stand

Fertig und dokumentiert:

```text
RDAP7B Auth Read-only Status Endpoints gebaut und gepusht
RDAP7C Remote Auth Status Deploy/Test bestanden
RDAP7D Ergebnis dokumentiert
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
RDAP7E_TWITCH_OAUTH_DRY_RUN_PLAN
```

Ziel:

```text
Twitch-OAuth-Dry-Run sauber planen, ohne Login zu aktivieren.
```

Dabei klaeren:

```text
Twitch Developer App / Redirect URI
benoetigte ENV-Keys ohne Secrets im Repo
OAuth State/CSRF Konzept
Callback-Route spaeter nur nach separatem Go
Session-Erstellung spaeter nur mit Server-Checks
Audit/Rate-Limit/Fehlertexte
```

## Vorher optional / offen

```text
RDAP7C1_SERVER_WORKDIR_CLEANUP
```

Status:

```text
vorbereitet, aber ohne bestaetigte Server-Ausgabe nicht als erledigt dokumentiert
```

Ziel:

```text
alte RDAP-Backups aus /root nach /var/backups/stream-control-center verschieben
alte RDAP-Temp-/Deploy-Clones aus /root entfernen
/opt/stream-control-center/_deploy_tmp und _runtime_tmp nutzen
```

## Noch nicht erlaubt

```text
kein Login aktivieren
keine Twitch-OAuth-Secrets ins Repo
keine Session-Cookies setzen
keine Session-Erstellung
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine neuen /root RDAP-Arbeitsordner
```

## Spaeter, nicht jetzt

```text
RDAP7F Twitch OAuth Config/ENV Precheck
RDAP7G OAuth Callback Dry-Run ohne Session-Erstellung
RDAP7H Session Store Read-only/Validation Layer
RDAP8 Permission Check Middleware Plan
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen.
