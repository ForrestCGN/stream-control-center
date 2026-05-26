# STEP258 - DeathCounter Active Database Storage mit JSON-Fallback

Stand: 2026-05-11

## Ziel

DeathCounter V2 nutzt die vorbereiteten und importierten DB-Tabellen jetzt als aktive Storage-Quelle, ohne die bestehende API-, Overlay- oder Streamer.bot-Struktur zu ändern.

## Umsetzung

- `readState()` liest bevorzugt aus den importierten DB-Tabellen.
- Wenn die DB nicht lesbar oder nicht vorbereitet ist, faellt `readState()` auf `deathcounter.v2.json` zurueck.
- `updateState()` schreibt bei Aenderungen in die DB und synchronisiert danach weiterhin `deathcounter.v2.json`.
- JSON bleibt dadurch als Fallback-/Backup-Datei aktuell.
- Es wurde kein optionaler Storage-Schalter eingebaut.

## Aktiver Storage

```text
configuredStorage: database
activeStorage: database, wenn DB lesbar ist
fallbackStorage: json_state_file
dualWriteEnabled: true
jsonFallbackEnabled: true
```

## Bewusst nicht geaendert

```text
- keine neue Dashboard-UI
- keine Overlay-Aenderung
- keine Streamer.bot-Aenderung
- kein optionaler Storage-Mode-Schalter
- kein Entfernen der JSON-Datei
- kein Entfernen bestehender Preview-/Validation-/Consistency-Routen
```

## Wichtige Routen nach STEP258

```text
GET /api/deathcounter/v2/status
GET /api/deathcounter/v2/config
GET /api/deathcounter/v2/settings
GET /api/deathcounter/v2/storage/read-test
GET /api/deathcounter/v2/storage/consistency
GET /api/deathcounter/v2/integration-check
```

## Test-Erwartung

```text
active_database_storage.ok: true
activeStorage: database
dualWriteEnabled: true
jsonFallbackEnabled: true
integration-check errors: 0
```
