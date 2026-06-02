# CAN-24.17 - Shadow-Hook enabled=true Test vorbereitet

## Zweck

CAN-24.17 bereitet den kontrollierten lokalen Shadow-DryRun-Test mit `enabled=true` vor.

## Wichtig

Der Backend-Code bleibt weiterhin default-sicher:

```text
enabled default: false
```

CAN-24.17 setzt `enabled=true` nicht dauerhaft im Code. Stattdessen gibt es ein lokales Testscript, das:

```text
1. Status liest
2. enabled=true fuer genau bauernweisheit setzt
3. Auto-Test ausfuehrt
4. enabled=false direkt wieder setzt
5. Status danach liest
```

## Neues Testscript

```text
tools/can24_17_shadow_enabled_test.cmd
```

## Ausfuehrung

Im Repo-Root:

```bat
tools\can24_17_shadow_enabled_test.cmd
```

## Erwartung im Auto-Test

```text
rewardKey: bauernweisheit
skipped: false
accepted: true
queueTouched: false
audioTouched: false
productiveMigration: false
```

## Erwartung im Endstatus

```text
enabled: false
lastAutoResult.accepted: true
lastAutoResult.queueTouched: false
lastAutoResult.audioTouched: false
lastAutoResult.productiveMigration: false
```

## Sicherheitsgrenze

```text
Nur Shadow-DryRun
kein Sound-Play
keine Queue
keine produktive Reward-Ausfuehrung ueber Bus
keine Redemption-Aenderung
keine Twitch-Aktion
keine produktive Migration
kein Hook fuer alle Rewards
```

## Naechster Schritt

Nach lokalem Test:

```text
CAN-24.18: Testergebnis enabled=true Shadow-DryRun dokumentieren.
```

Erst danach darf entschieden werden, ob ein echter Execute-/Redemption-Shadow-Test sinnvoll ist.
