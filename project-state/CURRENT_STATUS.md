# CURRENT_STATUS – stream-control-center

Stand: 2026-05-27

## Aktueller Fokus

Channelpoints-System wurde bis STEP527 konsolidiert. Ziel war: Twitch Rewards lokal verwalten, mit Twitch synchronisieren, Redemptions über EventSub/EventBus ausführen, Sound-System-Routing nutzen und die Bedienung im Dashboard vereinfachen.

## Aktueller gültiger Modulstand

```text
Channelpoints: STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
Sound-System Config/Routing: STEP523_SOUND_SYSTEM_AUTO_OUTPUT_DEFAULTS_FIX_v0.1.12
Media-Dateinamen: STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

## Channelpoints Bedienung

```text
Editor:
- kein lokales Aktiv-Häkchen
- Speichern legt lokal an oder ändert lokal
- Speichern erstellt/aktualisiert Twitch Reward
- neuer Twitch Reward wird standardmäßig inaktiv erstellt

Übersicht:
- Twitch Aktiv/Inaktiv steuert nur Twitch
```

## Wichtige bekannte Ursache / Fix

`Cannot GET /api/channelpoints/status` war Folge davon, dass `channelpoints.js` beim Serverstart nicht geladen wurde.

Startlog:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

Dieser Fehler wurde mit STEP526/STEP527 adressiert.

## Nicht verwenden

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

## Offene Prüfung nach Apply/Deploy

Nach STEP527:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 5
```

`channelpoints.js` muss wieder geladen sein.

Dann:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status" | ConvertTo-Json -Depth 6
```
