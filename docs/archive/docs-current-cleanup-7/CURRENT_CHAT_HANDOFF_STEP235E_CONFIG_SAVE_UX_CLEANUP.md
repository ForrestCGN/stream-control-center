# Current Chat Handoff – STEP235E Config Save UX Cleanup

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center
Bereich: Dashboard / Loyalty / Gamble Config

## Ziel

STEP235E bereinigt den Speichern-Flow im Loyalty-Config-Tab für Gamble.
Die sichtbare Checkbox `Write bestätigen` wurde entfernt. Stattdessen fragt die UI beim Speichern per Bestätigungsdialog nach, bevor ein echter Write ausgeführt wird.

## Geänderte Dateien

- `htdocs/dashboard/modules/loyalty_games.js`

## Nicht geändert

- Kein Backend-Code
- Keine Datenbank
- Keine API-Routen
- Keine Commands
- Keine Gamble-Engine
- Kein Loyalty-Core
- Keine Giveaways
- Keine Overlays
- Keine Standalone-Gamble-Dateien

## Verhalten

- Dryrun schreibt weiterhin nicht.
- Speichern zeigt vor dem echten Write einen Bestätigungsdialog.
- Wird der Dialog abgebrochen, wird kein Write ausgeführt.
- Wird bestätigt, sendet die UI weiterhin `confirmWrite=true` an die bestehende API.
- Actor Login und Actor Role bleiben vorerst erhalten, bis das echte Dashboard-Session-/Rechtemodell final eingebunden ist.
- Audit bleibt unverändert.

## Tests

Empfohlen nach Einspielen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard` öffnen
- Loyalty → Config → Gamble
- Checkbox `Write bestätigen` ist nicht mehr sichtbar
- Dryrun funktioniert
- Speichern fragt nach Bestätigung
- Abbrechen schreibt nichts
- Bestätigen speichert über bestehende API
- Audit zeigt den Write
- Gamble-Tab bleibt funktionsfähig

## Nächster sinnvoller Schritt

Nach erfolgreichem Live-Test kann die Standalone-Gamble-Seite später bereinigt werden, aber erst wenn der Gamble-Tab und der Config-Tab vollständig stabil bestätigt sind.
