# Module Current – loyalty_giveaways

Stand: 2026-06-19

## Modulzweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Heute bestätigte Funktionen

### Giveaway Copy mit Bound-Wheel

- Dashboard-Kopieren erzeugt eine Giveaway-Kopie.
- Das gebundene Wheel wird auf die Kopie übertragen.
- Die Wheel-Felder werden auf das neue Bound-Wheel kopiert.
- Die Kopie ist unabhängig vom Original.

### Giveaway Flow

Bestätigter Testlauf:

```text
Draft → Open → Entries → Close → Draw → Waiting for Wheel → Wheel Claim → Wheel Completed
```

### Wheel-Integration

Bei einem Wheel-Giveaway:

- `draw` erzeugt einen Winner mit `wheelRequired=true`.
- Es wird eine `loyalty_giveaway_wheel_permissions`-Permission mit `status=pending` erzeugt.
- `POST /api/loyalty/giveaways/:giveawayUid/wheel/claim` startet einen Spin über `loyalty_games`.
- Permission wird `used`.
- Winner wird `wheel_completed`.
- Ergebnis wird am Winner gespeichert.
- Das gewonnene Bound-Wheel-Feld wird reduziert.

## Bestätigte Routen im aktuellen Ablauf

```text
GET  /api/loyalty/giveaways?limit=50
GET  /api/loyalty/giveaways/:giveawayUid
POST /api/loyalty/giveaways/:giveawayUid/open
POST /api/loyalty/giveaways/:giveawayUid/entries
POST /api/loyalty/giveaways/:giveawayUid/close
POST /api/loyalty/giveaways/:giveawayUid/draw
GET  /api/loyalty/giveaways/:giveawayUid/wheel/bound
GET  /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields
GET  /api/loyalty/giveaways/:giveawayUid/wheel/permissions
POST /api/loyalty/giveaways/:giveawayUid/wheel/claim
```

## Offene Punkte

- Ausschlussliste sauber implementieren.
- Finale Dashboard-Bedienung für Draw/Wheel/Claim prüfen.
- Test-Giveaways löschen/archivieren.
- Copy-Logik langfristig backendseitig absichern.
