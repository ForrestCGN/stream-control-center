# Loyalty Giveaways – LWG-4L.6 Command-Aktivierungstest

Dieser Step verändert keinen Code.

Die fachliche Runtime befindet sich im Modulstand LWG-4L.5. Das zentrale Command-System entscheidet, ob `!ticket` an das Modul weitergegeben wird. Im Modul existiert bewusst kein zusätzlicher Aktivschalter.

## Source of Truth

- Aktivierung: `command_definitions.enabled` im zentralen `commands`-System
- Fachliche Regeln: `loyalty_giveaways.handleTicketCommandRuntime`

## Testumfang

- `!ticket` temporär `enabled=true`
- `/api/commands/test` prüft Payload
- `/api/commands/execute` prüft echte Weiterleitung
- Ohne offenes Giveaway: `giveaway_no_active`
- Danach Rollback auf `enabled=false`
