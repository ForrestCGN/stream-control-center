# CAN-24.7 - Shadow-DryRun One Reward Prep

## Zweck

CAN-24.7 bereitet den Shadow-DryRun-Mitulauf fuer genau einen Channelpoints-Sound-Reward vor.

## Geaendert

```text
backend/modules/channelpoints.js
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Neue Routen

```text
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-status
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-config
POST /api/channelpoints/bus/sound-shadow-dry-run/auto-config
```

## Wichtig

Dieser Schritt installiert noch keinen automatischen EventSub-/Execute-Hook.

Die neue Config ist ein vorbereitender Status fuer genau einen Reward-Key.

## Sicherheitsgrenze

```text
Default sicher
kein automatischer Mitlauf fuer alle Rewards
kein EventSub-Hook
kein Execute-Hook
kein Sound-Play
keine Queue
keine Reward-Ausfuehrung ueber neuen Bus-Pfad
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
Legacy-Flow bleibt unveraendert
```

## Beispiel

```http
POST /api/channelpoints/bus/sound-shadow-dry-run/auto-config
{
  "rewardKey": "example_reward_key",
  "enabled": false,
  "configuredBy": "dashboard"
}
```

## Naechster Schritt

```text
CAN-24.8: Shadow-DryRun-Mitulauf Live-Hook planen/entscheiden oder erst Live-Test-Auswertung.
```

## Tests

```bat
node -c backend\modules\channelpoints.js
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
