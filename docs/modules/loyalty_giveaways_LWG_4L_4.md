# Loyalty Giveaways - LWG-4L.4

## Zweck

Ticket-Runtime-Guard fuer den Fall, dass kein Giveaway offen ist.

## Verhalten

`handleTicketCommandRuntime()` fuehrt jetzt folgende Reihenfolge aus:

1. Command-Definition laden.
2. Offenes Giveaway suchen.
3. Wenn kein offenes Giveaway existiert: `ticket.no_active` / `giveaway_no_active` zurueckgeben.
4. Wenn Giveaway offen ist, aber Commands noch deaktiviert sind: `ticket.disabled` / `chat_commands_disabled` zurueckgeben.

## Bewusst nicht enthalten

- Keine Aktivierung von `!ticket`.
- Keine Aenderung an `!wheel`/`!rad`.
- Keine Punktebuchung.
- Keine automatisierte Twitch-Chat-Ausfuehrung.
- Keine produktive DB-Ersetzung.
