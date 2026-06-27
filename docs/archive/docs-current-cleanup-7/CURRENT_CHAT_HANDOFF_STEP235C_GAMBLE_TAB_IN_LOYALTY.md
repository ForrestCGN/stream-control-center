# CURRENT CHAT HANDOFF – STEP235C Gamble Tab in Loyalty

Stand: STEP235C
Projekt: ForrestCGN / stream-control-center
Bereich: Dashboard / Loyalty

## Zweck

Gamble wurde als eigener Tab in den bestehenden Loyalty/Games-Dashboard-Bereich integriert.
Dieser Schritt ist Dashboard-only und verändert keine Backend-, Datenbank-, Command- oder API-Logik.

## Geänderte Dateien

- `htdocs/dashboard/modules/loyalty_games.js`
- `htdocs/dashboard/modules/loyalty_games.css`

## Nicht geändert

- Backend
- Datenbank
- APIs
- Commands
- Gamble-Engine
- Giveaways-Backend
- Loyalty-Core
- Overlays
- Config-Dateien
- Standalone-Gamble-Dateien:
  - `htdocs/dashboard/loyalty-gamble.html`
  - `htdocs/dashboard/modules/loyalty-gamble.js`
  - `htdocs/dashboard/modules/loyalty-gamble.css`

## Inhalt der Änderung

- Neuer Tab `Gamble` im Loyalty/Games-Bereich.
- Gamble-Konfiguration wird über die bestehende API geladen:
  - `GET /api/loyalty/games/gamble/dashboard-config`
- Gamble-Dryrun wird über die bestehende API ausgeführt:
  - `POST /api/loyalty/games/gamble/dashboard-config` mit `dryRun=true`
- Echter Write bleibt geschützt:
  - `confirmWrite=true` ist weiterhin erforderlich.
  - UI hat zusätzlich Checkbox `Write bestätigen`.
- Gamble-Audit wird über die bestehende API geladen:
  - `GET /api/loyalty/games/gamble/dashboard-audit?limit=8`
- Gamble-Statistik wird aus Command-Logs berechnet:
  - `GET /api/commands/logs?limit=80`
- Ergebnisbox zeigt Dryrun-/Write-/Fehlerausgaben an.

## Tests

Syntaxprüfung:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard` öffnen
- `Loyalty` öffnen
- Tab `Gamble` öffnen
- Config lädt
- Dryrun testen
- Speichern ohne Confirm wird blockiert
- Speichern mit Confirm funktioniert nur über bestehende API/Rechte
- Audit lädt
- Statistik lädt
- Wheel/Presets/Giveaways weiterhin prüfen

## Risiko / Hinweise

- Mittel, weil Gamble eine Write-UI enthält.
- Backend-Schutz bleibt maßgeblich; Dashboard setzt nur bestehende Payloads ab.
- Standalone-Gamble-Seite bleibt bewusst erhalten, bis der neue Tab live getestet ist.
- Nächster Schritt nach erfolgreichem Live-Test: STEP235D Standalone-Gamble prüfen/bereinigen.

## StepDone

Nach Entpacken, Tests und Sichtprüfung:

```powershell
.\stepdone.cmd "STEP235C Gamble Tab in Loyalty Dashboard"
```
