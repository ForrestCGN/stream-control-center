# Aktueller Systemstatus – stream-control-center

Stand: 2026-05-27  
Fokus: Channelpoints-System, Twitch-Sync, Redemption-Flow, Sound-System-Routing, Media-Dateinamen

## Single Source of Truth

Projekt:

```text
D:\Git\stream-control-center
```

Live-System:

```text
D:\Streaming\stramAssets
```

Produktive Datenbank:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Regel: Die produktive SQLite-Datenbank wird niemals ersetzt oder neu gebaut. Schemaänderungen nur über migrationssichere `CREATE TABLE IF NOT EXISTS`/Helper-Logik.

## Aktueller relevanter STEP-Stand

Aktueller Channelpoints-Stand:

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

Dieser Stand ersetzt/superseded:

```text
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11      -> nicht benutzen
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11 -> nicht benutzen
STEP526_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_HOTFIX_v0.9.12 -> durch STEP527 ersetzt
```

Aktueller Sound-/Routing-Stand:

```text
STEP523_SOUND_SYSTEM_AUTO_OUTPUT_DEFAULTS_FIX_v0.1.12
```

Aktueller Media-Dateinamen-Stand:

```text
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

Zurückgezogen/nicht benutzen:

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
```

## Channelpoints – aktuelles Bedienkonzept

Das alte lokale „Aktiv“-Häkchen im Editor wird nicht mehr als Bedienlogik verwendet.

Aktueller gewünschter Ablauf:

```text
Editor:
- kein Aktiv-Häkchen
- Speichern legt lokal an oder ändert lokal
- Speichern erstellt/aktualisiert den Twitch-Reward
- neuer Twitch-Reward wird standardmäßig NICHT aktiv/sichtbar auf Twitch erstellt

Übersicht:
- Twitch Aktiv/Inaktiv-Schalter
- betrifft nur Twitch sichtbar/einlösbar
- Aktiv = Twitch Reward aktivieren
- Inaktiv = Twitch Reward deaktivieren

Bestehender Reward:
- Bearbeiten + Speichern aktualisiert lokal und Twitch
- bisheriger Twitch-Aktivstatus bleibt erhalten
```

Intern darf `system_enabled` als technische Kompatibilitätsspalte weiter existieren, soll aber nicht als normale Dashboard-Bedienlogik sichtbar sein.

## Wichtige Standardwerte für neue Rewards

Neue Rewards dürfen nicht automatisch streamgebunden werden.

Standard:

```text
cooldown_seconds = 0
max_per_stream = 0
max_per_user_per_stream = 0
```

Wenn `max_per_stream > 0` gesetzt ist, zeigt Twitch offline ggf. sinngemäß:

```text
Du kannst diese Belohnung nur während eines Streams einlösen.
```

Das ist dann eine Twitch-Einschränkung wegen streamgebundener Einlöse-Limits.

## Sound-/Media-Routing

Channelpoints entscheidet nicht selbst, ob Sound über Device oder Overlay läuft.

Standard:

```text
Channelpoints: Auto / Sound-System entscheidet
Sound-System: Device für Audio, Overlay nur wenn nötig/gewollt
Ziel-Standard: Stream + Discord
Queue: Sound-System entscheidet
Video: Overlay/Media-Pfad über Sound-/Media-Bridge möglich
```

Aktueller Sound-System-Fix:

```text
config/sound_system.json
output.defaultTarget  = device
defaults.outputTarget = device
targets.discord       = enabled
targets.both          = enabled
output.targets.both   = enabled
```

Falls `/api/sound/status` trotzdem `defaults.outputTarget: overlay` meldet, überschreibt vermutlich die DB-/Runtime-Config den JSON-Wert.

## Media-Dateinamen

UTF-8-/Mojibake-Problem trat z. B. auf als:

```text
GewA_1_4rzGurke.mp3
```

Korrekte Richtung:

```text
Anzeige: lesbar, z. B. GewürzGurke
Technischer Dateiname: ASCII-sicher, z. B. GewuerzGurke.mp3
```

Aktueller Real-Fix basiert auf echter `backend/modules/media.js` und nicht auf dem zurückgezogenen Tool-Script.

## Bekannte Diagnose aus letzter Sitzung

`Cannot GET /api/channelpoints/status` bedeutete nicht automatisch Dashboard-Fehler. In einem konkreten Fall wurde `backend/modules/channelpoints.js` nicht geladen.

Startlog zeigte:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

Dadurch fehlten alle `/api/channelpoints/*`-Routen. Das wurde in STEP526/STEP527 berücksichtigt.

## Prüfbefehle

Backend-Modulliste:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 5
```

Channelpoints-Status muss nach korrektem Laden wieder funktionieren:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" | ConvertTo-Json -Depth 6
```

Twitch-Manage-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status" | ConvertTo-Json -Depth 6
```

Reward-Liste:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards" |
  Select-Object -ExpandProperty rewards |
  Select-Object reward_key,title,system_enabled,twitch_is_enabled,twitch_reward_id,action_type,action_key,media_asset_id,media_role,cooldown_seconds,max_per_stream,max_per_user_per_stream |
  Format-Table -AutoSize
```
