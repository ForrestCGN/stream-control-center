# STEP174.1 - Twitch-Status / lokale Overrides / Historie getrennt

Stand: 2026-05-05

## Zweck

Nach STEP174 wurden Twitch-VIPs/-Mods erfolgreich synchronisiert. In der Dashboard-Liste konnten aber alte Daily-Usage-/Event-Daten zusammen mit echten Twitch-Rollen als gemeinsame `roleTypes` wirken. Das war fachlich missverstaendlich.

## Geaendert

- `backend/modules/vip_sound_overlay.js`
  - `/api/vip-sound/sounds/users` liefert Rollen jetzt getrennt:
    - `twitchRoles` / `twitch` fuer echte Twitch-Daten aus dem Sync.
    - `localRoles` / `local` fuer lokale Overrides.
    - `historySoundTypes` / `history` fuer Daily-Usage-/Event-Historie.
  - `roleTypes` enthaelt nur noch Twitch-/lokale Rollen, keine reine Historie mehr.

- `htdocs/dashboard/modules/vip.js`
  - Tabelle `VIPs & Mods` zeigt getrennte Spalten:
    - Twitch-Status
    - Lokaler Override
    - Historie
    - Soundstatus
  - Filter unterscheiden Twitch VIP/Mod, lokale Overrides und Historie.

- `htdocs/dashboard/modules/vip.css`
  - Tabelle fuer die zusaetzlichen Spalten verbreitert.

## Bewusst offen

- Keine Aenderung an Upload, Daily-Usage, Sound-System oder Twitch-Sync-Intervall.
- Keine Entfernung alter Felder `roleTypes`, `soundTypes`, `sources` fuer Kompatibilitaet.
