# CURRENT_STATUS – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Stand

```text
LWG-4Q.12J – Final Giveaways UI Cleanup Docs
```

## Zusammenfassung

Der Loyalty-/Giveaways-Dashboard-Stand ist nach dem 4Q.12-Cleanup wieder sauber getrennt:

```text
loyalty_games.js      = Games, Glücksrad, Presets, Gamble, Config, Chat/Commands, Verlauf, Hinweise
loyalty_giveaways.js  = Giveaways, Wheel-Editor, Live-Steuerung, Details, Bearbeiten, Hard-Delete
```

## Bestätigter UI-Stand

```text
Loyalty → Giveaways öffnet das neue Giveaway-Control.
Die Tab-Leiste bleibt vollständig sichtbar.
Gamble und Config sind auch im Giveaways-Modul wieder erreichbar.
Giveaways bleibt im Giveaways-Control aktiv markiert.
Andere Tabs leiten zurück zu loyalty_games.js.
```

Vollständige Loyalty-Tab-Leiste:

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

## Legacy-Cleanup

Aus `loyalty_games.js` wurde nicht mehr erreichbarer Legacy-Giveaway-Code entfernt:

```text
alte Inline-Giveaway-Ansicht
alter Inline-Giveaway-Wheel-Editor
alte Giveaway-Formularlogik
alte Entry-/Winner-/Claim-Bedienlogik
alte Event-Bindings für Legacy-Giveaway-Attribute
alte Giveaway-spezifische API-/State-Felder im Games-Modul
```

Bewusst erhaltene Brücken:

```text
renderGiveawaysRedirect()
renderGiveawayWheelEditorRedirect()
openGiveawayEditor()
openGiveawayWheelEditor()
setTab('giveaways')
```

Diese Brücken leiten weiterhin sauber ins neue `loyalty_giveaways.js`-Modul.

## Bestätigte Teilsteps

```text
LWG-4Q.12A – Classic-Draft-Giveaway Formular geprüft
LWG-4Q.12B – Wheel-Draft ohne Bound-Wheel geprüft
LWG-4Q.12C – Wheel-Draft mit Bound-Wheel geprüft
LWG-4Q.12D – Routing Giveaways geprüft
LWG-4Q.12E – alte Giveaway-/Bound-Wheel-Reste in loyalty_games.js bewertet
LWG-4Q.12F – Legacy-Giveaways-Tab geprüft
LWG-4Q.12G – Legacy Giveaway Wheel Editor auf neues Control umgeleitet
LWG-4Q.12H – nicht mehr erreichbaren Legacy-Giveaway-Code entfernt
LWG-4Q.12I – einheitliche Loyalty-Tabs in Giveaways wiederhergestellt
LWG-4Q.12J – Abschluss-Doku
```

## Aktive Dateien

```text
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/app.js
htdocs/dashboard/index.html
```

## Nicht geändert

```text
Backend
Datenbank
APIs
Commands
Overlays
Giveaway-Engine
Wheel-/Bound-Wheel-Endpunkte
```

## Pflicht-Tests nach weiteren Änderungen

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```

Browser-Test:

```text
/dashboard
Loyalty → Übersicht
Loyalty → Glücksrad
Loyalty → Presets
Loyalty → Giveaways
Loyalty → Gamble
Loyalty → Config
Loyalty → Chat/Commands
Loyalty → Verlauf
Loyalty → Hinweise
```

## Wichtige Regeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite-Datei ersetzen oder überschreiben.
Keine STEP232-/Standalone-Gamble-Struktur wieder einführen.
Keine alte Inline-Giveaway-Seite in loyalty_games.js reaktivieren.
Giveaways bleiben im neuen loyalty_giveaways.js.
```
