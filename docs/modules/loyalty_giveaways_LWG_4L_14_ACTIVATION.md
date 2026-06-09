# Loyalty Giveaways – LWG-4L.14 Aktivierungsplan

Dieser Schritt dokumentiert die kontrollierte Aktivierung von:
- `!ticket`
- `!ticket <anzahl>`
- `!wheel`
- `!rad` als Alias

## Codebasis
Keine Codeänderung. Codebasis bleibt `STEP_LWG_4L_12`.

## Entscheidungsprinzip
Das zentrale `commands`-System ist Source of Truth für Aktivierung:
- `enabled=false` -> Chat-Command wird nicht ans Modul gegeben.
- `enabled=true` -> Modul verarbeitet fachliche Regeln.

## Fachliche Guards im Modul
- kein Giveaway -> `giveaway_no_active`
- kostenpflichtige Tickets ohne Punktebuchung -> `ticket_cost_not_supported_yet`
- Ticket-Limit -> `giveaway_max_tickets_reached`
- keine Wheel-Permission -> `wheel_no_permission`
- pending Wheel-Permission -> Wheel-Claim
