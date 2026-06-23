# NEXT STEPS

Stand: RDAP7G_TWITCH_OAUTH_ENV_SERVER_PREP_DISABLED  
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
RDAP7G Twitch OAuth ENV/Server Prep disabled vorbereitet
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
RDAP7H_OAUTH_CALLBACK_SKELETON_DISABLED
```

Ziel:

```text
OAuth Start-/Callback-Skeleton serverseitig vorbereiten, aber weiterhin disabled/read-only.
```

RDAP7H darf klaeren/umsetzen, aber erst nach eigenem Scope und go:

```text
Routenpfade fuer /auth/twitch/start und /auth/twitch/callback als disabled skeleton planen
keinen Redirect zu Twitch aktivieren
keinen Code gegen Token tauschen
keine Cookies setzen
keine Sessions erstellen
keine DB-Writes
Status/Routenliste muss klar melden, dass OAuth-Routen disabled sind
```

## Noch nicht erlaubt

```text
kein Login aktivieren
keine Twitch-OAuth-Secrets ins Repo
keine OAuth-Start-Route produktiv freischalten
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
RDAP7I Session Store Read-only/Validation Layer
RDAP8 Permission Check Middleware Plan
RDAP9 Lock-/Audit-Konzept fuer spaetere Writes
```

## Arbeitsregel

Nur EIN Arbeitsort pro Schritt. Keine Server-/PowerShell-/DB-Schritte mischen. Keine RDAP-Arbeitsordner mehr in `/root`.
