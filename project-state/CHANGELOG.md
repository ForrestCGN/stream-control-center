# Changelog

## VIP30-STEP3 - Channelpoints Reward Link 40000

- `backend/modules/vip30.js` auf Version `0.3.0` gehoben.
- Modul-Build auf `step3-channelpoints-reward-link` gesetzt.
- Reward-Kosten von 50.000 auf **40.000 Kanalpunkte** geaendert.
- `config/vip30.json` um `channelpoints`-Konfiguration erweitert.
- Neue Statusroute: `GET /api/vip30/channelpoints/reward/status`.
- Neue lokale Ensure-Route: `POST /api/vip30/channelpoints/reward/ensure?confirm=YES`.
- Lokale Kategorie `vip` wird bei Bedarf angelegt.
- Lokaler Reward `vip30` wird in `channelpoints_rewards` angelegt/aktualisiert.
- `twitch_is_enabled` wird in STEP3 absichtlich auf `0` gesetzt.
- Bus-Event `vip30.channelpoints / reward.ensured` ergaenzt.
- Dashboard-/DB-Logging ueber `vip30_log` fuer `channelpoints_reward_ensured` ergaenzt.
- Keine Twitch-Schreibaktion, kein VIP-Grant, kein Fulfill/Cancel.
