# Current Chat Handoff - CAN23.6

## Stand

CAN-23.6 abgeschlossen.

## Neu

Dashboard-Button:

```text
Bus-Diagnostics -> Bus-Matrix -> Sound-Bus Dry-Run
```

Der Button nutzt:

```text
POST /api/sound/eventbus/command/dry-run
```

## Ergebnis

Sound-Command-Payload kann manuell validiert werden, ohne Queue/Audio anzufassen.

## Naechster Schritt

```text
Produktive /api/sound/play Logik auf Bus-Request-Kompatibilitaet pruefen.
```
