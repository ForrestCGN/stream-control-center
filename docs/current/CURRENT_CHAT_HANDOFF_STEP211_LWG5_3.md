# CURRENT CHAT HANDOFF – STEP211 / LWG-5.3

Stand: 2026-06-11

## Zweck

Dieser Handoff dokumentiert den aktuellen Chat-/Arbeitsstand zum Loyalty-/Kekskrümel-System nach STEP209/STEP210 und vor den nächsten Tests/Freigaben.

## Repo / System

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Backend: http://127.0.0.1:8080
SQLite produktiv: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Zuletzt erstellte Pakete

```text
loyalty_step209_lwg5_1_gamble_prepared.zip
loyalty_step210_lwg5_2_status_cleanup.zip
loyalty_step211_lwg5_3_documentation_handoff.zip
```

## Wichtige Regel für Tests

Vor jedem Test:

```text
1. ZIP mit echten Zielpfaden nach D:\Git\stream-control-center entpacken.
2. stepdone.cmd ausführen.
3. Backend neu starten, falls JS-Dateien geändert wurden.
4. Erst dann Status/API testen.
```

Bei Doku-only STEP211 ist kein Backend-Neustart wegen Doku nötig.

## STEP209 / LWG-5.1

Umgesetzt:

```text
- Loyalty Safety Layer
- verfügbare Kekskrümel = Balance - offene Reservierungen
- canAfford / spendPointsSafely / awardPoints
- Reservierungen für spätere Duell-/Raffle-Flows
- Ranking nach verfügbaren Kekskrümeln
- !punkte / !points vorbereitet, disabled
- !givepoints vorbereitet, disabled
- !setpoint vorbereitet, disabled
- !gamble vorbereitet, disabled
- Gamble-Datei backend/modules/loyalty_games/gamble.js
- DB-Multitexte im CGN-/Altersheim-/Heimleitung-/Rentner-Stil vorbereitet
```

## STEP210 / LWG-5.2

Umgesetzt:

```text
- API-/Status-Cleanup
- Modulstatus trennt Modul/Spiel/Command
- Module sollen online/aktiv bleiben
- Commands bleiben separat deaktiviert
- rank.rankTotal zusätzlich dashboardfreundlich als total vorgesehen
- can-afford amount zusätzlich als required vorgesehen
```

Versionen:

```text
loyalty.js: 0.1.13 / STEP210
loyalty_games.js: 0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
```

## STEP211 / LWG-5.3

Doku aktualisiert:

```text
docs/modules/README.md
docs/modules/loyalty.md
docs/modules/loyalty_games.md
docs/current/CURRENT_CHAT_HANDOFF_STEP211_LWG5_3.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Keine Runtime-Änderung.

## Bestätigte Live-Tests aus diesem Chat

### Status

```text
/api/loyalty/status
module: loyalty
version: 0.1.12 beim STEP209-Test
mode: shadow
enabled: True
currencyName: Kekskrümel
streamElementsStillActive: True
```

```text
/api/loyalty/games/status
module: loyalty_games
moduleVersion: 0.2.1 beim STEP209-Test
moduleBuild: STEP_LWG_5_1_GAMBLE_PREPARED
enabled: True
lastError: leer
```

### Commands disabled

```text
gamble      enabled False permission everyone targetUrl /api/loyalty/games/runtime/chat-command
punkte      enabled False permission everyone targetUrl /api/loyalty/runtime/points-command
givepoints  enabled False permission mod      targetUrl /api/loyalty/runtime/points-command
setpoint    enabled False permission streamer targetUrl /api/loyalty/runtime/points-command
```

### Available Balance

```text
user: forrestcgn
balance: 3400
reserved: 0
available: 3400
rank: 2
rankKeys: rank, rankTotal, row
```

### Can-Afford

```text
amount: 1
available: 3400
canAfford: True
reason: ok
```

```text
amount: 9999999
available: 3400
canAfford: False
missing: 9996599
reason: insufficient_available_balance
```

### Gamble disabled Schutz

```text
POST /api/loyalty/games/gamble/play
Input: testdummy_gamble, input=1
Ergebnis: HTTP 403
error: gamble_disabled
statusCode: 403
```

## Aktuelle Design-/Funktionsentscheidungen

```text
!punkte zeigt nur verfügbare Kekskrümel + Platzierung.
Ranking nach verfügbaren Kekskrümeln.
!punkte @user nur für Mod/Streamer-Kontext.
!setpoint nur Streamer/Owner und per Differenzbuchung.
!givepoints ab Mod/Streamer.
!gamble zuerst, Roulette später separat.
!gamble unterstützt Betrag und Prozent, z. B. !gamble 100 / !gamble 50%.
Gamble-Ergebnis nicht vorhersagbar und nur backendseitig.
```

## Verbindliche Stil-/Textregel

Alle neuen Loyalty-/Games-/Points-Texte:

```text
- DB-basiert
- dashboardfähig
- Varianten pro Textkey
- CGN-/Altersheim-/Heimleitung-/Rentner-Stil
- keine finalen hardcodierten Chattexte
```

## EventBus / Heartbeat

Wichtig:

```text
Module aktiv/online halten.
Commands separat aktivieren/deaktivieren.
Module sollen Status/Heartbeat liefern und Events über vorhandenen Communication Bus publizieren.
Kein paralleler Bus/Helper.
```

## Nächster Arbeitsschritt

```text
STEP212 / LWG-5.4 – Points Command Runtime kontrolliert testen/freigeben
```

Empfohlen:

```text
1. STEP210/STEP211 übernehmen und StepDone ausführen.
2. Backend nach STEP210 neu starten.
3. Status kurz prüfen.
4. Points Runtime direkt per API/Test-Execute prüfen.
5. Erst danach !punkte / !points aktivieren.
6. Danach !givepoints und !setpoint einzeln testen.
7. Danach erst Gamble Shadow-Test planen.
```

## Wichtig für neuen Chat

Nicht raten. Zuerst echte Dateien/GitHub/dev oder Live-ZIP prüfen.

Keine Funktionalität entfernen.
Keine produktive DB ersetzen.
Keine Secrets/ZIPs ins Repo.
Keine Commands alle auf einmal aktivieren.
Tests mit kurzen Feld-Ausgaben.
