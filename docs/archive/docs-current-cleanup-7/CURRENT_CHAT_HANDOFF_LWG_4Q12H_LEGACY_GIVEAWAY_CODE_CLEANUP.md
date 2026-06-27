# CURRENT CHAT HANDOFF – LWG-4Q.12H Legacy Giveaway Code Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Games / Giveaways Cleanup

## Ziel

Nicht mehr erreichbarer Legacy-Giveaway-Code wurde aus `loyalty_games.js` entfernt.

Das neue Zielsystem bleibt:

```text
Giveaways / Wheel-Editor / Live-Steuerung → loyalty_giveaways.js
Games / Glücksrad / Presets / Gamble / Config → loyalty_games.js
```

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_games.js`

## Entfernt aus `loyalty_games.js`

```text
alte Inline-Giveaway-Ansicht
alter Inline-Giveaway-Wheel-Editor
alte Giveaway-Formularlogik
alte Entry-/Winner-/Claim-Bedienlogik
alte Event-Bindings für Legacy-Giveaway-Attribute
alte Giveaway-spezifische API-/State-Felder im Games-Modul
```

## Bewusst erhalten

```text
renderGiveawaysRedirect()
renderGiveawayWheelEditorRedirect()
openGiveawayEditor()
openGiveawayWheelEditor()
setTab('giveaways')
```

Diese Brücken leiten weiterhin sauber ins neue `loyalty_giveaways.js`-Modul.

## Nicht geändert

- kein Backend
- keine Datenbank
- keine API
- keine Commands
- kein `loyalty_giveaways.js`
- keine Overlays
- keine Giveaway-Engine
- keine Wheel-/Bound-Wheel-Endpunkte

## Tests

Beim Erstellen der ZIP erfolgreich:

```text
node -c htdocs/dashboard/modules/loyalty_games.js
```

Nach dem Entpacken zusätzlich testen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

```text
/dashboard lädt
Loyalty → Übersicht funktioniert
Loyalty → Glücksrad funktioniert
Loyalty → Presets funktioniert
Loyalty → Gamble funktioniert
Loyalty → Config funktioniert
Loyalty → Giveaways öffnet neues Giveaway-Control
Glücksrad-Giveaway → Glücksrad erstellen/bearbeiten läuft über loyalty_giveaways.js
Keine alte Inline-Giveaway-Ansicht aus loyalty_games.js
Keine Console-Fehler
```

## StepDone

```powershell
.\stepdone.cmd "LWG-4Q.12H Remove Legacy Giveaway Code From Loyalty Games"
```

## Nächster sinnvoller Schritt

LWG-4Q.12I – Abschlussprüfung Giveaways-Routing und Doku-Refresh.
