# NEXT STEPS

Stand: RDAP7F_CHAT_HANDOFF_AND_NEXT_PROMPT  
Datum: 2026-06-23

## Aktueller Stand

Fertig und dokumentiert:

```text
RDAP7B Auth Read-only Status Endpoints gebaut
RDAP7C Remote Auth Status Deploy/Test live bestanden
RDAP7C1 Server Workdir Cleanup bestanden
RDAP7E Server Workdir Cleanup Docs abgeschlossen
RDAP7F Chat-Handoff und Next-Chat-Prompt erstellt
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
RDAP7F_TWITCH_OAUTH_DRY_RUN_PLAN
```

Ziel:

```text
Twitch-OAuth-Dry-Run planen, ohne produktiven Login zu aktivieren.
```

RDAP7F soll klaeren:

```text
Twitch Developer Console App/Redirect-URL
benoetigte ENV-Werte ohne Secrets im Repo
Callback-/Redirect-Pfade
State-/CSRF-Konzept
Fehler-/Stop-Punkte
Testplan
Rollback
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
RDAP7G Twitch OAuth ENV/Server Prep ohne Login-Aktivierung
RDAP7H OAuth Callback Skeleton read-only/disabled
RDAP7I Session Store Read-only/Validation Layer
RDAP8 Permission Check Middleware Plan
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen. Keine RDAP-Arbeitsordner mehr in `/root`.
