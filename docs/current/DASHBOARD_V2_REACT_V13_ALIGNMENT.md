# Dashboard v2 React-Prototyp auf V13-Designbasis

Stand: 2026-06-23  
Status: DASHUI5 / React-Prototyp an V13-Design angeglichen

## Zweck

DASHUI5 korrigiert den React-Prototyp aus DASHUI4B optisch und strukturell auf die verbindliche Design-Test-v13-Basis.

## Geändert

- Topbar an v13 angenähert
- Modulname und aktiver Tab stehen inline in der Topbar
- Suchfeld in der Topbar vorbereitet
- Status-Chips in der Topbar vorbereitet
- User-/Sprache-/Bell-Bereich vorbereitet
- Sidebar an v13-Accordion angenähert
- immer nur ein Sidebar-Bereich offen
- Content-Flächen kompakter und näher am v13-Glass-Design
- Galaxy-/Dot-Grid-Hintergrund aus v13-Richtung übernommen
- React-Komponenten bleiben erhalten
- keine produktiven Aktionen ergänzt

## Nicht geändert

- kein Backend-Code
- kein bestehendes Dashboard unter `htdocs/dashboard/`
- kein Build-Output unter `htdocs/dashboard-v2/`
- kein Agent-Code
- keine produktive SQLite
- keine Projekt-Config
- keine OBS-Quelle
- kein Webserver-Deploy
- kein Reverse Proxy
- kein systemd-Service

## Wichtig zum Git-Workflow

Beim letzten Step wurde sichtbar, dass `frontend/` von `stepdone.cmd` bzw. dem Upload-Workflow nicht automatisch committed wurde.

Der aktuelle Arbeitsstand zeigte nach `stepdone` weiterhin:

```text
?? frontend/dashboard-v2/...
```

Das bedeutet:

- die Doku wurde committed
- der eigentliche React-Quellcode blieb untracked
- GitHub/dev enthielt den React-Prototyp noch nicht vollständig

Für künftige Dashboard-v2-Steps muss `frontend/` in den Commit-/Upload-Workflow aufgenommen werden.

Solange das nicht angepasst ist, muss vor `stepdone` geprüft werden:

```powershell
git status --short
```

und es darf danach kein `?? frontend/` mehr übrig bleiben.

## Nächster sinnvoller Schritt

```text
WF1 / Git-Workflow für frontend/dashboard-v2 prüfen und anpassen
```

oder, falls der Workflow manuell korrigiert wird:

```text
DASHUI6 / Build- und lokaler Auslieferungsweg prüfen
```
