# NEXT_STEPS

## Empfohlener naechster Block

```text
CAN-24: Sound-Migration Candidate 1 vorbereiten
```

## Ziel

Einen echten Sound-Kandidaten aus Channelpoints/Caller-Liste nehmen und nur per Dry-Run pruefbar machen.

## Vorgehen

```text
1. /api/channelpoints/bus/request-readiness auswerten.
2. Einen Kandidaten mit plannedBusCommand = sound.play.request auswaehlen.
3. Payload gegen /api/sound/eventbus/command/dry-run pruefen.
4. Ergebnis im Dashboard sichtbar machen.
5. Keine produktive Ausfuehrung umstellen.
```

## Alternative naechste Arbeit

```text
Dashboard-Bus-Matrix UX Cleanup / Gruppierung
```

## Weiter blockiert

```text
Recovery/Selbstheilung erst nach SafetyStop/Confirm/Rollen/Audit.
```
