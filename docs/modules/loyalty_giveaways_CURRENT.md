# Modul-Doku – Loyalty Giveaways / Glücksrad aktueller Stand

## Zweck
Das Modul verwaltet Loyalty-Giveaways, Tickets, Draws und die Kopplung an das Glücksrad.

## Aktueller Stand

```text
STEP_LWG_4M_5
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
- Wheel-Giveaways erzeugen Bound-Wheel.
- Bound-Wheel wird per `wheelSnapshotUid` am Giveaway referenziert.
- Bound-Wheel verweist per `sourcePresetUid` auf die globale Vorlage.
- Bound-Wheel hat `scope=giveaway`.
- Beim Öffnen eines Wheel-Giveaways wird Bound-Wheel `active` und `locked=true`.
- Draw und Claim verlangen ein aktives Bound-Wheel.
- Permission und Spin speichern Bound-Wheel-Kontext.

## API-Auszug

```text
POST /api/loyalty/giveaways/:giveawayUid/open
POST /api/loyalty/giveaways/:giveawayUid/close
POST /api/loyalty/giveaways/:giveawayUid/draw
GET  /api/loyalty/giveaways/:giveawayUid/wheel/bound
PUT  /api/loyalty/giveaways/:giveawayUid/wheel/bound
POST /api/loyalty/giveaways/:giveawayUid/wheel/claim
```

## Offener Architekturpunkt

Der echte Field-Snapshot für Bound-Wheels ist noch nicht separat umgesetzt. Aktuell nutzt der Spin weiterhin `sourcePresetUid` als Feldbasis, aber mit eindeutigem Giveaway-/Bound-Wheel-Kontext.
