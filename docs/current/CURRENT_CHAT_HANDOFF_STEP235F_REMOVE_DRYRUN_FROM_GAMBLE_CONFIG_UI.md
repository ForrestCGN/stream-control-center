# Current Chat Handoff – STEP235F Remove Dryrun from Gamble Config UI

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center

## Ziel

Dryrun wird aus der normalen Gamble-Config-Oberfläche im Loyalty-Dashboard entfernt.

Der Speichern-Flow bleibt geschützt über den bestehenden Bestätigungsdialog. Die bestehende Backend-API bleibt unverändert.

## Geänderte Dateien

- `htdocs/dashboard/modules/loyalty_games.js`
- `docs/current/CURRENT_CHAT_HANDOFF_STEP235F_REMOVE_DRYRUN_FROM_GAMBLE_CONFIG_UI.md`

## Änderungen

- Dryrun-Button aus `Loyalty -> Config -> Gamble` entfernt.
- Dryrun-Event-Handler aus der Dashboard-UI entfernt.
- `submitGambleDryrun(...)` aus der Dashboard-Datei entfernt.
- Speichern bleibt mit Bestätigungsdialog geschützt.
- Write-Payload sendet weiter `confirmWrite=true` und `dryRun=false` an die bestehende API.
- Ergebnisbox bleibt für erfolgreiche Writes und Fehler erhalten.

## Nicht geändert

- Kein Backend-Code.
- Keine Datenbank.
- Keine APIs.
- Keine Commands.
- Keine Gamble-Engine.
- Keine Loyalty-Core-Funktion.
- Keine Giveaways.
- Keine Standalone-Gamble-Dateien.

## Tests

Vor StepDone ausführen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard`
- Loyalty -> Config -> Gamble öffnen
- Dryrun ist nicht mehr sichtbar
- Speichern fragt nach Bestätigung
- Abbrechen schreibt nichts
- Bestätigen speichert
- Audit zeigt den Write
- Gamble-Tab lädt weiterhin

## Nächster sinnvoller Schritt

Nach bestätigtem Live-Test kann später geprüft werden, ob Actor Login / Actor Role aus der normalen Config-UI entfernt und durch das echte Dashboard-Session-/Rechtemodell ersetzt werden.
