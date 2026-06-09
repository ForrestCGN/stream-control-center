# Loyalty Giveaways – LWG-4M.2

## Backend Close + Draw Guard

### Neue/angepasste Routen

- `POST /api/loyalty/giveaways/:giveawayUid/close`
- `POST /api/loyalty/giveaways/:giveawayUid/close-entries`

Beide schließen ein offenes Giveaway auf:
- `closed_for_entries`

### Close Response

Close liefert einen Chattext zurück:

```json
{
  "messageKey": "giveaway.closed",
  "message": "...",
  "chatMessage": "...",
  "shouldSendChat": true
}
```

Das Dashboard oder ein Mod-Command kann diesen Text in den Chat senden.

### Draw Guard

Vor LWG-4M.2 war Draw aus `open` und `closed_for_entries` erlaubt.

Ab LWG-4M.2 ist Draw aus `open` blockiert:

```json
{
  "error": "giveaway_draw_requires_closed_entries",
  "status": "open",
  "requiredStatus": "closed_for_entries",
  "messageKey": "giveaway.draw_not_closed"
}
```

Draw ist nur aus `closed_for_entries` erlaubt.

### Textkeys

Neu:
- `giveaway.closed`
- `giveaway.draw_not_closed`

Kategorie:
- `chat_giveaway`
