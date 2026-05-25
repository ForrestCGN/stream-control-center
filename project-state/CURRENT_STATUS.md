# CURRENT_STATUS – STEP416 Alert EventBus Baseline

## Aktueller Stand

Nach STEP412–STEP415 ist das Sound-System parallel an den Communication Bus angebunden und hat einen Debug-Consumer mit `sound.event_output`.

Mit STEP416 bekommt das Alert-System eine erste eigene EventBus-Baseline:

```text
channel: alert.status
capability: alert.event_output
busMode: legacy_parallel
```

## Ziel

Alerts werden beobachtbar und später korrelierbar, ohne den bestehenden produktiven Flow zu ersetzen.

## Bestehender produktiver Flow bleibt

```text
Alert-System
→ Alert-Regeln/Queue
→ Sound-System Bundle für Alert-Sound + TTS
→ Legacy Alert-Overlay / bestehende Ausgabewege
```

## Neue Routen

```text
/api/alerts/eventbus/status
/api/alerts/eventbus/test
/api/alerts/eventbus/reset
```

## Nicht geändert

- keine Queue-Änderung
- keine Sound-System-Änderung
- keine Alert-TTS-Änderung
- keine Bundle-/Lock-Logik-Änderung
- keine DB-Migration
- kein Overlay-Design
