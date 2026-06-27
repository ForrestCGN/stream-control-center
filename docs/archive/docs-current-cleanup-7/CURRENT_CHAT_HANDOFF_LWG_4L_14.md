# CURRENT CHAT HANDOFF – LWG-4L.14

## Ziel
Kontrollierte dauerhafte Aktivierung der vorbereiteten Loyalty-Chat-Commands.

## Codebasis
Keine Codeänderung. Aktueller Code bleibt:
- `STEP_LWG_4L_12`

## Aktivierbare Commands
- `!ticket`
- `!ticket <anzahl>`
- `!wheel`
- `!rad` als Alias von `!wheel`

## Bereits bestätigte Tests
- `!ticket` ohne Giveaway -> `ticket.no_active`
- kostenloses Giveaway -> Entry wird erstellt
- `!ticket 2` -> ticketCount=2
- Max-Limit -> blockt korrekt
- kostenpflichtiges Giveaway -> `ticket_cost_not_supported_yet`, kein Entry
- `!wheel` ohne Permission -> `wheel_no_permission`
- `!wheel` mit pending Permission -> Permission used, Winner wheel_completed, Giveaway finished

## Wichtig
- Keine Punktebuchung.
- Kostenpflichtige Giveaways bleiben blockiert.
- Keine Streamer.bot-Anbindung.
- Keine Channel-Points-Anbindung.
- Zentrales commands-System entscheidet `enabled=true/false`.

## Rollback
Beide Commands können jederzeit über `/api/commands/upsert` wieder auf `enabled=false` gesetzt werden.
