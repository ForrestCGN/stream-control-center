# CAN-24.13 - Entscheidung: begrenzter Shadow-Hook

## Zweck

CAN-24.13 trifft die Entscheidung fuer den naechsten technischen Schritt.

## Entscheidung

Ein streng begrenzter Shadow-Hook darf im naechsten CAN-Schritt vorbereitet werden.

## Scope

Der Shadow-Hook darf nur fuer genau einen Reward-Key vorbereitet werden:

```text
rewardKey: bauernweisheit
mediaAssetId: 1423
file: media/channelpoints/general/bauernweisheit.mp3
```

## Wichtig

CAN-24.13 selbst baut noch keinen Hook. Dieser Schritt ist eine Entscheidungs-/Boundary-Dokumentation.

## Erlaubt fuer CAN-24.14

```text
Shadow-Hook nur fuer rewardKey bauernweisheit vorbereiten
Default weiterhin sicher/aus oder explizit kontrolliert
Legacy-Flow bleibt produktiv unveraendert
Shadow-Hook fuehrt nur DryRun aus
Dashboard-/Statusauswertung sichtbar machen
lastShadowResult speichern
sicher abbrechen, wenn Reward-Key nicht exakt passt
```

## Nicht erlaubt

```text
kein Sound-Play
keine Queue-Aktion
keine Redemption-Aenderung
keine Twitch-Aktion
kein automatischer Shadow-Mitulauf fuer alle Rewards
keine produktive Sound-Migration
kein Ersatz des Legacy-/api/sound/play-Flows
kein Auto-Fulfill/Refund/Cancel
```

## Entscheidungsbasis

CAN-24.12 hat bestaetigt:

```text
Channelpoints Candidate DryRun accepted: true
statusCode: 200
mediaId/mediaAssetId Mapping funktioniert
queueTouched: false
audioTouched: false
```

## Sicherheitsanforderungen fuer CAN-24.14

```text
Hook muss hart auf rewardKey bauernweisheit begrenzt sein.
Hook muss alle anderen Rewards ueberspringen.
Hook darf nur validateChannelpointsSoundMigrationCandidateDryRun nutzen.
Hook darf keine Queue oder Audio-Route aufrufen.
Hook darf bei Fehlern nur Diagnose-State setzen.
Hook muss in Status/Matrix sichtbar sein.
Hook muss abschaltbar sein.
```

## Erwarteter Test nach CAN-24.14

```text
Ein echter Legacy-Reward bleibt produktiv unveraendert.
Parallel dazu wird fuer bauernweisheit ein Shadow-DryRun-Diagnoseergebnis geschrieben.
Sound/Queue bleiben unangetastet.
```

## Naechster Schritt

```text
CAN-24.14: Shadow-Hook fuer genau rewardKey bauernweisheit vorbereiten.
```
