# STEP257 - DeathCounter DB Read-Test / Public-State-Vorschau

Stand: 2026-05-11

## Ziel

DeathCounter V2 kann jetzt testweise aus den importierten DB-Tabellen einen Public-State bauen und diesen gegen den weiterhin aktiven JSON-State vergleichen.

Neue Route:

```text
GET /api/deathcounter/v2/storage/read-test
```

## Verhalten

Die Route liest:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Daraus wird intern eine DeathCounter-State-Struktur gebaut, die mit der bisherigen Public-State-Struktur aus `deathcounter.v2.json` verglichen wird.

## Garantien

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activatesDatabaseStorage: false
activeStorage: json_state_file
```

## Bewusst nicht geändert

```text
- produktive RIP/DEL/TODE-Logik
- produktive /state-/overlay-Leserouten
- Overlay-HTML
- Streamer.bot Actions
- aktiver Storage
- app.sqlite-Struktur außer bereits vorhandenen STEP252-Tabellen
```

## Integration-Check

`/api/deathcounter/v2/integration-check` enthält jetzt zusätzlich:

```text
database_storage_read_test
```

## Testbefehle

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeState=true&limit=20" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

## Erwartung

```text
publicStateMatchesJson: true
validation.errors: 0
switchesStorage: false
activatesDatabaseStorage: false
activeStorage: json_state_file
```

## Naechster sinnvoller Schritt

Erst nach erfolgreichem Live-Test: DB-Lesehelper weiter kapseln oder eine getrennte, weiterhin deaktivierte Storage-Mode-Strategie vorbereiten. Noch nicht produktiv auf DB-Lesen umschalten.
