# CAN-24.14 - Shadow-Hook fuer genau einen Reward vorbereitet

## Zweck

CAN-24.14 installiert einen streng begrenzten Shadow-Hook im Channelpoints-Execute-Pfad.

## Grenze

```text
Nur rewardKey: bauernweisheit
Nur DryRun
Kein Sound-Play
Keine Queue
Keine Redemption-Aenderung
Keine Twitch-Aktion
Keine produktive Migration
Legacy-Flow bleibt der produktive Pfad
```

## Verhalten

Der Hook ist installiert, aber standardmaessig deaktiviert.

```text
hookInstalled: true
enabled: false
allowedRewardKey: bauernweisheit
```

Wenn er aktiviert wird und `executeReward()` genau `bauernweisheit` ausfuehrt, wird zusaetzlich ein Shadow-DryRun ausgefuehrt:

```text
validateChannelpointsSoundMigrationCandidateDryRun({ rewardKey: "bauernweisheit" })
```

Alle anderen Rewards werden uebersprungen.

## Neue/erweiterte Diagnose

```text
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-status
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-test
POST /api/channelpoints/bus/sound-shadow-dry-run/auto-test
GET  /api/channelpoints/bus/sound-shadow-dry-run/auto-config
POST /api/channelpoints/bus/sound-shadow-dry-run/auto-config
```

## Aktivierung fuer lokalen Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-config?rewardKey=bauernweisheit&enabled=false" | ConvertTo-Json -Depth 10
```

Bewusst zuerst `enabled=false`. Fuer einen spaeteren echten Hook-Test muss explizit entschieden werden, ob `enabled=true` erlaubt ist.

## Sicherer manueller Auto-Test

Solange `enabled=false` ist, muss der Test `skipped: true` und `reason: hook_disabled` liefern:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-test?rewardKey=bauernweisheit" | ConvertTo-Json -Depth 10
```

## Naechster Schritt

```text
CAN-24.15: Lokalen Shadow-Hook-Status testen und danach entscheiden, ob der Hook fuer bauernweisheit testweise enabled=true bekommen darf.
```
