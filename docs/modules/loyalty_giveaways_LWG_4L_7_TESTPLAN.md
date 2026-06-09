# Loyalty Giveaways – LWG-4L.7 Testplan

## Zweck
Dieser Schritt validiert die vorbereitete kostenlose Ticket-Teilnahme, ohne die Chat-Commands dauerhaft zu aktivieren.

## Relevante Routen
- POST /api/loyalty/giveaways
- POST /api/loyalty/giveaways/:giveawayUid/open
- GET /api/loyalty/giveaways/:giveawayUid/entries
- POST /api/commands/upsert
- POST /api/commands/execute

## Nicht enthalten
- Keine Codeänderung
- Keine Punktebuchung
- Keine Channel-Points-Anbindung
- Keine Wheel-Aktivierung
- Keine dauerhafte Command-Aktivierung
