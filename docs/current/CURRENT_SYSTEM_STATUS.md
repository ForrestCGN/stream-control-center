# Aktueller Systemstatus – stream-control-center

Stand: 2026-05-29  
Fokus: Channelpoints-System, Twitch-Sync, Redemption-Flow, Sound-System-Routing, Media-Dateinamen, Alert-Overlay-Stabilität, Doku-Cleanup

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

Doku-/Cleanup-Stand:

```text
STEP530_BACKUP_AND_SAFE_CLEANUP_BATCH1
STEP531_DOCS_TODO_AND_CLEANUP_SCAN
STEP532_TODO_RESCUE_AND_DOC_CLEANUP_TRIAGE
STEP533_CURRENT_APPEND_DOCS_CONSOLIDATION_BATCH1
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

## Alert-Overlay / SoundBus – konsolidierter Stand

Die früheren `CURRENT_SYSTEM_STATUS_STEP*_APPEND.md`-Dateien zu STEP363 bis STEP396 wurden in diesen Abschnitt zusammengeführt.

### Produktiver Alert-Pfad

Produktiv ist das direkte Alert-Overlay:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2.html
```

Der produktive Alert-Pfad bleibt:

```text
alert_system.js
→ legacy WebSocket
→ _overlay-alerts-v2.html
→ overlay finished ack
```

Der Communication-Bus ist vorbereitet und der direkte Bus-Shadow-Client im echten Overlay ist online:

```text
clientId=alert_overlay_v2_shadow
module=alert_system
type=overlay
status=online
```

Wichtig: Das ist derzeit Shadow-/Vorbereitungsstand. Es ist keine produktive Umschaltung auf Bus.

### Nicht produktiv verwenden

Nicht als produktiven Alert-Pfad verwenden:

```text
http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge
```

Die iframe-/Bridge-Variante ist nicht Produktionspfad.

Ebenfalls nicht verwenden:

```text
STEP376
STEP386
```

außer sie werden ausdrücklich als verworfen/archiviert dokumentiert.

### Bestätigte Reconnect-/Reload-Fixes

Bestätigter Ablauf:

```text
- laufender Alert aktiv
- OBS-Alert-Browserquelle wird währenddessen aktualisiert
- Overlay meldet hello
- Alert-System sendet laufenden Alert an reconnecteten Overlay-Client
- Sound/TTS startet nicht erneut
- Queue bleibt stabil
- Alert-Lifecycle wird nach Ende sauber geleert
```

Der Reconnect-Replay nutzt die verbleibende Restlaufzeit (`remainingMs`) statt der vollen `durationMs`. Dadurch verlängert ein OBS-Browserquellen-Reload die visuelle Alert-Anzeige nicht künstlich.

Bestätigter späterer Status:

```text
OverlayUrlStatus=200
overlayClients=1
OverlayWatchdog issues=0
missingFinishAck=0
noClient=0
CommunicationClients=alert_overlay_v2_shadow:alert_system:overlay:online
DirectOverlayBusClientOnline=True
BridgeClientOnline=False
CommunicationWatchdog issueCount=0
```

### Bus-/Shadow-Adapter-Stand

Der Alert-Bus-Adapter darf nicht direkt produktiv geschaltet werden.

Zukünftiger Bus-Pfad braucht vorher einen stabilen Adaptervertrag:

```text
communication_bus
→ channel visual.alert
→ action play/clear
→ payload.alert
→ overlay bus ack
```

Vorbereiteter Shadow-Stand:

```text
channel=visual.alert
action=play
action=clear
payload.alert
bus_ack received/finished
```

Offene Folgearbeit bleibt: Shadow-/Bus-Test und erst danach Entscheidung, ob produktiver Bus-Modus vorbereitet wird.

### Offenes Feintuning

Das Timing zwischen Visual, Sound und TTS soll später optional geprüft werden.

Keine akute Fehlfunktion: Der zuletzt dokumentierte echte Alert-Flow war visuell stabil.

## Bekannte offene Issues

### Sound-System: verwaister `activeBundleLock`

Sound-System kann nach Birthday-Bundle/Manual-Stop in einen Zustand geraten, in dem `activeBundleLock` gesetzt bleibt, obwohl `current` und `currentBundle` leer sind.

Effekt:

```text
Neue Birthday-/VIP-Sounds landen in der Queue, starten aber nicht.
```

Live-Workaround:

```text
POST /api/sound/clear
```

Das löst Queue und Lock.

Status: bekanntes separates Sound-System-Issue, nicht Teil der Alert-Reconnect-/Bus-Arbeiten.

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

Alert-/Overlay-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status" | ConvertTo-Json -Depth 8
```

Sound-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 8
```
