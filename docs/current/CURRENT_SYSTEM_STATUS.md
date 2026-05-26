# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP492

## Stream-Control-Center

Aktueller Schwerpunkt: Kanalpunkte-System als neues Fachmodul auf Communication Bus, zentraler SQLite-Schicht und bestehendem Media-System.

## Kanalpunkte

STEP492 ist live-/deployfaehig vorbereitet:

- `backend/modules/channelpoints.js` Version `0.4.0`
- sichere DB-Migration fuer lokale Grundlage
- Tabellen:
  - `channelpoints_categories`
  - `channelpoints_rewards`
  - `channelpoints_redemptions`
- neue Route `/api/channelpoints/db-status`
- keine Twitch-Schreibaktionen
- keine Dashboard-Aenderungen

## Media

Kanalpunkte verwenden weiterhin das bestehende Media-System:

- `backend/modules/media.js`
- `htdocs/dashboard/components/media_picker.js`
- `htdocs/dashboard/components/media_field.js`

Keine zweite Upload-Welt.

## Nächster sinnvoller Schritt

`STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD_API`
