# Loyalty Giveaways – Setup-Readiness

## Ziel

Ein Giveaway soll vorbereitet und gespeichert werden können, auch wenn noch nicht alle Pflichtdaten vorliegen. Gleichzeitig darf es nicht live geöffnet werden, solange es nicht vollständig ist.

## Ausgabe am Giveaway

Das Backend liefert pro Giveaway:

- `setupComplete` – true/false
- `setupState` – `complete` oder `incomplete`
- `canOpen` – true/false
- `setupIssues` – Liste konkreter fehlender Pflichtdaten

## Pflichtdaten

Allgemein:

- Titel vorhanden
- gültiger Modus
- Gewinneranzahl mindestens 1
- Max. Tickets/User mindestens 1
- Kosten nicht negativ
- mindestens ein gültiger Gewinn

Wheel-Modus:

- gebundenes Giveaway-Glücksrad vorhanden
- mindestens ein aktives, gültiges Rad-Feld vorhanden
- Feld hat Label und Gewicht > 0

Classic-Modus benötigt kein Glücksrad.

## Open-Guard

`POST /api/loyalty/giveaways/:giveawayUid/open` blockiert mit:

```text
giveaway_open_requires_complete_setup
```

wenn `setupComplete=false`.

## UX-Regel

- Speichern als Entwurf: erlaubt.
- Öffnen/Aktivieren: nur erlaubt, wenn `setupComplete=true`.
