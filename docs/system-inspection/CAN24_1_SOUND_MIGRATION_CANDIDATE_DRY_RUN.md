# CAN-24.1 - Sound Migration Candidate Dry-Run

## Zweck

CAN-24.1 macht einen ausgewaehlten Channelpoints-Sound-Kandidaten gegen den Sound-Dry-Run validierbar.

## Geaendert

```text
backend/modules/channelpoints.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue Route

```text
GET/POST /api/channelpoints/bus/sound-migration-candidates/dry-run
```

## Verhalten

Die Route waehlt standardmaessig `firstCandidate` aus:

```text
GET /api/channelpoints/bus/sound-migration-candidates/dry-run
```

Oder explizit per:

```text
POST /api/channelpoints/bus/sound-migration-candidates/dry-run
{
  "rewardKey": "..."
}
```

Danach wird nur an den Sound-Dry-Run weitergereicht:

```text
POST /api/sound/eventbus/command/dry-run
```

## Sicherheitsgrenze

```text
kein Sound
keine Queue
keine produktive Reward-Ausfuehrung
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
```

Der Sound-System-Dry-Run darf Diagnose-State im Sound-System beruehren, aber keine Queue/Audio.

## Naechster Schritt

```text
CAN-24.2: Dry-Run Ergebnis im Dashboard als eigene Candidate-Card anzeigen.
```

## Tests

```bat
node -c backend\modules\channelpoints.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
