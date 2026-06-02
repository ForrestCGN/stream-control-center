# CAN-24.21 - Lokaler Execute-Shadow-Test vorbereitet

## Zweck

CAN-24.21 bereitet den kontrollierten lokalen Execute-Shadow-Test fuer genau `bauernweisheit` vor.

## Wichtig

Dieser Schritt liefert nur Testscript und Dokumentation.

## Neues Script

```text
tools/can24_21_execute_shadow_test.cmd
```

## Was das Script macht

```text
1. Status vorher lesen
2. Shadow-Hook fuer genau bauernweisheit auf enabled=true setzen
3. bestehenden Legacy-Execute-Pfad fuer bauernweisheit aufrufen
4. Shadow-Hook wieder auf enabled=false setzen
5. Status danach lesen
```

## Wichtige Unterscheidung

Der Test ruft den bestehenden Legacy-Execute-Pfad auf:

```text
GET /api/channelpoints/execute?reward=bauernweisheit
```

Dadurch kann der normale Sound ueber den bestehenden produktiven Legacy-Pfad abgespielt werden:

```text
/api/sound/play
```

Das ist ausdruecklich:

```text
kein produktiver Sound-Bus-Play
keine Sound-Bus-Migration
kein Queue-Touch durch den Shadow-Hook
```

## Shadow-Erwartung

Im Endstatus soll stehen:

```text
enabled: false
lastAutoResult.accepted: true
lastAutoResult.queueTouched: false
lastAutoResult.audioTouched: false
lastAutoResult.productiveMigration: false
```

## Sicherheit

```text
Nur rewardKey bauernweisheit
Shadow bleibt DryRun/Diagnose
Auto-Deaktivierung danach
Kein Hook fuer alle Rewards
Keine Twitch-Write-Aktion durch Shadow
Keine Redemption-Aenderung durch Shadow
Keine produktive Sound-Bus-Migration
```

## Lokale Ausfuehrung

Im Repo-Root:

```bat
tools\can24_21_execute_shadow_test.cmd
```

Das Script fragt vor dem echten Legacy-Execute-Test nach einer bestaetigenden Taste.

## Nicht enthalten

CAN-24.21 enthaelt noch keinen echten EventSub-/Twitch-Redemption-Test.

Ein EventSub-Test waere riskanter, weil dort je nach Config Completion-/Statuslogik greifen kann. Dieser Schritt bleibt daher bewusst beim lokalen Execute-Test.

## Naechster Schritt

Nach lokaler Ausgabe:

```text
CAN-24.22: Execute-Shadow-Test Ergebnis auswerten und dokumentieren.
```
