# Current Chat Handoff – LWG-4Q.12Q / Giveaway Wheel Editor UI Cleanup

Stand: 2026-06-12
Projekt: ForrestCGN / stream-control-center

## Zweck

Kleine UI-Aufräumung für den Giveaway-gebundenen Glücksrad-Editor im neuen Giveaway-Control.

## Geändert

- Neues CSS-Override ergänzt:
  - `htdocs/dashboard/modules/loyalty_giveaways_wheel_editor_cleanup.css`
- `htdocs/dashboard/index.html` lädt dieses CSS nach `loyalty_giveaways_cleanup.css`.
- Modal-Scroll für den Glücksrad-Editor repariert.
- Standardansicht im Glücksrad-Editor entschlackt:
  - `Gewicht` ausgeblendet
  - `Gesamtmenge` ausgeblendet
  - `Aktiv`-Checkbox ausgeblendet
  - `Reihenfolge` bei bestehenden Feldern ausgeblendet

## Wichtig

Die Funktionalität wurde nicht entfernt.
Die ausgeblendeten Inputs bleiben im DOM und senden weiterhin ihre vorhandenen/default Werte:

- `weight = 1` bei neuen Feldern
- `quantityTotal = 1` bei neuen Feldern
- neue Felder bleiben aktiv
- bestehende Werte bleiben beim Speichern erhalten

## Nicht geändert

- Kein Backend-Code
- Keine Datenbank
- Keine Giveaway-Logik
- Keine Wheel-/Reward-Logik
- Keine Gamble-Logik
- Keine Commands

## Tests

Empfohlen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```

Manuell prüfen:

- Dashboard → Loyalty → Giveaways
- Glücksrad-Giveaway öffnen
- Glücksrad bearbeiten
- Modal ist scrollbar
- Feld hinzufügen zeigt nur noch Label, Subtext, Reward-Typ, Reward-Wert
- Bestehendes Feld speichern funktioniert weiterhin

## Nächste offene Planpunkte

- Zentrale Configs sauber in den Config-Tab bündeln.
- Text-Configs in eigenen Texte-Tab mit Modul-Dropdown auslagern.
- Echte Gamble-Langzeitstatistik per Backend-API planen.
