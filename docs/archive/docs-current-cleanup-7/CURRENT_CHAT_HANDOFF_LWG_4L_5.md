# CURRENT CHAT HANDOFF - LWG-4L.5

Stand: 2026-06-09

## Aktueller Stand

LWG-4L.5 bereitet die fachliche Verarbeitung fuer kostenlose `!ticket`-Teilnahmen vor.
Der vorher geplante separate Runtime-Aktivschalter wurde verworfen. Die Aktivierung bleibt ausschliesslich Aufgabe des zentralen `commands`-Systems.

## Code-Stand

- `backend/modules/loyalty_giveaways.js`
- `MODULE_BUILD = STEP_LWG_4L_5`

## Verhalten

- `!ticket` ohne offenes Giveaway: `ticket.no_active` / `giveaway_no_active`
- `!ticket` bei offenem Giveaway aber zentralem Command `enabled=false`: `ticket.disabled` / `chat_commands_disabled`
- Ungueltige Ticketanzahl: `ticket.invalid_amount`
- Kostenpflichtiges Giveaway: `ticket.cost_not_supported_yet`
- Kostenloses Giveaway + zentraler Command aktiv: Entry wird ueber `createEntry(... source=chat_runtime)` erstellt

## Nicht geaendert

- Zentrale Commands bleiben `enabled=false`
- Keine Punktebuchung
- Keine Channel-Points-Anbindung
- Kein Streamer.bot
- Keine Wheel-Fairness-Aenderung

## Naechster moeglicher Schritt

LWG-4L.6: kontrollierte Aktivierung von `!ticket` im zentralen commands-System fuer kostenlose Giveaways planen oder vorbereiten.
