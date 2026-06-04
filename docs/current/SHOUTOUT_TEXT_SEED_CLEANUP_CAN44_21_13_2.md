# CAN-44.21.13.2 – Shoutout Text Seed Cleanup

## Zweck

Der Import von CAN-44.21.13 hat funktioniert. Die neuen CGN-Altersheimkino-Texte sind in der Datenbank.

Die API seedet aber beim Laden weiterhin alte Default-/Seed-Varianten nach, z. B. alte Rollator-/Shouti-Wagen-Texte. Deshalb zeigt die API aktuell mehr aktive Varianten als gewünscht.

Dieses Cleanup deaktiviert für die bekannten Shoutout-Keys alle aktiven Varianten, die **nicht** in der freigegebenen CAN-44.21.13-Textliste stehen.

## Wichtig

Es wird nichts gelöscht. Alte Seed-/Fallback-Texte werden nur deaktiviert, damit sie nicht wieder zufällig gezogen werden und auch nicht erneut geseedet werden.

## Ziel nach Cleanup

- `auto.greeting`: 5 aktive Varianten
- `shoutout.auto.greeting`: 5 aktive Varianten
- alle anderen betroffenen Keys: 5 aktive Varianten
- keine aktiven Rollator-/Shouti-Wagen-Alttexte mehr

## Befehl

DryRun:

```powershell
cd D:\Git\stream-control-center
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup_shoutout_text_seed_variants_can44_21_13_2.ps1" -DryRun
```

Ausführen:

```powershell
cd D:\Git\stream-control-center
powershell -NoProfile -ExecutionPolicy Bypass -File ".\tools\cleanup_shoutout_text_seed_variants_can44_21_13_2.ps1"
```
