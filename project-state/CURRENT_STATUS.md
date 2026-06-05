# Current Status

## VIP30-STEP4 DB-/Dashboard-Config

VIP30 ist auf Stand `0.4.0` vorbereitet.

Bestätigte Basis aus STEP3:

- Reward-Key `vip30`
- Titel `30 Tage VIP`
- Kosten `40000`
- Kategorie `vip`
- Action `vip30.redeem`
- lokaler Channelpoints-Reward verknüpft
- Twitch-Live-Aktionen deaktiviert

Neu in STEP4:

- Tabelle `vip30_settings`
- `config/vip30.json` nur noch Seed/Fallback
- API `GET /api/vip30/settings`
- API `POST /api/vip30/settings/save`
- Status enthält Settings-Block für Dashboard

Keine Twitch-Schreibaktion, kein VIP-Grant, kein Fulfill/Cancel.
