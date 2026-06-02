# CAN-25.0 - Entscheidung: Sound-Shadow Dashboard-/Bus-Diagnose verbessern

## Zweck

CAN-25.0 startet die naechste Stufe nach dem Abschluss von CAN-24.

CAN-24 hat die Sound-Shadow-Stufe technisch erfolgreich abgeschlossen. CAN-25 soll nun nicht direkt produktiv migrieren, sondern zuerst die Sichtbarkeit im Dashboard und in der Bus-Diagnose verbessern.

## Entscheidung

Die naechste Richtung ist:

```text
B) Dashboard/Bus-Diagnose fuer Sound-Shadow verbessern
```

## Warum diese Richtung

Diese Richtung ist sicherer als eine direkte produktive Migration, weil sie:

```text
keinen Sound abspielt
keine Queue veraendert
keine Twitch-/Redemption-Aktion ausfuehrt
keinen Produktivpfad ersetzt
keine Migration aktiviert
```

Gleichzeitig hilft sie, den aktuellen Shadow-Status besser zu ueberwachen.

## Ausgangslage aus CAN-24

Bestaetigt:

```text
mediaId-DryRun erfolgreich
Shadow-Hook Disabled-Test erfolgreich
enabled=true Auto-Test erfolgreich
Execute-Shadow-Test erfolgreich
Legacy-Flow weiterhin funktionsfaehig
Shadow-Hook ohne Queue/Audio-Touch
Endstatus enabled=false
```

## Ziel von CAN-25

CAN-25 soll die vorhandenen Diagnose-Informationen besser sichtbar machen.

Moegliche Anzeigeziele:

```text
Sound-Shadow Summary Card
Reward-Key / Kandidat / mediaAssetId
enabled Status
hookInstalled / executeHookInstalled / eventSubHookInstalled
attempts / okCount / failedCount / skipped
lastAutoResult accepted/skipped/reason
queueTouched / audioTouched / productiveMigration
Legacy-Flow Hinweis
Deaktivierungs-Hinweis
naechste sichere Aktion
```

## Nicht-Ziel

CAN-25.0 ist noch kein Code-Umbau.

Weiterhin nicht erlaubt:

```text
keine produktive Sound-Bus-Migration
kein produktiver Sound-Bus-Play
kein Hook fuer alle Rewards
kein EventSub-/Twitch-Redemption-Test
keine Queue-Aktion
keine Twitch-/Redemption-Aenderung
kein dauerhaftes enabled=true
```

## Geplanter naechster Schritt

```text
CAN-25.1: vorhandene Dashboard-/Bus-Diagnose-Daten fuer Sound-Shadow inspizieren und festlegen, welche Felder sichtbar fehlen.
```

## Danach moegliche Umsetzung

Nach CAN-25.1 kann ein kleiner Umsetzungsschritt folgen:

```text
CAN-25.2: Dashboard Sound-Shadow Summary Card verbessern
```

oder falls bereits genug sichtbar ist:

```text
CAN-25.2: Abschluss/Keine UI-Aenderung noetig
```

## Sicherheitsregel

Alle CAN-25-Schritte bleiben zunaechst read-only/UI-orientiert.

Produktive Migration bleibt bis zu einem separaten Go-Schritt blockiert.
