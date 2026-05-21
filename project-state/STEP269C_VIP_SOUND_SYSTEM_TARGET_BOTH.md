# STEP269C - VIP-/Mod-Sounds nutzen konfigurierbares Sound-System-Target

## Ziel

VIP-/Mod-Sounds sollen nicht mehr hart mit `target: "stream"` an das Sound-System gesendet werden. Dadurch konnte die zentrale Discord-Auto-Routing-Logik aus STEP269B nicht greifen.

## Geänderte Datei

- `backend/modules/vip_sound_overlay.js`

## Änderung

- Neuer VIP-Setting-Key `soundSystemTarget` mit Default `both`.
- `getConfigSettingValue()` kennt jetzt optionale JSON-Fallback-Pfade fuer dieses Setting:
  - `soundSystemTarget`
  - `sound.target`
  - `sound.soundSystemTarget`
  - `soundSystem.target`
- Neuer Helper `normalizeSoundSystemTarget(value, fallback)` erlaubt nur:
  - `stream`
  - `discord`
  - `both`
- Das Payload an `/api/sound/play` nutzt nun:
  - `target: normalizeSoundSystemTarget(getVipSetting("soundSystemTarget", "both"), "both")`
- `outputTarget: "device"` bleibt unverändert.

## Bewusst nicht geändert

- Keine Änderung an `sound_system.js`.
- Keine Änderung an `alert_system.js`.
- Keine Änderung an `soundalerts_bridge.js`.
- Keine Änderung an `tts_system.js`.
- Keine Änderung an `app.sqlite`.
- Keine Änderung an `config/**`.
- Keine Änderung an der VIP-/Mod-Berechtigungslogik.
- Keine Änderung an Daily-Usage, Chat-Ausgaben, Uploads oder Dashboard-Routen.

## Erwartung

Echte VIP-/Mod-Sounds laufen weiterhin ueber das Sound-System mit `outputTarget=device`, bekommen aber standardmaessig `target=both`. Dadurch spielt das Sound-System sie lokal/Stream und zusätzlich ueber die vorhandene Discord-Bridge ab.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\vip_sound_overlay.js
```

Live-Test nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 6
```

Danach einen echten VIP-/Mod-Sound auslösen und prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s.discord | ConvertTo-Json -Depth 10
$s.stats | ConvertTo-Json -Depth 10
```

Erwartung:

- `discord.lastOk = true`
- `stats.discordStarted` steigt
- Sound ist im Discord Voice Channel hörbar
