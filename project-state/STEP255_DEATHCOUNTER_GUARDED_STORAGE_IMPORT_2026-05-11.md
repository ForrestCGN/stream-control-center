# STEP255 - DeathCounter Guarded Storage Import

Stand: 2026-05-11

DeathCounter V2 hat jetzt einen geschuetzten Import-Endpunkt, der den aktuellen JSON-State einmalig in die vorbereiteten DB-Tabellen schreiben kann.

Neue Route:

```text
POST /api/deathcounter/v2/storage/import
```

Schutzregeln:

```text
confirm=IMPORT_DEATHCOUNTER_V2 erforderlich
Zieltabellen muessen leer sein
STEP254-Validation muss fehlerfrei und importbereit sein
Vor dem Import wird standardmaessig ein JSON-Backup erstellt
Aktiver Storage bleibt json_state_file
Keine Umstellung der produktiven RIP/DEL/TODE-Logik
Keine Overlay- oder Streamer.bot-Aenderung
```

Importierte Tabellen bei erfolgreichem Import:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
```

Nicht rekonstruiert/importiert:

```text
deathcounter_events
```

Grund: Historische Einzelereignisse sind aus `deathcounter.v2.json` nicht sicher rekonstruierbar.

Wichtig:

```text
Der Import schreibt nur in vorbereitete DB-Tabellen.
JSON bleibt weiterhin aktive produktive Quelle.
Der spätere Storage-Wechsel braucht einen eigenen neuen STEP.
```

Test nach Deploy:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/validate?limit=20" | ConvertTo-Json -Depth 30
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/deathcounter/v2/storage/import?confirm=IMPORT_DEATHCOUNTER_V2" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```
