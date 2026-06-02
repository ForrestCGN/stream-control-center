# CAN-24.0 - Sound Migration Candidate Prep read-only

## Zweck

CAN-24.0 startet den naechsten Block nach CAN-23 und bereitet den ersten Sound-Migrationskandidaten vor.

Es wird nur eine Kandidatenliste inklusive vorgeschlagenem `sound.play.request` Payload erzeugt.

## Geaendert

```text
backend/modules/channelpoints.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue read-only Route

```text
GET /api/channelpoints/bus/sound-migration-candidates
```

## Die Route zeigt

```text
Sound-Kandidaten aus Channelpoints-Rewards
ready/blocked Status
currentExecutionTarget
proposedSoundCommandPayload
firstCandidate
```

## Sicherheitsgrenze

```text
read-only
kein Sound
kein Dry-Run
keine Queue
keine Reward-Ausfuehrung
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
kein EventBus-Emit
```

## Naechster Schritt

```text
CAN-24.1: Ausgewaehlten Kandidaten gegen /api/sound/eventbus/command/dry-run validierbar machen.
```

## Tests

```bat
node -c backend\modules\channelpoints.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
