# CURRENT CHAT HANDOFF – STEP235R Gamble Cooldown UX Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Config / Gamble

## Ziel

Die Cooldown-Felder im Gamble-Config-Tab wurden für normale Streamer-Nutzung verständlicher gemacht.

Backend/API/DB bleiben unverändert. Intern werden weiterhin Millisekunden gesendet.

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_games.js`

## Änderung

Neue Frontend-Helper:

```text
msToSecondsInput(value)
secondsInputToMs(value)
```

UI-Labels geändert:

```text
Engine User-CD ms              → Gamble-Cooldown pro User (Sek.)
Engine Global-CD ms            → Gamble-Cooldown global (Sek.)
Command User-CD ms             → Command-Cooldown pro User (Sek.)
Max-Einsatz                    → Maximaleinsatz
Letztes Config-Ergebnis        → Letztes Speicher-Ergebnis
```

## Verhalten

Anzeige im Dashboard:

```text
60
```

Bedeutet:

```text
60 Sekunden
```

Beim Speichern wird intern an das Backend gesendet:

```text
60000 ms
```

## Nicht geändert

- kein Backend
- keine Datenbank
- keine API
- keine Commands
- keine Gamble-Engine
- kein Audit-System
- keine Rechte-/Session-Logik
- keine Giveaways
- kein Loyalty-Core
- keine Overlays

## Tests

Syntaxcheck:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

```text
/dashboard
Loyalty → Config → Gamble
Cooldowns werden als Sekunden angezeigt
60 Sekunden speichern ergibt intern 60000 ms
Speichern fragt weiter nach Bestätigung
Audit funktioniert
keine Console-Fehler
```

## StepDone

Nach erfolgreichem Test:

```powershell
.\stepdone.cmd "STEP235R Gamble Cooldown UX Cleanup"
```

## Risiko

Niedrig bis mittel. Backend bleibt unverändert, aber die UI rechnet Sekunden in Millisekunden um. Besonders prüfen: 0 Sekunden, 60 Sekunden, 300 Sekunden.
