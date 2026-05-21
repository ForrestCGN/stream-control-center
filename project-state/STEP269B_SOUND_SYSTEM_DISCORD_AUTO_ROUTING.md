# STEP269B - Sound-System Discord Auto-Routing

## Ziel
Sound-System-Items bestimmter Kategorien oder Quellen sollen automatisch zusätzlich nach Discord geroutet werden, ohne Alert-System, SoundAlerts, VIP-/Mod-System oder TTS einzeln umzubauen.

## Geänderte Dateien
- `backend/modules/sound_system.js`

## Änderung
- Neuer Config-Block `discordRouting` im Sound-System.
- `discordRouting` ist DB-/Settings-fähig über den bestehenden `sound_settings`-Mechanismus.
- Automatische Zielwahl erfolgt zentral in `normalizePlayRequest()`.
- Wenn ein Item keine explizite `target`-Angabe hat und Kategorie oder Quelle zur Routing-Regel passt, wird `target` automatisch auf `both` gesetzt.
- Explizite Targets werden standardmäßig respektiert (`overrideExplicitTarget: false`).
- Routing-Entscheidung wird im Item-Lifecycle sichtbar:
  - `discordRouted`
  - `originalTarget`

## Standard-Routing
Standardmäßig werden folgende Kategorien automatisch nach `both` geroutet:
- `alert`
- `alert_critical`
- `channel_reward`
- `vip`
- `crew`
- `special`
- `tts`

Standardmäßig werden folgende Quellen automatisch nach `both` geroutet:
- `alert_system`
- `alert_tts`
- `soundalerts`
- `sound_alerts`
- `channel_reward`
- `vip_mod`
- `vip_sound_overlay`
- `tts_system`
- `tts`

## Bewusst nicht geändert
- Keine Änderung an Alert-Bundle-Lock / Queue-Logik.
- Keine Änderung an Alert-System, SoundAlerts, VIP-/Mod-System oder TTS-Modul.
- Keine Änderung an `app.sqlite`.
- Keine Änderung an `config/**`.
- Kein neues Discord-Queue-System.
- Keine direkte Alert-zu-Discord-Verkabelung.

## Tests
Durchgeführt:
- `node --check backend/modules/sound_system.js`

Empfohlene Live-Tests nach Deploy:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_system.js
.\stepdone.cmd "STEP269B sound system discord auto routing"
```

Nach Backend-Neustart / Live-Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 8
```

Gezielter Auto-Routing-Test ohne explizites `target`:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&category=vip&priority=60"
```

Erwartung:
- Antwort-Item zeigt `target=both`.
- `item.lifecycle.discordRouted=true`.
- Discord spielt den Sound ab.
- `stats.discordStarted` steigt.

Kontrolltest, dass explizites Target respektiert wird:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&target=stream&outputTarget=device&category=vip&priority=60"
```

Erwartung:
- Antwort-Item bleibt `target=stream`.
- Discord startet nicht zusätzlich.

## Offene Punkte
- Falls Auto-Routing später im Dashboard steuerbar werden soll, kann der bestehende Sound-Settings-Bereich um `discordRouting` erweitert werden.
- Danach echter Ablauf-Test mit Alert + Alert-TTS + SoundAlert + VIP/Mod + normalem TTS.
