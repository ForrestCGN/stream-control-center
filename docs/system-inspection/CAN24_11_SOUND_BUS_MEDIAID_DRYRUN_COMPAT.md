# CAN-24.11 - Sound-Bus mediaId DryRun Compatibility

## Zweck

CAN-24.11 korrigiert das Mapping-Problem zwischen Channelpoints `mediaAssetId` und Sound-System `soundId`.

## Ursache aus CAN-24.10

```text
Channelpoints Candidate: bauernweisheit
mediaAssetId: 1423
DryRun-Payload verwendete soundId: 1423
Sound-System Presets enthalten aber nur test_ping
media_assets enthaelt 1423 als active audio asset
```

## Entscheidung

Channelpoints-Media-Assets duerfen im Sound-Bus-DryRun nicht nur als `soundId` validiert werden.

Der Sound-Bus-DryRun akzeptiert jetzt:

```text
soundId fuer Sound-Presets
oder
mediaId/mediaAssetId fuer Media-Registry Assets
```

## Geaendert

```text
backend/modules/channelpoints.js
backend/modules/sound_system.js
```

Channelpoints-Payload enthaelt weiterhin `soundId`, aber zusaetzlich:

```json
{
  "mediaId": "1423",
  "mediaAssetId": "1423"
}
```

Sound-DryRun:

```text
Wenn soundId als Preset existiert -> Preset-Weg
Wenn soundId nicht als Preset existiert, aber mediaId/mediaAssetId vorhanden -> Media-Registry-Weg
```

## Sicherheitsgrenze

```text
DryRun only
kein Sound-Play
keine Queue
keine produktive Reward-Ausfuehrung
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
```

## Erwartetes Ergebnis nach lokalem Test

```text
/api/channelpoints/bus/sound-migration-candidates/dry-run
HTTP 200
accepted: true
wouldPlay: true
wouldQueueOrStart: true
queueTouched: false
audioTouched: false
```

## Naechster Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-migration-candidates/dry-run" | ConvertTo-Json -Depth 10
```
