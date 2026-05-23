# CHANGELOG

## STEP274Q – Media Registry Migration Apply Hotfix

- `tools/media_registry_migrate_categories.js` repariert.
- Apply nutzt jetzt zweiphasige DB-Updates gegen `UNIQUE(media_assets.relative_path)` Konflikte.
- Zielpfade werden im Plan eindeutig reserviert.
- Keine Runtime-Funktionen entfernt oder geaendert.
