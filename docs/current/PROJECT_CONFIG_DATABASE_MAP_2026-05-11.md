# PROJECT CONFIG AND DATABASE MAP - STEP259 Update

DeathCounter nutzt jetzt produktiv die vorbereiteten DB-Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Storage-Verhalten:

```text
activeStorage: database
updateState(): DB-only
readState(): DB-first mit JSON-Fallback
JSON: manuelles Backup-/Exportformat
```

Manuelle JSON-Ausgabe:

```text
/api/deathcounter/v2/storage/backup
/api/deathcounter/v2/storage/export?mode=backup
/api/deathcounter/v2/storage/export?mode=export
```

Command-API:

```text
!dcount backup
!dcount export
```

Globale DB-Regel bleibt gültig:

- `app.sqlite` niemals ersetzen oder neu bauen.
- Schemaänderungen nur sanft per Migration / `CREATE TABLE IF NOT EXISTS`.
- Neue DB-Zugriffe bevorzugt über `backend/core/database.js` oder vorhandene Helper kapseln.
