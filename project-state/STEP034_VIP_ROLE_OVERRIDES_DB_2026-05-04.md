# STEP034 - VIP Rollen-Fallbacks in SQLite

Stand: 2026-05-04

## Ziel

Die lokalen VIP-/Mod-/Crew-Rollen-Fallbacks werden nicht mehr nur aus `config/vip_sound_roles.json` gelesen, sondern in SQLite vorbereitet.

## Neue/Geaenderte Dateien

- `backend/modules/vip_sound_overlay.js`
  - Version `1.8.0`
  - Schema-Version `4`
  - neue Tabelle `vip_sound_role_overrides`
  - Rollen-Erkennung nutzt DB vor Config-Fallback
- `project-state/*` Dokumentation aktualisiert

## Neue Tabelle

`vip_sound_role_overrides`

Felder:

- `login`
- `display_name`
- `role_type` (`mod`, `crew`, `vip`)
- `enabled`
- `source`
- `note`
- `created_at`
- `updated_at`

## Neue Routen

- `GET /api/vip-sound/roles`
- `POST /api/vip-sound/roles/upsert`
- `POST /api/vip-sound/roles/delete`
- `POST /api/vip-sound/roles/import-config`

Kompatibel auch unter:

- `/api/vip-sound-overlay/roles*`

## Verhalten

Lesereihenfolge fuer lokale Rollen-Fallbacks:

1. Twitch-Erkennung, wenn `autoDetectTargetRole=true`
2. SQLite-Tabelle `vip_sound_role_overrides`, wenn `fallbackRolesEnabled=true`
3. `config/vip_sound_roles.json` nur noch als Import-/Fallback-Quelle, wenn DB nicht verfuegbar ist

Beim ersten Start wird `config/vip_sound_roles.json` in die DB importiert, wenn die Tabelle leer ist.

## Wichtig

- Keine bestehende Funktionalitaet entfernt.
- Twitch-Mod-Erkennung bleibt aktiv.
- `config/vip_sound_roles.json` bleibt vorerst erhalten, aber nicht mehr die Hauptquelle.
- Dashboard kann spaeter direkt mit der DB/API arbeiten.
