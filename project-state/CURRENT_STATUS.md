# CURRENT_STATUS – stream-control-center

Stand: 2026-06-11

## Aktueller bestätigter Hauptstand

```text
STEP211 / LWG-5.3 – Dokumentation und Handoff für Loyalty Safety + Gamble Prepared
```

Der aktuell bestätigte technische Bereich betrifft das Modul **Loyalty / Kekskrümel / Loyalty Games** mit:

```text
STEP209 / LWG-5.1 – Loyalty Safety Layer + Gamble vorbereitet
STEP210 / LWG-5.2 – API-/Status-Cleanup
STEP211 / LWG-5.3 – Doku-/Projektstand aktualisiert
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

## Bestätigte Fachlogik LWG-5.1 / LWG-5.2

### Zentrale verfügbare Kekskrümel

```text
verfügbare Kekskrümel = aktiver Kontostand - offene Reservierungen
```

Bestätigt:

```text
- getAvailableBalance vorhanden
- canAfford vorhanden
- spendPointsSafely / awardPoints vorbereitet
- reserve/release/commit für spätere Duell-/Raffle-Flows vorbereitet
- Ranking nach verfügbaren Kekskrümeln vorbereitet
```

### Points Commands vorbereitet

Vorbereitet, aber deaktiviert:

```text
!punkte / !points
!givepoints
!setpoint
```

Regel für `!punkte`:

```text
- User sieht nur verfügbare Kekskrümel.
- Ausgabe soll zusätzlich Platzierung und Gesamtzahl der gewerteten User enthalten.
- Ranking nach verfügbaren Kekskrümeln.
```

### Gamble vorbereitet

Vorbereitet, aber nicht als Chat-Command aktiv:

```text
!gamble 100
!gamble 50%
```

Sicherheitsregeln:

```text
- Einsatz nie höher als verfügbare Kekskrümel.
- Ergebnis backendseitig und nicht vorhersagbar.
- Kein Math.random für Ergebnislogik.
- Kein Browser-/Overlay-Zufall.
- Keine Berechnung aus Zeit, Username, Counter oder Balance.
- Ergebnis erst nach gültiger Prüfung/Buchung veröffentlichen.
```

### Modul aktiv vs. Command aktiv

Neue verbindliche Regel:

```text
Module bleiben aktiv/online und senden Status/Heartbeat.
Chat-Commands werden separat aktiviert/deaktiviert.
```

Das bedeutet:

```text
loyalty.js       aktiv
loyalty_games.js aktiv
gamble.js        vorbereitet/online
!gamble          deaktiviert
!punkte          deaktiviert
```

## Bestätigte Tests aus dem Live-System

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

## Weiterhin bestätigter Giveaways-Stand

Der vorherige bestätigte Stand bleibt gültig:

```text
STEP LWG-4Q.11 – Manual Winner Flow and Prize Quantity Cleanup
```

Wichtig: LWG-5 hat keine bestehende Giveaway-Funktionalität entfernt.

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
