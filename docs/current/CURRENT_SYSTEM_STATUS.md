# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26 / STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD

## Kanalpunkte-System

STEP493 ergänzt lokale Reward-CRUD-Routen auf Basis der in STEP492 angelegten SQLite-Tabellen.

- `backend/modules/channelpoints.js` Version `0.5.0`
- Modus `backend_local_reward_crud`
- Kategorien und Rewards können lokal gelesen werden.
- Rewards können lokal erstellt, geändert, aktiviert und deaktiviert werden.
- Keine Twitch-Schreibaktionen.
- Kein Dashboard-Umbau.

## Media-Regel

Kanalpunkte nutzen weiterhin das bestehende Media-System (`media.js`) und die vorhandenen Dashboard-Komponenten `media_picker.js` / `media_field.js`.
