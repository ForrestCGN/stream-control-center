# CAN-24.4 - Channelpoints Sound Shadow-DryRun

## Zweck

CAN-24.4 bereitet einen Channelpoints-Sound-Kandidaten als Shadow-DryRun vor.

## Geaendert

```text
backend/modules/channelpoints.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue Routen

```text
GET  /api/channelpoints/bus/sound-shadow-dry-run/status
GET  /api/channelpoints/bus/sound-shadow-dry-run/prepare
POST /api/channelpoints/bus/sound-shadow-dry-run/prepare
```

## Verhalten

`prepare` ruft intern weiterhin nur den vorhandenen Kandidaten-DryRun auf:

```text
/api/channelpoints/bus/sound-migration-candidates/dry-run
  -> /api/sound/eventbus/command/dry-run
```

## Sicherheitsgrenze

```text
kein Sound-Play
keine Queue
keine produktive Reward-Ausfuehrung
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
Legacy-Flow bleibt unveraendert
```

## Wichtig

Dieser Schritt erzeugt einen manuellen Shadow-DryRun-Status. Er haengt sich nicht automatisch in EventSub oder Execute ein.

## Naechster Schritt

```text
CAN-24.5: Shadow-DryRun Ergebnis pruefen / Dashboard-Auswertung.
```

## Tests

```bat
node -c backend\modules\channelpoints.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
