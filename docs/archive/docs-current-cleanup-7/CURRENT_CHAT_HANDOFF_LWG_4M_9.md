# Current Chat Handoff – LWG-4M.9

## Aktueller Step
LWG-4M.9 – Bound-Wheel Field Foundation

## Dateien
Geaendert:
- `backend/modules/loyalty_giveaways.js`

Nicht geaendert:
- `htdocs/dashboard/modules/loyalty_games.js`
- `backend/modules/loyalty_games/wheel.js`

## Inhalt
LWG-4M.9 legt die Backend-Basis fuer echte Giveaway-gebundene Wheel-Felder.

Neue Tabelle:
- `loyalty_giveaway_bound_wheel_fields`

Neue APIs:
- `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields`
- `POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields`
- `PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid`
- `POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid/delete`

Erweitert:
- `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound` gibt jetzt `fieldCount` und `fields` zurueck.
- `getGiveaway(..., true)` enthaelt `boundWheelFields`.
- `counts()` enthaelt `boundWheelFields`.

## Design-Entscheidung
Presets bleiben zentrale Vorlagen.
Giveaway-Bound-Wheels bleiben an das Giveaway gekoppelt und heissen automatisch `<Giveaway-Titel> – Gluecksrad`.
Felder werden als Snapshot ins Giveaway-Rad kopiert und spaeter im Giveaway-Rad-Editor bearbeitbar.

## Nicht erledigt in diesem Step
- Dashboard-Editor noch nicht vorhanden.
- Runtime-Spin liest noch nicht aus Bound-Wheel-Feldern.

## StepDone
```powershell
.\stepdone.cmd "STEP LWG-4M.9 Bound-Wheel Field Foundation"
```
