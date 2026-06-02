# CAN-24.10 - Testergebnis und Sound-ID-Diagnose

## Ausgangspunkt

Der lokale Routentest aus CAN-24.8 wurde ausgefuehrt.

## Ergebnis des lokalen Routentests

```text
/api/_status: HTTP 200
/api/bus-integration-matrix/status: HTTP 200
/api/channelpoints/bus/sound-migration-candidates: HTTP 200
/api/channelpoints/bus/sound-migration-candidates/dry-run: HTTP 400
/api/channelpoints/bus/sound-shadow-dry-run/status: HTTP 200
/api/channelpoints/bus/sound-shadow-dry-run/evaluation: HTTP 200
/api/channelpoints/bus/sound-shadow-dry-run/auto-status: HTTP 200
/api/sound/eventbus/command/contract: HTTP 200
/api/sound/eventbus/command/queue-status: HTTP 200
```

## Bewertung

```text
Backend laeuft.
Neue CAN24-Routen sind erreichbar.
Keine 404.
Keine 500.
DryRun-Route ist erreichbar, lehnt aber fachlich ab.
```

## DryRun-Fehler

```text
candidate: bauernweisheit
mediaAssetId/soundId: 1423
error: Sound wurde nicht gefunden.
accepted: false
queueTouched: false
audioTouched: false
wouldPlay: false
wouldQueueOrStart: false
```

## Ursache

Die Kandidatenroute verwendet aktuell die Channelpoints `mediaAssetId` als `soundId`.

Der Sound-DryRun prueft aber `soundId` gegen Sound-System Presets. `1423` existiert offenbar als Media-Asset, aber nicht als Sound-Preset-ID.

## Neu in CAN-24.10

Read-only Diagnose-Route im Sound-System:

```text
GET /api/sound/eventbus/command/catalog-status?soundId=1423
```

Diese Route zeigt:

```text
Sound-Preset-Anzahl
ob soundId als Sound-Preset existiert
ob dieselbe ID als media_assets ID existiert
Beispiel-Sound-Presets
Diagnosehinweis
```

## Sicherheitsgrenze

```text
read-only
kein Sound-Play
keine Queue
keine Reward-Ausfuehrung
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
```

## Naechster Schritt

```text
CAN-24.11: Mapping-Entscheidung treffen
```

Wahrscheinliche Entscheidung:

```text
Channelpoints muss im sound.play.request Payload mediaId/mediaAssetId uebergeben,
oder Sound-DryRun muss mediaId/mediaAssetId als Registry-Asset akzeptieren,
statt mediaAssetId blind als soundId zu verwenden.
```

## Tests

```bat
node -c backend\modules\sound_system.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
