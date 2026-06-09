# Current Chat Handoff - LWG-4L.4

Stand: 2026-06-09

## Ergebnis

LWG-4L.4 bereitet die naechste Sicherheitslogik fuer Loyalty-Giveaway-Chatcommands vor.

`!ticket` prueft in der Runtime nun zuerst, ob ein offenes Giveaway existiert. Wenn kein Giveaway offen ist, wird eine passende Chatmeldung aus dem bestehenden Textkey `ticket.no_active` geliefert.

## Wichtig

- Keine Command-Aktivierung.
- `CHAT_COMMANDS_ACTIVE=false` bleibt bestehen.
- Zentrale Command-Eintraege bleiben `enabled=false`.
- Keine Punktebuchung.
- Keine Twitch-Command-Ausfuehrung.
- Kein Streamer.bot.

## Erwarteter Test ohne offenes Giveaway

`POST /api/loyalty/giveaways/runtime/chat-command` mit `command=ticket` liefert:

- `handled=True`
- `commandsActive=False`
- `active=False`
- `error=giveaway_no_active`
- `messageKey=ticket.no_active`

## Naechster Schritt

Danach kann geplant werden, wie sich `!ticket` bei offenem kostenlosen Giveaway verhalten soll, ohne Punktebuchung zu aktivieren.
