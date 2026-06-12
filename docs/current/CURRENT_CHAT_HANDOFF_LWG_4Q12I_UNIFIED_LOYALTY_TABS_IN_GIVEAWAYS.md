# CURRENT CHAT HANDOFF – LWG-4Q.12I Unified Loyalty Tabs In Giveaways

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Giveaways / UI-Navigation

## Problem

Nach dem Wechsel in `Loyalty → Giveaways` wurde das neue `loyalty_giveaways.js`-Modul korrekt geöffnet, aber die Tab-Leiste war nicht identisch mit der Loyalty-Games-Tab-Leiste.

In Giveaways fehlten dadurch:

```text
Gamble
Config
```

Das wirkte so, als würden Tabs verschwinden.

## Änderung

In `htdocs/dashboard/modules/loyalty_giveaways.js` wurde `renderTabs()` angeglichen.

Die Giveaways-Tab-Leiste enthält jetzt wieder:

```text
Übersicht
Glücksrad
Presets
Giveaways
Gamble
Config
Chat/Commands
Verlauf
Hinweise
```

## Verhalten

- `Giveaways` bleibt im neuen Giveaway-Control aktiv.
- Alle anderen Tabs leiten über `openLoyaltyGamesTab(...)` zurück in `loyalty_games.js`.
- `Gamble` und `Config` sind dadurch auch aus dem Giveaways-Control wieder direkt erreichbar.

## Nicht geändert

- kein Backend
- keine Datenbank
- keine API
- keine Commands
- kein `loyalty_games.js`
- keine Overlays
- keine Giveaway-Engine

## Tests

Beim Erstellen der ZIP erfolgreich:

```text
node -c htdocs/dashboard/modules/loyalty_giveaways.js
```

Nach dem Entpacken testen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Browser-Test:

```text
/dashboard
Loyalty → Giveaways

Erwartung:
- Tab-Leiste zeigt wieder Gamble und Config
- Giveaways ist aktiv markiert
- Klick auf Gamble öffnet Loyalty Games → Gamble
- Klick auf Config öffnet Loyalty Games → Config
- Klick auf Übersicht/Glücksrad/Presets/Chat/Verlauf/Hinweise funktioniert wie vorher
- Keine Console-Fehler
```

## StepDone

```powershell
.\stepdone.cmd "LWG-4Q.12I Unified Loyalty Tabs In Giveaways"
```
