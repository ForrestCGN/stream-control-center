# NEXT STEPS

Stand: RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN  
Datum: 2026-06-23

## Aktueller Stand

Fertig und dokumentiert:

```text
RDAP7B Auth Read-only Status Endpoints gebaut
RDAP7C Remote Auth Status Deploy/Test live bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Server Workdir Cleanup Docs abgeschlossen
RDAP7F Chat-Handoff und Next-Chat-Prompt erstellt
RDAP7F Twitch OAuth Dry-Run Plan dokumentiert
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
RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED
```

Ziel:

```text
ENV-/Server-Vorbereitung fuer Twitch OAuth, weiterhin disabled, ohne produktiven Login zu aktivieren.
```

RDAP7G soll klaeren/umsetzen, aber erst nach eigenem Scope und go:

```text
.env.example Werte pruefen und ggf. ohne Secrets korrigieren
Server-ENV-Platzhalter in /etc/stream-control-center/remote-modboard.env vorbereiten
TWITCH_OAUTH_ENABLED=false setzen
SESSION_ENABLED=false setzen
keine Start-/Callback-Route produktiv aktivieren
Status-/Safety-Ausgabe ggf. nur read-only um OAuth-disabled-Status erweitern
```

## Noch nicht erlaubt

```text
kein Login aktivieren
keine Twitch-OAuth-Secrets ins Repo
keine OAuth-Callback-Route produktiv freischalten
keine Session-Cookies setzen
keine Session-Erstellung
keine User-/Rollen-/Gruppen-Schreibroute
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
```

## Danach moeglich, nicht jetzt

```text
RDAP7H OAuth Callback Skeleton read-only/disabled
RDAP7I Session Store Read-only/Validation Layer
RDAP8 Permission Check Middleware Plan
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen. Keine RDAP-Arbeitsordner mehr in `/root`.
