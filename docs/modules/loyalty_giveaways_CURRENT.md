# Modul-Doku – Loyalty Giveaways / Glücksrad aktueller Stand

## Zweck
Das Modul verwaltet Loyalty-Giveaways, Tickets, Draws und die Kopplung an das Glücksrad.

## Aktueller Stand
Bestätigter Build:
```text
STEP_LWG_4M_4
```

## Kernfunktionen

### Giveaways
- Erstellen
- Öffnen
- Schließen
- Entries/Tickets
- Draw
- Cancel/Delete
- Wheel-Permission für Gewinner

### Close/Draw
- Draw aus `open` ist blockiert.
- Close setzt `closed_for_entries`.
- Draw ist danach erlaubt.

### Chatdispatch
- Close liefert Chattext.
- Close versucht Twitch Presence Chatdispatch.
- Wenn Twitch Presence nicht verbunden ist, bleibt Close erfolgreich.

### Giveaway-bound Wheels
- Wheel-Giveaways erzeugen Bound Wheel.
- Bound Wheel wird per `wheelSnapshotUid` am Giveaway referenziert.
- Bound Wheel verweist per `sourcePresetUid` auf globale Vorlage.
- Bound Wheel hat `scope=giveaway`.

## API-Auszug

### Close
```text
POST /api/loyalty/giveaways/:giveawayUid/close
POST /api/loyalty/giveaways/:giveawayUid/close-entries
```

### Draw
```text
POST /api/loyalty/giveaways/:giveawayUid/draw
```

### Bound Wheel
```text
GET /api/loyalty/giveaways/:giveawayUid/wheel/bound
PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound
```

## Offene technische Entscheidung für LWG-4M.5
- Bound-Wheel-Status aktivieren.
- Claim/Spin exakt auf Bound-Wheel umstellen.
- Globale Wheel-Nutzung weiterhin getrennt halten.
