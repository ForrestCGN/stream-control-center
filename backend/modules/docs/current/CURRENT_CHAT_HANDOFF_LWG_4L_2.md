# CURRENT CHAT HANDOFF - LWG-4L.2

Stand: 2026-06-09

## Abgeschlossen

STEP LWG-4L.2 - Loyalty zentrale Commands vorbereitet, weiterhin deaktiviert.

## Technischer Stand

- `backend/modules/loyalty_giveaways.js`
- `MODULE_BUILD = STEP_LWG_4L_2`
- Runtime-Bruecke aus LWG-4L.1 bleibt vorhanden:
  - `POST /api/loyalty/giveaways/runtime/chat-command`
  - `POST /api/loyalty/giveaways/runtime/command`
- Neue zentrale Command-Vorbereitung:
  - `GET /api/loyalty/giveaways/central-commands`
  - Seed in `command_definitions` fuer `ticket` und `wheel` mit Alias `rad`
  - `enabled=false`
  - `CHAT_COMMANDS_ACTIVE=false`

## Wichtig

- Keine echte Chat-Aktivierung.
- Keine Punktebuchung.
- Keine Channel-Point-Anbindung.
- Kein Streamer.bot.
- Bestehende zentrale Command-Eintraege werden nicht ueberschrieben.

## Naechster sinnvoller Schritt

LWG-4L.3 planen: Aktivierungslogik/Schalter fuer Commands, aber erst nach explizitem Go.
Dabei zuerst klaeren:
- Soll Aktivierung ueber Dashboard/DB-Flags laufen?
- Sollen `enabled` im zentralen Command-System und `CHAT_COMMANDS_ACTIVE` getrennt bleiben?
- Wie wird Chat-Ausgabe vom Command-System behandelt?
- Punktebuchung erst spaeter separat.
