# STEP174.6 - VIP Users Response Cleanup

Datum: 2026-05-05

## Ziel

`/api/vip-sound/sounds/users` liefert die VIP-/Mod-Berechtigung jetzt fachlich sauberer aus.

## Fachregel

VIP-System-Berechtigung kommt nur aus dem Twitch-Sync-Cache:

- Twitch Mod -> berechtigt, Anzeige/Primary Role: `mod`
- Twitch VIP -> berechtigt, Anzeige/Primary Role: `vip`
- kein Twitch VIP/Mod -> nicht berechtigt

Lokale Overrides und alte Events/Daily-Usage werden nicht als Berechtigung verwendet.

## Änderung

Betroffene Datei:

- `backend/modules/vip_sound_overlay.js`

Anpassungen:

- Neue Normalisierung der User-Response über `finalizeVipSoundCandidate()`.
- `roleTypes` enthält nur noch die primäre echte Twitch-Rolle.
- Wenn ein User Mod ist, wird nicht zusätzlich VIP als sichtbare/primäre Rolle ausgegeben.
- Neue Felder in jedem User-Objekt:
  - `twitch.allowed`
  - `twitch.primaryRole`
  - `twitch.statusLabel`
  - `permissionSource`
  - `history.hasUsage`
  - `local.ignoredForPermission`
- `tableSources` enthält nur aktive Quellen.
- `ignoredSources` nennt alte lokale Override-Tabelle als Diagnose-/Altbestand.

## Test

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\vip_sound_overlay.js
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/users" | ConvertTo-Json -Depth 12
```

Erwartung:

- Twitch-Mods haben `roleTypes: ["mod"]`.
- Twitch-VIPs haben `roleTypes: ["vip"]`.
- Historische Daten stehen nur unter `history`.
- Lokale Overrides stehen nicht als Berechtigung in `roleTypes`.
