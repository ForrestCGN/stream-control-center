# STEP174.2 - Twitch-only VIP Sound Rechte

Stand: 2026-05-05

## Ziel

Das VIP-System ist fachlich eindeutig: VIP-/Mod-Sounds sind nur fuer aktuelle Twitch-VIPs und Twitch-Mods freigegeben. Der letzte erfolgreiche Twitch-Sync-Cache dient als Fallback, wenn Twitch/API/Token kurzfristig nicht verfuegbar sind.

## Geaendert

- Dashboard-Haupttabelle `VIPs & Mods` vereinfacht.
- Entfernt aus der Hauptansicht: lokale Overrides und Historie als Statusspalten.
- Filter vereinfacht: Alle, Ohne Sound, Mit Sound, Twitch VIP, Twitch Mod.
- Backend prueft VIP-Sound-Berechtigung nur noch gegen `vip_sound_twitch_users`.
- Daily-Usage, Events und lokale Override-Daten werden nicht mehr als Berechtigung gewertet.
- Bestehende lokale Rollen-/Historientabellen bleiben fuer Alt-/Diagnosezwecke erhalten, werden aber nicht mehr fuer Rechte genutzt.

## Bewusst offen

- Eigenes User-Sound-/Channel-Point-System ist ein spaeteres separates System und wird nicht ins VIP-System gemischt.
- Alte lokale Rollen-UI kann spaeter in eine Diagnose-/Altbereich-Seite verschoben oder ausgeblendet werden.

## Tests

- `node -c backend/modules/vip_sound_overlay.js`
- `node -c htdocs/dashboard/modules/vip.js`
- `/api/vip-sound/twitch-sync/status`
- `/api/vip-sound/sounds/users`
- Dashboard: `VIP-System -> VIPs & Mods`
