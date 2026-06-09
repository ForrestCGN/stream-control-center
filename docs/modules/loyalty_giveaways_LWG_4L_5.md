# Loyalty Giveaways - LWG-4L.5

## Zweck

Dieser Step macht die `!ticket`-Runtime bereit fuer kostenlose Giveaway-Teilnahmen, ohne einen zweiten Modul-Aktivschalter einzufuehren.

## Aktivierungsprinzip

Das zentrale `commands`-System bleibt Source of Truth:

- `command_definitions.enabled=false`: Chat ruft Modul nicht auf.
- `command_definitions.enabled=true`: Modul verarbeitet fachliche Regeln.

Im Modul gibt es keinen separaten `TICKET_RUNTIME_ACTIVE`-Schalter.

## Fachliche Guards

`!ticket` prueft:

1. Offenes Giveaway vorhanden?
2. Zentraler Command aktiv?
3. Ticketanzahl gueltig?
4. Giveaway kostenlos?
5. Max-Tickets pro User noch nicht erreicht?
6. Entry anlegen.

## Punktebuchung

Kostenpflichtige Tickets bleiben blockiert, bis Loyalty-Punktebuchung sauber angebunden ist.
