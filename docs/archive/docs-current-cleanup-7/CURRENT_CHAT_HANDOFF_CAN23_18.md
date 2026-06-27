# Current Chat Handoff - CAN23.18

## Stand

CAN-23 ist konsolidiert abgeschlossen.

## Aktueller technischer Stand

Die Bus-Matrix im Dashboard ist der zentrale Sichtbarkeits- und Readiness-Punkt:

```text
Bus-Diagnostics -> Bus-Matrix
```

## Wichtigste Routen

```text
/api/bus-integration-matrix/status
/api/sound/eventbus/command/contract
/api/sound/eventbus/command/lifecycle
/api/sound/eventbus/command/dry-run
/api/sound/eventbus/command/play-compatibility
/api/sound/eventbus/command/queue-status
/api/alerts/eventbus/ack-status
/api/alerts/eventbus/command/contract
/api/alerts/eventbus/command/dry-run
/api/vip-sound/eventbus/overlay/status
/api/overlay-monitor/client-control/status
/api/overlay-monitor/client-control/classification
/api/overlay-monitor/client-control/identity-contract
/api/channelpoints/bus/request-readiness
```

## Harte Grenzen bleiben aktiv

```text
Keine automatische Heilung
Kein Queue-Clear
Kein Alert-Replay
Kein Sound-Replay
Kein OBS-Refresh
Keine OBS-Reparatur
Keine produktive Migration ohne separaten Go-Schritt
```

## Naechster sinnvoller Block

```text
CAN-24: Sound-Migration Candidate 1 vorbereiten
```

Ziel: einen echten Sound-Kandidaten nur per Dry-Run pruefbar machen, ohne produktive Ausfuehrung zu aendern.
