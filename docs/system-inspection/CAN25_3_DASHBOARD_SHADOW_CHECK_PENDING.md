# CAN-25.3 - Dashboard Sound-Shadow Check vorbereitet

## Zweck

CAN-25.3 bereitet den lokalen Check der neuen read-only Sound-Shadow Summary Card vor.

Dieser Schritt ist bewusst ein Pending-/Check-Schritt, weil die Sichtpruefung lokal im Browser/Dashboard erfolgen muss.

## Neues Script

```text
tools/can25_3_dashboard_shadow_check.cmd
```

## Was das Script prueft

Das Script ruft nur read-only Status-Routen ab:

```text
GET /api/_status
GET /api/bus-integration-matrix/status
GET /api/channelpoints/bus/sound-shadow-dry-run/auto-status
GET /api/channelpoints/bus/sound-shadow-dry-run/evaluation
GET /api/channelpoints/bus/sound-migration-candidates
```

## Sicherheitsgrenze

```text
kein Sound-Play
keine Queue-Aktion
keine Twitch-/Redemption-Aktion
keine Migration
kein Enable/Disable
kein Test-Button
kein Execute-Test
```

## Erwartung Backend

Im Auto-Status sollte sichtbar sein:

```text
enabled: false
rewardKey: bauernweisheit
executeHookInstalled: true
eventSubHookInstalled: false
productiveMigration: false
queueTouched: false
twitchTouched: false
redemptionChanged: false
```

## Erwartung Dashboard

Im Dashboard/Bus-Diagnostics soll sichtbar sein:

```text
Sound-Shadow Status Card
Kandidat
Hooks
Tests
Letztes Ergebnis
Safety Flags
Deaktivierungs-Hinweis als Text
```

## Wichtig

Die Card muss read-only bleiben.

Nicht vorhanden sein duerfen:

```text
Enable/Disable Button
Test-Button
Execute-Test Button
Sound-Play Button
Queue-Reset
Migration-Button
```

## Lokale Ausfuehrung

Im Repo-Root:

```bat
tools\can25_3_dashboard_shadow_check.cmd
```

Danach bitte Screenshot oder kurzes Feedback posten:

```text
Card sichtbar: ja/nein
Layout ok: ja/nein
Safety Flags sichtbar: ja/nein
keine Buttons: ja/nein
```

## Naechster Schritt

```text
CAN-25.4: Dashboard-Check Ergebnis dokumentieren oder UI-Cleanup vornehmen.
```
