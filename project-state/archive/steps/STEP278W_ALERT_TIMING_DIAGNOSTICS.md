# STEP278W_ALERT_TIMING_DIAGNOSTICS

## Ziel

Soundstart, Alert-Overlay-Start und Bus-Mirror-Event messbar machen, ohne Produktionslogik umzubauen.

## Geändert

```text
backend/modules/alert_system.js
docs/backend/COMMUNICATION_BUS_HELPER.md
docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Funktionen

- Timing-Diagnose im bestehenden Alert-System.
- Kein neues Modul.
- Keine DB-Migration.
- Keine Änderung an Queue, Sound, TTS oder Overlay-Ausgabe.
- Statusausgabe über `/api/alerts/bus-mirror/status`.
- `timing` zeigt den letzten gespiegelten Alert.

## Messpunkte

```text
queuedAt
queuePickedAt
waitingForSoundAt
soundBundleReadyAt
soundWaitDoneAt
playingAt
overlaySentAt
busMirrorSentAt
```

## Abgeleitete Werte

```text
queueToSoundWaitMs
soundPrepareDurationMs
soundWaitDurationMs
soundWaitDoneToPlayingMs
playingToOverlayMs
overlayToBusMirrorMs
playingToBusMirrorMs
```

## Test

1. Mirror aktivieren.
2. Echten Alert-Test auslösen.
3. `/api/alerts/bus-mirror/status` prüfen.
4. Erwartung: `stats.emitted` steigt und `timing` ist gefüllt.

## Nicht geändert

- Kein Ersatz von `broadcastWS`.
- Kein neues Mirror-Modul.
- Keine automatische Produktivmigration.
- Keine Sound-/TTS-/Queue-Änderung.
- Keine Datenbankmigration.
