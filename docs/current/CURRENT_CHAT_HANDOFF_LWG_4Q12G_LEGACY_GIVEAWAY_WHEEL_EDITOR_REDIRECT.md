# CURRENT CHAT HANDOFF – LWG-4Q.12G Legacy Giveaway Wheel Editor Redirect

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Giveaways / Legacy-Cleanup

## Ziel

Der letzte alte Einstieg in den Legacy-Giveaway-Wheel-Editor innerhalb von `loyalty_games.js` wurde entschärft.

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_games.js`

## Änderung

In `renderActiveTab()` wurde der alte Pfad

```text
state.activeTab === 'giveaway_wheel_editor' → renderGiveawayWheelEditor()
```

ersetzt durch:

```text
state.activeTab === 'giveaway_wheel_editor' → renderGiveawayWheelEditorRedirect()
```

`renderGiveawayWheelEditorRedirect()` zeigt nur noch einen Hinweis und einen Button ins neue Giveaway-Control.

## Wichtig

Die alten Funktionen wurden in diesem Step bewusst noch nicht gelöscht.

Noch vorhanden, aber nicht mehr über den normalen Tab-Pfad gerendert:

```text
renderGiveawayWheelEditor()
createGiveawayBoundWheel()
ensureGiveawayBoundWheel()
handleCreateGiveawayWheelField()
handleUpdateGiveawayWheelField()
deleteGiveawayWheelField()
```

Diese können in einem späteren separaten Cleanup-Step geprüft und entfernt werden, wenn sicher ist, dass kein Einstieg mehr darauf zeigt.

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

Syntaxcheck:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

```text
/dashboard
Loyalty → Giveaways
neues Giveaway-Control öffnet

Glücksrad-Giveaway → Glücksrad erstellen/bearbeiten
neuer Giveaway-Wheel-Editor aus loyalty_giveaways.js öffnet

Keine alte Inline-Wheel-Editor-Ansicht aus loyalty_games.js
Keine Console-Fehler
```

## StepDone

Nach erfolgreichem Test:

```powershell
.\stepdone.cmd "LWG-4Q.12G Redirect Legacy Giveaway Wheel Editor"
```

## Nächster sinnvoller Schritt

LWG-4Q.12H – Legacy-Giveaway-Funktionen in `loyalty_games.js` erneut prüfen und dann gezielt entfernen, wenn kein aktiver Einstieg mehr existiert.
