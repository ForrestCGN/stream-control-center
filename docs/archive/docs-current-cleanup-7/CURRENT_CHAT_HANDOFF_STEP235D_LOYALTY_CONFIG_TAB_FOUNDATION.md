# CURRENT CHAT HANDOFF – STEP235D Loyalty Config Tab Foundation

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center
Bereich: Dashboard / Loyalty

## Zweck

STEP235D verschiebt die Gamble-Konfiguration aus dem sichtbaren Gamble-Tab in einen zentralen Loyalty-Config-Tab.
Der Schritt ist Dashboard-only und ändert keine Backend-APIs, keine Datenbank, keine Commands und keine produktiven Flows.

## Ausgangslage

- STEP235A Dashboard Shell stabilisieren wurde live bestätigt.
- STEP235B entfernt die STEP232-Gamble-Shell-Sonderintegration.
- STEP235C hat Gamble als Tab im Loyalty/Games-Bereich sichtbar integriert.
- Der Gamble-Tab war funktional, enthielt aber prominent die komplette Config-Write-Oberfläche.

## Änderung

Geänderte Dateien:

- `htdocs/dashboard/modules/loyalty_games.js`
- `htdocs/dashboard/modules/loyalty_games.css`

Neue/aktualisierte Doku:

- `docs/current/CURRENT_CHAT_HANDOFF_STEP235D_LOYALTY_CONFIG_TAB_FOUNDATION.md`

### Dashboard

- Neuer Tab `Config` im Loyalty/Games-Bereich.
- Config-Tab enthält einen Bereichs-Dropdown.
- Aktuell aktiv angebunden ist nur `Gamble`.
- Weitere Bereiche sind als geplant/disabled sichtbar:
  - Kekskrümel/Core
  - Runner/Watchtime
  - Glücksrad
  - Presets
  - Giveaways
  - Chat/Commands
  - Texte
- Gamble-Config-Formular liegt nun im Config-Tab.
- Gamble-Tab ist schlanker:
  - Status/KPIs
  - aktive Regeln
  - Statistik
  - Audit
  - letztes Ergebnis
  - Button `Config bearbeiten`

### Sicherheit

- Write-Schutz bleibt erhalten:
  - `confirmWrite`
  - Actor Login
  - Actor Role
  - Dryrun
- Bestehende API bleibt unverändert:
  - `GET /api/loyalty/games/gamble/dashboard-config`
  - `POST /api/loyalty/games/gamble/dashboard-config`
  - `GET /api/loyalty/games/gamble/dashboard-audit`

## Nicht geändert

- Backend
- Datenbank
- APIs
- Commands
- Gamble-Engine
- Giveaways
- Loyalty-Core
- Overlays
- Standalone-Gamble-Dateien:
  - `htdocs/dashboard/loyalty-gamble.html`
  - `htdocs/dashboard/modules/loyalty-gamble.js`
  - `htdocs/dashboard/modules/loyalty-gamble.css`

## Tests

Vor StepDone ausführen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard` öffnen
- Loyalty öffnen
- Tab `Gamble` prüfen
- Button `Config bearbeiten` öffnet Config-Tab
- Config-Tab zeigt Dropdown und Gamble-Config
- Dryrun testen
- Speichern ohne Confirm wird blockiert
- Speichern mit Confirm nutzt bestehende API
- Statistik/Audit im Gamble-Tab laden
- Glücksrad/Presets/Giveaways weiter prüfen

## Nächster sinnvoller Schritt

STEP235E: Wenn STEP235D live bestätigt ist, Standalone-Gamble und alte Gamble-Dateien auditieren:

- `htdocs/dashboard/loyalty-gamble.html`
- `htdocs/dashboard/modules/loyalty-gamble.js`
- `htdocs/dashboard/modules/loyalty-gamble.css`

Noch nicht löschen, bevor bestätigt ist, dass Gamble im Loyalty-Config-Tab vollständig funktioniert.
