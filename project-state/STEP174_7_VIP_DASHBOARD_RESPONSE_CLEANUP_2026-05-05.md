# STEP174.7 - VIP Dashboard Response Cleanup

Stand: 2026-05-05

## Ziel

Das VIP-Dashboard nutzt die bereinigte STEP174.6-Backend-Response fuer `/api/vip-sound/sounds/users`.

## Geaendert

- Upload-Dropdown nutzt `soundUserOptionLabel(row)`.
- Twitch-Status kommt direkt aus `row.twitch.statusLabel` bzw. `row.twitch.primaryRole`.
- Berechtigung kommt direkt aus `row.twitch.allowed` / Twitch-Rolle.
- `roleTypes` wird nicht mehr als Berechtigungs-Fallback genutzt.
- `sourceLabels(row)` trennt Twitch-Cache, Historie und ignorierte lokale Overrides.
- Lokale Overrides werden als Diagnose angezeigt, aber nicht fuer Berechtigungen genutzt.
- History wird als Historie angezeigt, aber nicht fuer Berechtigungen genutzt.

## Nicht geaendert

- `rolesPage()` bleibt erhalten.
- `syncStatusHtml()` bleibt erhalten.
- `formatDateTime()` bleibt erhalten.
- Kein Backend-Umbau in diesem Schritt.
- Keine Funktionalitaet entfernt.

## Test

- `node -c htdocs/dashboard/modules/vip.js`
- Dashboard: VIP -> VIPs & Mods, Sounds, Filter VIP/Mod/mit Sound/ohne Sound.
