# Current Chat Handoff – STEP235H Config UX Standard

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center
Bereich: Dashboard / Loyalty

## Zweck

STEP235H vereinheitlicht den UX-Standard für Loyalty-Config-Bereiche im Dashboard.
Gamble bleibt der erste aktiv angebundene Config-Bereich. Weitere Bereiche werden vorbereitet und sollen später nach demselben Standard angebunden werden.

## Änderungen

Geändert:

- `htdocs/dashboard/modules/loyalty_games.js`

Ergänzt/angepasst:

- generischer Config-Ergebnis-Renderer `renderConfigResultBox(...)`
- Gamble nutzt weiter denselben Ergebnisfluss über `renderGambleResultBox(...)`
- neuer Hinweisbereich `Config-UX-Standard`
- vorbereitete Placeholder für kommende Config-Bereiche
- keine Rohdaten-/JSON-Ausgabe als Standard-UI
- Speichern bleibt mit Bestätigungsdialog
- Erfolg/Fehler bleiben verständlich dargestellt

## Bewusst nicht geändert

- Kein Backend
- Keine Datenbank
- Keine API
- Keine Commands
- Keine Gamble-Engine
- Keine Giveaways-Logik
- Keine Loyalty-Core-Logik
- Keine Standalone-Gamble-Dateien

## Zielstandard für weitere Config-Bereiche

Künftige Config-Bereiche sollen im normalen Dashboard:

- keine JSON-/Rohdaten-Blöcke anzeigen
- Speichern mit Bestätigungsdialog nutzen
- Erfolg verständlich zusammenfassen
- Fehler klar anzeigen
- Audit/Logs weiterhin nutzen
- technische Details höchstens später im Admin-/Debug-Modus zeigen

## Tests

Empfohlen nach Einspielen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard`
- Loyalty → Config
- Gamble bleibt aktiv angebunden
- Config-UX-Standard wird angezeigt
- Gamble-Speichern fragt weiter nach Bestätigung
- Erfolg/Fehler bleiben ohne JSON-Dump verständlich
- Gamble/Glücksrad/Presets/Giveaways laden weiter

## Nächster sinnvoller Schritt

STEP235I: Actor-/Rollenfelder im Config-Tab prüfen und später durch echte Session-/Rechteinformationen ersetzen oder aus der normalen UI entfernen.
