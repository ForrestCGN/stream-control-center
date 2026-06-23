# NEXT STEPS

Stand: DASHUI5 / React-Prototyp auf V13-Designbasis angeglichen  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
WF1 / Git-Workflow für frontend/dashboard-v2 prüfen und anpassen
```

Grund:

Beim vorherigen `stepdone` blieb der React-Quellcode untracked:

```text
?? frontend/dashboard-v2/...
```

Das bedeutet, GitHub/dev enthielt zwar Doku/Projektstatus, aber nicht den eigentlichen React-Prototyp.

Ziel WF1:

- prüfen, welche Workflow-Skripte `git add` ausführen
- `frontend/` bzw. gezielt `frontend/dashboard-v2/` in den erlaubten Commit-/Upload-Pfad aufnehmen
- weiterhin blockierte Pfade wie `token`, `secret`, `.env`, `.sqlite`, `.db`, `.zip`, `.7z` schützen
- keine Secrets erlauben
- keine produktive Runtime ändern
- nach StepDone darf kein `?? frontend/` übrig bleiben

## Danach sinnvoll

```text
DASHUI6 / Build- und lokaler Auslieferungsweg prüfen
```

Ziel:

- `npm.cmd install`
- `npm.cmd run build`
- prüfen, ob `htdocs/dashboard-v2/` korrekt entsteht
- lokalen Aufruf über `/dashboard-v2/` prüfen
- altes Dashboard unter `/dashboard` gegenprüfen
- keine produktiven Aktionen
- kein Backend ändern

## Danach sinnvoll

```text
DASHUI7 / erste read-only Statusseite mit echter API-Anbindung
```

Mögliche Kandidaten:

- Remote Agent Status
- Systemstatus
- Twitch-Events Status
- Sound-System Status

Regel:

- zuerst read-only
- keine Speichern-/Start-/Stop-/Löschen-Aktion
- keine produktive Modulmigration

## Nicht als nächstes nebenbei machen

- kein produktives altes Dashboard ersetzen
- keine Big-Bang-Migration
- keine Schreibfunktionen ohne Permission/Lock/Audit
- kein Login-System improvisieren
- kein Remote-Modboard-Deploy ohne Webserver-/Auth-Step
- keine OBS-/Sound-/Media-/Command-Aktionen im Prototyp
- keine produktive DB-Migration
- keine Creative-Tim-/Vision-UI-Codebasis übernehmen
