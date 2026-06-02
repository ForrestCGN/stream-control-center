# CAN-24.16 - Entscheidung: enabled=true fuer einen kontrollierten Shadow-DryRun-Test

## Zweck

CAN-24.16 trifft die Entscheidung fuer den naechsten kleinen Testschritt.

## Entscheidung

Ein kontrollierter lokaler Test mit `enabled=true` darf vorbereitet werden.

## Strenge Grenze

Der Test darf nur fuer genau einen Reward-Key gelten:

```text
rewardKey: bauernweisheit
```

## Erlaubt im naechsten Schritt

```text
enabled=true fuer Shadow-Hook setzen
nur fuer rewardKey bauernweisheit
nur ein lokaler Diagnose-/Shadow-DryRun-Test
kein produktiver Bus-Sound-Play
keine Queue
keine Twitch-Aktion
keine Redemption-Aenderung
keine produktive Migration
Legacy-Flow bleibt unveraendert
```

## Nicht erlaubt

```text
kein automatischer Hook fuer alle Rewards
kein dauerhafter produktiver Migrationsschalter
kein Ersetzen von /api/sound/play
kein Auto-Fulfill/Refund/Cancel
kein Queue-Clear
kein OBS-/Overlay-Repair
kein Recovery-/SafetyStop-Autofix
```

## Entscheidungsbasis

CAN-24.15 hat bestaetigt:

```text
hookInstalled: true
executeHookInstalled: true
eventSubHookInstalled: false
enabled: false
rewardKey: bauernweisheit
auto-test skipped: true
reason: hook_disabled
queueTouched: false
audioTouched: false
productiveMigration: false
```

## Testziel fuer den naechsten Schritt

Nach Aktivierung soll ein manueller Auto-Test fuer `bauernweisheit` zeigen:

```text
skipped: false
accepted: true
queueTouched: false
audioTouched: false
productiveMigration: false
```

## Sicherheitsanforderung

Nach dem Test muss der Status klar sichtbar sein. Eine spaetere Deaktivierung muss jederzeit moeglich bleiben.

## Naechster Schritt

```text
CAN-24.17: enabled=true fuer genau bauernweisheit vorbereiten und lokalen Auto-Test ausfuehren lassen.
```
