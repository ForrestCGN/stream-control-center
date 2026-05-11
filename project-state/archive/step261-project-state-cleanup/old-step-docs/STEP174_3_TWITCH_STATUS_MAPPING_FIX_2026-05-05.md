# STEP174.3 - Twitch-Status Mapping Fix

Stand: 2026-05-05

## Ziel

Die VIP-Dashboard-Tabelle soll den Twitch-Status robust aus den API-Daten erkennen.

## Problem

In der Tabelle wurde trotz Twitch-Cache-Quelle teilweise `kein Twitch-Status` angezeigt. Ursache war ein zu enges Feldmapping im Dashboard.

## Änderung

Betroffene Datei:

- `htdocs/dashboard/modules/vip.js`

Änderungen:

- Twitch-Rollen werden robust aus `twitch.isVip/isMod`, direkten Feldern und Rollenlisten erkannt.
- Anzeige nutzt `Twitch VIP` / `Twitch Mod`.
- Fallback-Text ist jetzt `nicht berechtigt` statt `kein Twitch-Status`.
- Quelle `twitch_sync` wird als `Twitch-Cache` angezeigt.

## Nicht geändert

- Keine Backend-Logik geändert.
- Keine Datenbank geändert.
- Keine Berechtigungslogik geändert.

## Test

```powershell
node -c .\htdocs\dashboard\modules\vip.js
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/users" | ConvertTo-Json -Depth 20
```

Im Dashboard muss bei Twitch-VIPs `Twitch VIP` und bei Twitch-Mods `Twitch Mod` stehen.
