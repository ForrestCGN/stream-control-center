# CAN-24.2 - Sound Migration Candidate Dashboard Card

## Zweck

CAN-24.2 zeigt den Sound-Migrationskandidaten im Dashboard als eigene Candidate-Card.

## Geaendert

```text
backend/modules/bus_integration_matrix.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Dashboard

```text
Bus-Diagnostics -> Bus-Matrix -> CAN24 Sound-Migration Kandidat
```

Die Karte zeigt:

```text
firstCandidate
Reward-Key
ready/total Kandidaten
vorgeschlagener sound.play.request Payload
Dry-Run OK/Accepted
Queue touched
Audio/Sound touched
Fehlerdetails
```

## Sicherheitsgrenze

```text
kein Sound-Play
keine Queue-Aktion
keine produktive Reward-Ausfuehrung
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
```

Hinweis: Der Dry-Run kann Diagnose-State im Sound-System aktualisieren, aber keine Queue/Audio anfassen.

## Naechster Schritt

```text
CAN-24.3: Entscheiden, ob ein produktiver Caller testweise auf Bus-Dry-Run vorbereitet werden darf.
```

## Tests

```bat
node -c backend\modules\bus_integration_matrix.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Alle Syntax-Checks waren erfolgreich.
