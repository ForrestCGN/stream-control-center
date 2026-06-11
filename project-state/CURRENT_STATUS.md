# CURRENT_STATUS – stream-control-center

Stand: 2026-06-11

## Aktueller bestätigter Hauptstand

```text
STEP212 / LWG-5.4 – Points Command Runtime kontrollierter Test vorbereitet
```

Der aktuell bestätigte technische Bereich betrifft das Modul **Loyalty / Kekskrümel / Loyalty Games** mit:

```text
STEP209 / LWG-5.1 – Loyalty Safety Layer + Gamble vorbereitet
STEP210 / LWG-5.2 – API-/Status-Cleanup
STEP211 / LWG-5.3 – Doku-/Projektstand aktualisiert
STEP212 / LWG-5.4 – Points Command Runtime Testscript + Doku
```

## Bestätigter Runtime-Stand

```text
backend/modules/loyalty.js
version: 0.1.13
step: STEP210

backend/modules/loyalty_games.js
moduleVersion: 0.2.2
moduleBuild: STEP_LWG_5_2_STATUS_CLEANUP

backend/modules/loyalty_games/gamble.js
neu seit LWG-5.1, vorbereitet und angebunden
```

STEP212 enthält bewusst **keine Runtime-JS-Änderung**. Es ergänzt Doku und ein kontrolliertes Testscript.

## STEP212 Testziel

```text
Test_STEP212_LWG5_4_points_command_runtime_ForrestCGN.ps1
```

Das Script soll nach StepDone und Backend-Neustart prüfen:

```text
- Loyalty-Status erreichbar
- verfügbare Kekskrümel und Ranking erreichbar
- !punkte ist als Command vorhanden
- Disabled-Guard greift, solange !punkte aus ist
- !punkte kann temporär für Runtime-Test aktiviert werden
- !punkte liefert nur verfügbare Kekskrümel + Rankingdaten
- !points Alias funktioniert
- !punkte @user wird für Nicht-Mods blockiert
- ursprünglicher Command-Status wird wiederhergestellt
```

## Bestätigte Tests aus dem Live-System bis STEP210

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

STEP210 erhöht die Dateien auf:

```text
loyalty.js 0.1.13
loyalty_games.js 0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
```

### Commands deaktiviert

Bestätigt:

```text
gamble      enabled False permission everyone
punkte      enabled False permission everyone
givepoints  enabled False permission mod
setpoint    enabled False permission streamer
```

### Available Balance

Bestätigt für `forrestcgn`:

```text
balance: 3400
reserved: 0
available: 3400
rank: 2
rankKeys: rank, rankTotal, row
```

### Can-Afford Schutz

Bestätigt:

```text
amount: 9999999
available: 3400
canAfford: False
missing: 9996599
reason: insufficient_available_balance
```

### Gamble disabled Schutz

Bestätigt:

```text
POST /api/loyalty/games/gamble/play
Input: testdummy_gamble, input=1
Ergebnis: HTTP 403
error: gamble_disabled
```

## Wichtige Arbeitsregeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite-Datei ersetzen oder überschreiben.
Keine Tokens/.env/Secrets in ZIPs aufnehmen.
Bestehende Transaktionen/Audit-Daten nicht löschen.
Bei weiteren Änderungen zuerst echte aktuelle Dateien/Repo/Live-Stand prüfen.
Module aktiv halten; Commands separat freigeben.
Multitexte über DB/Helper, dashboardfähig, CGN-/Altersheim-/Heimleitung-/Rentner-Stil.
EventBus/Communication Bus und Heartbeats berücksichtigen.
Bei Tests nur notwendige Felder ausgeben, keine riesigen Dumps.
Nach jedem Code-/Doku-STEP stepdone.cmd ausführen.
```


## STEP212a / LWG-5.4a – Points Runtime Testscript Parserfix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```
