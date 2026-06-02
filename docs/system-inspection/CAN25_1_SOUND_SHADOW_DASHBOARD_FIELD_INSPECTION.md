# CAN-25.1 - Sound-Shadow Dashboard-/Bus-Diagnose Feldinspektion

## Zweck

CAN-25.1 inspiziert den vorhandenen Stand fuer Dashboard-/Bus-Diagnose und legt fest, welche Sound-Shadow-Felder fuer den naechsten UI-Schritt sichtbar sein sollen.

Dieser Schritt ist Planung/Inspektion.

```text
keine produktive Migration
kein Sound-Play
keine Queue-Aktion
keine Twitch-/Redemption-Aktion
keine Logik-Aenderung am Produktivpfad
```

## Ausgangslage

CAN-24 hat die Sound-Shadow-Stufe abgeschlossen. Die wichtigsten Diagnosewerte existieren bereits im Backend-Status, sind aber im Dashboard noch nicht ausreichend als eigene klare Shadow-Zusammenfassung sichtbar.

## Vorhandene relevante Backend-Quelle

Die wichtigste Quelle ist:

```text
GET /api/channelpoints/bus/sound-shadow-dry-run/auto-status
```

Wichtige vorhandene Felder:

```text
enabled
rewardKey
selectedCandidate
candidateFound
configuredAt
configuredBy
attempts
skipped
okCount
failedCount
lastAutoAt
lastSkipReason
lastAutoResult
exactlyOneReward
autoHookInstalled
eventSubHookInstalled
executeHookInstalled
legacyFlowUnchanged
soundPlay
queueTouched
rewardExecutedViaBus
redemptionChanged
twitchTouched
productiveMigration
safety
routes
updatedAt
```

## Vorhandene Bus-/Matrix-Sicht

Die Bus-Diagnose zeigt bereits verschiedene Modul-/Bus-Zustaende. Fuer Sound-Shadow fehlt als naechster sinnvoller Schritt aber eine kompakte, eindeutig lesbare Summary-Card.

## Gewuenschte Summary-Felder

### Kopfbereich

```text
Titel: Sound-Shadow Status
Reward: bauernweisheit
Status: disabled / ready / test-ok / warning
Letztes Update
```

### Kandidat

```text
candidateFound
rewardKey
title
mediaAssetId
currentExecutionTarget
candidateStatus
blockedReason
```

### Hook-Status

```text
enabled
autoHookInstalled
executeHookInstalled
eventSubHookInstalled
exactlyOneReward
legacyFlowUnchanged
```

### Testzaehler

```text
attempts
skipped
okCount
failedCount
lastAutoAt
lastSkipReason
```

### Letztes Ergebnis

```text
lastAutoResult.ok
lastAutoResult.skipped
lastAutoResult.accepted
lastAutoResult.rewardKey
lastAutoResult.allowedRewardKey
```

### Safety-Flags

```text
queueTouched
audioTouched
soundSystemTouched
rewardExecuted
redemptionChanged
twitchTouched
productiveMigration
soundPlay
rewardExecutedViaBus
```

## UI-Bewertung / Ampel

Die Summary-Card sollte einfache Bewertungen anzeigen:

### Gruen / OK

```text
enabled=false
candidateFound=true
executeHookInstalled=true
eventSubHookInstalled=false
productiveMigration=false
queueTouched=false
redemptionChanged=false
twitchTouched=false
```

### Gelb / Hinweis

```text
enabled=true
lastSkipReason gesetzt
failedCount > 0
candidateFound=false
```

### Rot / Kritisch

```text
productiveMigration=true
redemptionChanged=true
twitchTouched=true
queueTouched=true
eventSubHookInstalled=true
```

## Deaktivierungs-Hinweis

Die UI sollte sichtbar machen, wie Shadow sofort deaktiviert werden kann:

```bat
curl -s "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=bauernweisheit&enabled=false&configuredBy=manual_disable"
```

Das soll zunaechst nur als Hinweis angezeigt werden, nicht als Button mit Schreibaktion.

## Nicht-Ziele fuer CAN-25.2

Der naechste Umsetzungsschritt soll keine Schreibaktion einbauen.

Nicht enthalten:

```text
kein Enable/Disable Button
kein Test-Button
kein Execute-Test Button
kein Sound-Play Button
kein Queue-Reset
kein Migration-Button
```

## Empfohlene CAN-25.2 Umsetzung

```text
Dashboard Sound-Shadow Summary Card in Bus-Diagnostics erweitern
read-only
Daten aus vorhandener Matrix/API nutzen
keine neuen Produktivrouten
keine Schreibaktion
```

## Naechster Schritt

```text
CAN-25.2: Dashboard Sound-Shadow Summary Card read-only verbessern.
```
