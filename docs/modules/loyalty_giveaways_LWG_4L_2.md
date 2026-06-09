# Modulnotiz: loyalty_giveaways - LWG-4L.2

## Zweck

LWG-4L.2 bereitet die Anbindung der Loyalty-Giveaway-Commands an das zentrale Node-Command-System vor.

## Neue zentrale Commands

Tabelle: `command_definitions`

- `!ticket`
  - `module_key = loyalty_giveaways`
  - `action_key = chat_command_runtime`
  - `target_method = POST`
  - `target_url = /api/loyalty/giveaways/runtime/chat-command`
  - `enabled = false`

- `!wheel`
  - Alias: `rad`
  - `module_key = loyalty_giveaways`
  - `action_key = chat_command_runtime`
  - `target_method = POST`
  - `target_url = /api/loyalty/giveaways/runtime/chat-command`
  - `enabled = false`

## Diagnose

Neu:

- `GET /api/loyalty/giveaways/central-commands`
- `diagnostics.centralCommands`
- `counts.centralCommandDefinitions`

## Nicht enthalten

- Keine Aktivierung der Commands.
- Keine Punktebuchung.
- Keine Channel-Point-Anbindung.
- Keine Twitch-Ausfuehrung durch Streamer.bot.
- Kein `!join`.
