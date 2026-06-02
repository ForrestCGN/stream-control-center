# CAN-24.20 - Entscheidung: echter Execute-/Redemption-Shadow-Test

## Zweck

CAN-24.20 trifft die Entscheidung fuer den naechsten Testschritt nach dem erfolgreichen enabled=true Shadow-DryRun-Test.

## Entscheidung

Ein echter Execute-/Redemption-Shadow-Test darf im naechsten CAN-Schritt vorbereitet werden.

## Strenge Grenze

Der Test darf nur fuer genau diesen Reward gelten:

```text
rewardKey: bauernweisheit
mediaAssetId: 1423
```

## Was im naechsten Schritt erlaubt ist

```text
enabled=true temporaer nur fuer bauernweisheit
ein kontrollierter lokaler Execute-/Redemption-Shadow-Test
Legacy-Flow bleibt produktiv und unveraendert
Shadow-Hook schreibt nur Diagnose/DryRun
Auto-Deaktivierung nach dem Test
Status danach auslesen und dokumentieren
```

## Was weiterhin nicht erlaubt ist

```text
keine produktive Sound-Migration
kein produktiver Sound-Bus-Play
kein Queue-Touch durch Shadow
keine Twitch-/Redemption-Aenderung durch Shadow
kein Hook fuer alle Rewards
kein dauerhaftes enabled=true
kein Ersatz von /api/sound/play
kein Auto-Fulfill/Refund/Cancel
kein Recovery-/SafetyStop-/OBS-Repair
```

## Entscheidungsbasis

CAN-24.19 hat bestaetigt:

```text
enabled temporaer true
auto-test skipped:false
accepted:true
queueTouched:false
audioTouched:false
productiveMigration:false
enabled danach false
```

## Ziel des naechsten Tests

Der naechste Test soll bestaetigen, dass bei einer echten lokalen Ausfuehrung von `bauernweisheit`:

```text
der bestehende Legacy-Flow weiterhin laeuft
der Shadow-Hook parallel nur DryRun/Diagnose schreibt
der Shadow-Hook keine Queue und kein Audio beruehrt
der Hook danach wieder deaktiviert ist
```

## Wichtiger Hinweis

Ein echter Execute-Test kann den bisherigen produktiven Legacy-Pfad ausloesen, wenn er ueber die normale Execute-Route laeuft. Das ist kein Sound-Bus-Play, aber es kann ueber den bestehenden `/api/sound/play`-Pfad einen Sound ausloesen. Deshalb muss der naechste Schritt sehr klar zwischen diesen Dingen unterscheiden:

```text
Legacy-Sound ueber bestehende produktive Route: moeglich beim echten Execute-Test
Shadow-Sound-Bus-Play: weiterhin verboten
Shadow-Queue/Audio-Touch: weiterhin verboten
```

## Naechster Schritt

```text
CAN-24.21: Testplan/Script fuer genau einen lokalen Execute-/Redemption-Shadow-Test vorbereiten.
```
