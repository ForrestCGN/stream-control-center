# CAN-24.24 - Sound-Shadow-Stufe Abschlussdokumentation

## Zweck

CAN-24.24 schliesst die Sound-Shadow-Stufe fuer Channelpoints-Soundmigration sauber ab.

Dieser Stand dokumentiert:

```text
getestete Routen
getestete Scripts
bestaetigte Ergebnisse
Sicherheitsgrenzen
Deaktivierung/Rollback
naechste Optionen
```

## Ausgangspunkt

Ziel der CAN-24-Serie war nicht die produktive Migration, sondern die sichere Pruefung, ob Channelpoints-Sound-Rewards ueber den Sound-Bus validierbar sind, ohne den bestehenden Legacy-Flow zu ersetzen.

## Getesteter Reward

```text
rewardKey: bauernweisheit
mediaAssetId: 1423
file: media/channelpoints/general/bauernweisheit.mp3
audioUrl: /assets/media/channelpoints/general/bauernweisheit.mp3
durationMs: 6168
mediaType: audio
```

## Wichtige Routen

### Channelpoints

```text
GET  /api/channelpoints/bus/sound-migration-candidates
GET  /api/channelpoints/bus/sound-migration-candidates/dry-run
POST /api/channelpoints/bus/sound-migration-candidates/dry-run

GET  /api/channelpoints/bus/sound-shadow-dry-run/status
GET  /api/channelpoints/bus/sound-shadow-dry-run/evaluation
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-status
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-config
POST /api/channelpoints/bus/sound-shadow-dry-run/auto-config
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-test
POST /api/channelpoints/bus/sound-shadow-dry-run/auto-test

GET  /api/channelpoints/execute?reward=bauernweisheit
```

### Sound-System

```text
GET  /api/sound/eventbus/command/contract
GET  /api/sound/eventbus/command/queue-status
GET  /api/sound/eventbus/command/catalog-status?soundId=1423
POST /api/sound/eventbus/command/dry-run
```

### Bus-Diagnose

```text
GET /api/bus-integration-matrix/status
```

## Test-Scripts

```text
tools/can24_8_check_routes.cmd
tools/can24_17_shadow_enabled_test.cmd
tools/can24_21_execute_shadow_test.cmd
```

## Bestaetigte Testergebnisse

### 1. mediaId-DryRun

```text
accepted: true
statusCode: 200
mediaId: 1423
mediaAssetId: 1423
queueTouched: false
audioTouched: false
productiveMigration: false
```

### 2. Shadow-Hook Disabled-Test

```text
hookInstalled: true
executeHookInstalled: true
eventSubHookInstalled: false
enabled: false
rewardKey: bauernweisheit
auto-test skipped: true
reason: hook_disabled
queueTouched: false
audioTouched: false
productiveMigration: false
```

### 3. enabled=true Shadow-DryRun-Test

```text
enabled temporaer true
auto-test skipped: false
accepted: true
queueTouched: false
audioTouched: false
productiveMigration: false
enabled danach wieder false
```

### 4. Execute-Shadow-Test

```text
Legacy Execute: ok
Legacy Sound ueber /api/sound/play gestartet
Shadow accepted: true
Shadow skipped: false
Shadow queueTouched: false
Shadow audioTouched: false
Shadow productiveMigration: false
Endstatus enabled: false
```

## Wichtige Unterscheidung

Beim Execute-Shadow-Test wurde der bestehende Legacy-Pfad genutzt:

```text
/api/sound/play
```

Das ist:

```text
kein produktiver Sound-Bus-Play
keine Sound-Bus-Migration
kein Ersatz des bestehenden Legacy-Flows
```

Der Shadow-Hook hat parallel nur Diagnose/DryRun geschrieben.

## Aktueller Sicherheitsstatus

```text
Shadow-Hook: installiert
Shadow-Hook default: enabled=false
Shadow-Hook Reward-Grenze: nur bauernweisheit
EventSub-Hook: nicht installiert
Execute-Hook: installiert, aber nur aktiv bei enabled=true und rewardKey=bauerweisheit/bauernweisheit-Grenze
Produktive Migration: false
Sound-Bus-Play produktiv: false
Queue-Touch durch Shadow: false
Twitch-/Redemption-Write durch Shadow: false
```

Hinweis: Die Reward-Grenze ist `bauernweisheit`.

## Deaktivierung / Rollback

### Sofortige Deaktivierung

```bat
curl -s "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=bauernweisheit&enabled=false&configuredBy=manual_disable"
```

### Status pruefen

```bat
curl -s "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-status"
```

Erwartung:

```text
enabled: false
rewardKey: bauernweisheit
executeHookInstalled: true
eventSubHookInstalled: false
productiveMigration: false
```

### Code-Rollback

Wenn der Shadow-Hook vollstaendig entfernt werden soll, auf den Stand vor CAN-24.14 zurueckgehen oder gezielt die CAN-24.14 Hook-Erweiterungen in `backend/modules/channelpoints.js` zuruecknehmen.

## Weiterhin hart blockiert

```text
keine produktive Sound-Bus-Migration
kein produktiver Sound-Bus-Play
kein Hook fuer alle Rewards
kein EventSub-/Twitch-Redemption-Test ohne separate Freigabe
kein Auto-Fulfill/Refund/Cancel durch Shadow
kein Queue-Clear
kein OBS-/Overlay-Repair
kein Recovery-/SafetyStop-Autofix
```

## Bewertung

Die Sound-Shadow-Stufe ist technisch erfolgreich:

```text
mediaId/mediaAssetId Mapping funktioniert
Sound-System DryRun validiert Media-Registry-Assets
Shadow-Hook kann kontrolliert aktiviert und deaktiviert werden
Legacy-Flow bleibt funktionsfaehig
Shadow beruehrt keine Queue und kein Audio
```

## Naechste Optionen

Nach dieser Abschlussdokumentation kann separat entschieden werden:

```text
A) Sound-Migration pausieren und anderes Modul bearbeiten
B) Dashboard/Bus-Diagnose fuer Sound-Shadow verbessern
C) zweiten Reward als Shadow-Kandidat vorbereiten
D) produktive Migration fuer genau einen Reward separat planen
E) EventSub-/Twitch-Redemption-Test separat und sehr vorsichtig planen
```

## Empfehlung

Aktuell ist die sicherste Option:

```text
Sound-Shadow-Stufe als erfolgreich abschliessen.
Keine produktive Migration im selben Schritt.
Naechste Richtung separat entscheiden.
```
