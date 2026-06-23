# NEXT STEPS

Stand: WF1 / Frontend Git Workflow korrigiert  
Datum: 2026-06-23

## Sofort nächster Schritt nach Installation

```powershell
git status --short
```

Dann:

```powershell
.\stepdone.cmd "WF1 frontend dashboard-v2 in Git-Workflow aufgenommen und React-Code nachgezogen"
```

Erwartung danach:

```text
kein ?? frontend/
```

Falls weiterhin `?? frontend/` erscheint, nicht weiterbauen.

## Danach sinnvoll

```text
DASHUI6 / Build- und lokaler Auslieferungsweg prüfen
```

Ziel:

- `cd frontend/dashboard-v2`
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

## Nicht nebenbei machen

- kein produktives altes Dashboard ersetzen
- keine Big-Bang-Migration
- keine Schreibfunktionen ohne Permission/Lock/Audit
- kein Login-System improvisieren
- kein Remote-Modboard-Deploy ohne Webserver-/Auth-Step
- keine OBS-/Sound-/Media-/Command-Aktionen im Prototyp
- keine produktive DB-Migration
