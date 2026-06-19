# Module Current – loyalty_giveaways / Giveaway-bound Wheel

Stand: 2026-06-19

## Modulzweck

`loyalty_giveaways` verwaltet Loyalty-Giveaways, Entries, Gewinner, Chat-/Command-Runtime und gebundene Giveaway-Glücksräder.

## Heute bestätigte Funktionen

### Giveaway Copy mit Bound-Wheel

- Dashboard-Kopieren erzeugt eine Giveaway-Kopie.
- Das gebundene Wheel wird auf die Kopie übertragen.
- Die Wheel-Felder werden auf das neue Bound-Wheel kopiert.
- Die Kopie ist unabhängig vom Original.
- Die Test-Kopie hatte 8 Felder und war startbereit.

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

## Overlay-/Runtime-Stand

Aktueller bestätigter Overlay-Stand:

```text
LWG-WHEEL-TEXT-RADIAL-5
```

Bestätigt:

- Wheel-Overlay initial unsichtbar.
- Wheel-Spin blendet Overlay ein.
- Ergebnis wird angezeigt.
- Overlay blendet automatisch wieder aus.
- Winner-/Finale-Overlay bleibt beim Wheel-Spin aus.
- Segmenttexte sind radial mit Segmentrichtung ausgerichtet.
- Lange Titel sind akzeptabel.
- `€` wird korrekt angezeigt.
- Gewinnerbanner zeigt keinen Subtext wie `Steam Key` oder `Guthaben`.

## Bestätigte Routen im aktuellen Ablauf

```text
GET  /api/loyalty/giveaways/status
GET  /api/loyalty/games/status
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
POST /api/loyalty/games/wheel/spin
```

Nicht bestätigt/verfügbar:

```text
POST /api/communication-bus/publish
```

Diese Route existierte im Test nicht. Für Reset-/Hide-Tests braucht es eine echte vorhandene Diagnose-Route oder eine neue geschützte Testfunktion.

## Feldanzahl-Regel – beschlossen, noch nicht umgesetzt

Gewünschtes Verhalten für Giveaway-bound Wheels:

```text
2+ verfügbare Gewinne  → normaler Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → kein normaler Spin, letzter Gewinn direkt vergeben / separates Letzter-Gewinn-Overlay
0 verfügbare Gewinne   → Claim/Spin blockieren
```

Aktuelle Beobachtung:

```text
Bound-Wheel count/fieldCount = 8
Verfügbare Felder nach quantityRemaining > 0 = 7
Spin-Metadata: fieldsCount = 7
Spin-Metadata: visualFieldsCount = 12
```

Die 12 sichtbaren Felder kommen vermutlich aus `minVisibleSlots` im Backend-Default/Fallback. In der vom Nutzer hochgeladenen `loyalty_games.json` steht kein `minVisibleSlots`.

## Offene Punkte

- Giveaway-bound Wheel darf nicht mehr auf 12 sichtbare Felder auffüllen.
- Single-Remaining-Gewinn-Regel implementieren.
- Ausschlussliste sauber implementieren.
- Finale Dashboard-Bedienung für Draw/Wheel/Claim prüfen.
- Test-Giveaways löschen/archivieren.
- Copy-Logik langfristig backendseitig absichern.
- Reset-/Hide-Test für Wheel-Overlay dashboard-/diagnosefähig machen.
