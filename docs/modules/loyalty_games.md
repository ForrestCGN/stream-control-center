# Modul: loyalty_games

Stand: 2026-06-11  
Aktueller dokumentierter Stand: STEP211 / LWG-5.3  
Runtime-Basis: STEP210 / LWG-5.2

## Zweck

`loyalty_games` verwaltet Loyalty-Spielsysteme. Bisher enthielt das Modul vor allem Glücksrad-/Wheel-Logik, Presets, Spins/Sessions und Overlay-Anbindung. Seit LWG-5.1 ist zusätzlich das vorbereitete Gamble-Spiel angebunden.

## Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/presets.js
backend/modules/loyalty_games/shared.js
backend/modules/loyalty_games/gamble.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
htdocs/assets/images/loyalty/wheel/*
```

## Aktueller Runtime-Stand

```text
loyalty_games.js
moduleVersion: 0.2.2
moduleBuild: STEP_LWG_5_2_STATUS_CLEANUP
```

## Bestätigte Funktionen vor LWG-5

```text
- Wheel-Status und Config
- Wheel-Spin
- Presets in SQLite
- Preset-Felder
- Copy / Activate / Pause / Finish / Delete
- removeAfterWin als Preset-weite Einstellung
- Spin-Historie
- Overlay-Spin per WebSocket/Event
- Overlay-Heartbeat
- interner startWheelSpin für Giveaway-Claims
```

## Interne Nutzung durch Giveaways

`loyalty_giveaways` nutzt intern:

```text
loyalty_games._private.startWheelSpin(input)
```

Damit wird bei einem Wheel-Giveaway-Claim kein eigenes Rad gebaut, sondern der bestehende Wheel-Spin verwendet.

## Gamble – vorbereitet seit LWG-5.1

Neue Datei:

```text
backend/modules/loyalty_games/gamble.js
```

Geplanter Chat-Command:

```text
!gamble 100
!gamble 50%
```

Aktueller Status:

```text
Modul geladen/online: ja
Gamble vorbereitet: ja
Chat-Command aktiv: nein
```

Wichtig:

```text
Module bleiben aktiv/online.
Commands bleiben deaktiviert, bis sie bewusst freigegeben werden.
```

## Gamble-Config

Aktuell bestätigte Felder:

```text
enabled
mode
minBet
maxBet
allowPercent
minPercent
maxPercent
allowAll
winChancePercent
payoutMultiplier
userCooldownMs
globalCooldownMs
liveOnly
```

Bestätigte Testwerte:

```text
configEnabled: False
minBet: 1
maxBet: 1000
winChancePercent: 47
payoutMultiplier: 2
userCooldownMs: 60000
globalCooldownMs: 0
```

## Gamble-Fairness / Sicherheit

```text
- Ergebnis nur backendseitig.
- Keine Browser-/Overlay-/Streamer.bot-Zufallsentscheidung.
- Keine vorhersehbaren Muster aus Uhrzeit, Username, Counter oder Balance.
- Zufall per crypto.randomInt bzw. serverseitigem Kryptozufall.
- Ergebnis erst nach gültiger Prüfung/Buchung veröffentlichen.
- Einsatz niemals höher als verfügbare Kekskrümel.
```

## Bestätigte Tests

Status:

```text
/api/loyalty/games/status
module: loyalty_games
moduleVersion: 0.2.1 bei STEP209-Test, danach 0.2.2 in STEP210-Paket
moduleBuild: STEP_LWG_5_1_GAMBLE_PREPARED / STEP_LWG_5_2_STATUS_CLEANUP
enabled: True
lastError: leer
```

Gamble disabled Schutz:

```text
POST /api/loyalty/games/gamble/play
Input: testdummy_gamble, input=1
Ergebnis: HTTP 403
error: gamble_disabled
```

Damit ist bestätigt, dass Gamble erreichbar ist, aber bei deaktiviertem Zustand keine Runde gespielt und keine Buchung ausgelöst wird.

## EventBus / Heartbeat

`loyalty_games` nutzt den bestehenden Communication Bus/Status-Muster. Neue Spielereignisse sollen als Events publiziert werden, ohne parallelen Bus zu bauen.

Geplante/erwartete Eventnamen für Gamble:

```text
loyalty.game.gamble.played
loyalty.game.gamble.blocked
loyalty.game.gamble.failed
```

Bei weiteren Schritten prüfen, ob diese Namen exakt im bestehenden Bus-Muster bleiben oder angepasst werden müssen.

## Nicht geändert

```text
- Keine produktive Aktivierung von !gamble.
- Keine Änderung am Giveaway-Wheel-Claim-Verhalten.
- Keine Streamer.bot-Anbindung.
- Keine Abschaltung bestehender Wheel-Funktionen.
- Kein echtes Roulette eingebaut.
```

## Vorgemerkt für später

Echtes Roulette ist bewusst nicht Teil von LWG-5.1/5.2:

```text
!roulette rot 100
!roulette schwarz 100
!roulette grün 100
```

Das bleibt als späteres eigenes Farb-Roulette vorgemerkt.

## Nächster Schritt

```text
STEP212b / LWG-5.4b – Points Command Runtime kontrolliert testen/freigeben
```

Danach erst `!gamble` mit Dummy-/Shadow-Test sauber vorbereiten.


## STEP212b / LWG-5.4b – Points Runtime Testscript Args-Fix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```
