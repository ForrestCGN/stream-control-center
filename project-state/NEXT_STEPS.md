# NEXT STEP - Nach STEP252 DeathCounter DB-Schema Storage-Grundlage

## Direkt testen

Backend neu starten und prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/config" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/settings" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
- check `database_storage_schema` ist ok
- Tabellen existieren
- activeStorage bleibt `json_state_file`
- migrationPerformed bleibt false
- countsImported bleibt false
```

## Nächster sinnvoller Bau-Step

```text
STEP253: Read-only DB-Snapshot/Export aus JSON vorbereiten, aber weiterhin nicht produktiv verwenden
```

Noch nicht blind bauen:

```text
- JSON-State durch DB ersetzen
- Count-Schreiblogik auf DB umstellen
- app.sqlite neu bauen oder überschreiben
- alte Count-Logik entfernen
- Overlay-Design auf neues CGN-Design migrieren
```
