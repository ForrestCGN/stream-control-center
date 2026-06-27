# CURRENT CHAT HANDOFF – STEP235J Remove Standalone Gamble Dashboard

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Gamble

## Ziel

Die alte Standalone-Gamble-Dashboard-Seite wird aus dem Zielstand entfernt, weil Gamble inzwischen im Loyalty-Dashboard-Bereich integriert ist.

## Betroffene alte Dateien zur Entfernung

Diese Dateien sollen per `git rm` entfernt werden:

- `htdocs/dashboard/loyalty-gamble.html`
- `htdocs/dashboard/modules/loyalty-gamble.js`
- `htdocs/dashboard/modules/loyalty-gamble.css`

## Grund

Die Standalone-Seite ist veraltet und entspricht nicht mehr dem aktuellen Dashboard-UX-Stand.

Bekannte Altlasten:

- alte Standalone-Config-Oberfläche
- alter Dryrun-Button
- alte Checkbox „Write bestätigen“
- alte technische JSON-Ausgabe
- veraltete Navigationseinbindung
- Gamble ist jetzt im Loyalty/Games-Bereich integriert

## Nicht geändert

- kein Backend
- keine Datenbank
- keine API
- keine Commands
- keine Gamble-Engine
- keine Giveaways
- kein Loyalty-Core
- keine Overlays
- keine Änderung an produktiven Flows

## Bestehende Gamble-Zielfunktion

Gamble läuft künftig über:

- `htdocs/dashboard/modules/loyalty_games.js`
- `htdocs/dashboard/modules/loyalty_games.css`

Dashboard-Pfad:

- `/dashboard`
- Loyalty → Gamble
- Loyalty → Config → Gamble

## Tests nach Entfernung

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard` lädt
- Loyalty → Gamble lädt
- Loyalty → Config → Gamble lädt
- Speichern fragt nach Bestätigung
- Audit/Statistik laden
- keine Browser-Console-Fehler im normalen Dashboard
- keine 404 auf `loyalty-gamble.html`
- keine 404 auf `loyalty-gamble.js`
- keine 404 auf `loyalty-gamble.css`

## Ausführungshinweis

Dieses ZIP entfernt Dateien nicht automatisch. Nach dem Entpacken muss die Entfernung per Git erfolgen:

```powershell
cd /d D:\Git\stream-control-center

git rm htdocs/dashboard/loyalty-gamble.html
git rm htdocs/dashboard/modules/loyalty-gamble.js
git rm htdocs/dashboard/modules/loyalty-gamble.css
```

Wenn eine Datei bereits fehlt, Ausgabe prüfen und nicht blind erzwingen.

Danach testen und StepDone ausführen:

```powershell
.\stepdone.cmd "STEP235J Remove Standalone Gamble Dashboard"
```

## Risiko

Niedrig, weil die Standalone-Seite veraltet ist und Gamble bereits im Loyalty-Bereich integriert wurde. Trotzdem erst nach Browser-Test live akzeptieren.
