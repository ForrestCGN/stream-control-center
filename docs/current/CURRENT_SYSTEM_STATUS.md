# CURRENT_SYSTEM_STATUS - STEP258 Update

DeathCounter V2 nutzt nach STEP258 die importierten DB-Tabellen als aktive Storage-Quelle.

Aktiv:

```text
configuredStorage: database
activeStorage: database, wenn DB lesbar ist
fallbackStorage: json_state_file
dualWriteEnabled: true
jsonFallbackEnabled: true
```

Technisch:

- `readState()` liest DB-first.
- `updateState()` schreibt DB und synchronisiert JSON weiter.
- `deathcounter.v2.json` bleibt als Fallback-/Backup-Datei erhalten.
- Es gibt keinen optionalen Storage-Schalter.
- API-Prefix bleibt `/api/deathcounter/v2`.
- Overlay und Streamer.bot muessen nicht angepasst werden.

Testanker:

```text
GET /api/deathcounter/v2/integration-check
Check: active_database_storage
```

---

# CURRENT_SYSTEM_STATUS - STEP257 Update

DeathCounter V2 hat jetzt einen Read-only-DB-Read-Test.

Neu:

```text
GET /api/deathcounter/v2/storage/read-test
```

Die Route baut aus den importierten DB-Tabellen einen Public-State und vergleicht ihn mit dem weiterhin aktiven JSON-Public-State.

Garantien:

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activatesDatabaseStorage: false
activeStorage: json_state_file
```

Integration-Check enthaelt jetzt zusaetzlich:

```text
database_storage_read_test
```

Nicht geaendert:

```text
produktive RIP/DEL/TODE-Storage-Logik
produktive /state-/overlay-Routen
Overlay-HTML
Streamer.bot Actions
aktiver Storage
```

---

# CURRENT_SYSTEM_STATUS - STEP256 Update

DeathCounter V2 hat jetzt einen Read-only-Konsistenzcheck zwischen produktivem JSON-State und importierten DB-Zeilen.

Neu:

```text
GET /api/deathcounter/v2/storage/consistency
```

Die Route vergleicht:

```text
- deathcounter.v2.json -> erwartete Storage-Zeilen
- deathcounter_players
- deathcounter_games
- deathcounter_counts
- deathcounter_overlay_state
```

Garantien:

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activeStorage: json_state_file
```

Integration-Check enthaelt jetzt zusaetzlich:

```text
database_storage_consistency
```

Nicht geaendert:

```text
produktive RIP/DEL/TODE-Storage-Logik
Overlay
Streamer.bot
aktiver Storage
```

---

# CURRENT_SYSTEM_STATUS - STEP255 Update

DeathCounter V2 hat jetzt einen geschuetzten Import-Endpunkt fuer die vorbereiteten DB-Tabellen.

Neu:

```text
POST /api/deathcounter/v2/storage/import
```

Schutzmechanik:

```text
confirm=IMPORT_DEATHCOUNTER_V2 erforderlich
Zieltabellen muessen leer sein
Validation muss readyForImport=true liefern
JSON-Backup wird standardmaessig erstellt
```

Wichtig:

```text
Der Import schreibt in DB-Tabellen, aber der aktive DeathCounter-Storage bleibt json_state_file.
Es gibt keinen Storage-Wechsel und keine Aenderung an RIP/DEL/TODE/Overlay/Streamer.bot.
```

---

# CURRENT_SYSTEM_STATUS - STEP254 Update

DeathCounter V2 hat jetzt eine Read-only-Validation fuer die spaetere DB-Migration.

Neu:

```text
GET /api/deathcounter/v2/storage/validate
```

Die Route prueft Import-Readiness aus dem aktuellen JSON-State gegen die vorbereiteten DeathCounter-DB-Tabellen, schreibt aber nichts.

Garantien:

```text
readOnly: true
writesDatabase: false
importsCounts: false
switchesStorage: false
activeStorage: json_state_file
```

Integration-Check enthaelt jetzt zusaetzlich:

```text
database_storage_validation
```

Nicht geaendert:

```text
app.sqlite-Dateninhalt
data/deathcounter/deathcounter.v2.json
Overlay
Streamer.bot
produktive Count-/Storage-Logik
```

---

# CURRENT_SYSTEM_STATUS - STEP251 Update

DeathCounter V2 unterstützt Zusatzspieler jetzt auch über das Dashboard.

Neu im Dashboard:

```text
Community → DeathCounter → Steuerung → Zusatzspieler
```

Funktionen:

```text
- Zusatzspieler hinzufügen
- Zusatzspieler entfernen
- alle Zusatzspieler leeren
- aktive Zusatzspieler als Pills anzeigen
- Grenze aus maxExtraPlayers anzeigen
```

Technisch:

- Dashboard nutzt weiterhin die zentrale Command-API `/api/deathcounter/v2/command`.
- Dashboard schreibt nicht direkt in JSON, SQLite oder State-Dateien.
- `sendChat=0` verhindert Chat-Ausgaben bei Dashboard-Aktionen.
- Übersicht/Sichtbare-Spieler-Anzeige nutzt jetzt Standardspieler plus Zusatzspieler.

Nicht geändert:

```text
backend/modules/deathcounter_v2.js
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Actions/Exports
```

# STEP252 Update

DeathCounter V2 bereitet jetzt eigene Datenbanktabellen vor, ohne die produktive JSON-State-Logik umzustellen.

Neue vorbereitete Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Technisch:

- Schema-Migration läuft sanft über die zentrale DB-Schicht `backend/core/database.js`.
- Schema-Version: `deathcounter_v2_storage`.
- `/api/deathcounter/v2/integration-check` prüft jetzt auch den vorbereiteten DB-Storage.
- `/api/deathcounter/v2/config` und `/api/deathcounter/v2/settings` enthalten Storage-Statusdaten.

Nicht geändert:

```text
data/deathcounter/deathcounter.v2.json bleibt produktive Single Source of Truth
keine Count-Migration
keine produktive DB-Schreib-/Leselogik für Counts
kein Overlay-Umbau
keine Streamer.bot-Änderung
```


# STEP253 Update

DeathCounter V2 hat jetzt eine Read-only-Vorschau fuer die spaetere DB-Storage-Migration.

Neue Route:

```text
GET /api/deathcounter/v2/storage/preview
```

Die Route erzeugt aus dem produktiven JSON-State im Speicher eine Vorschau fuer die vorbereiteten Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Technisch:

- `/api/deathcounter/v2/integration-check` prueft jetzt zusaetzlich `database_storage_preview`.
- Die Preview meldet explizit `readOnly`, `writesDatabase`, `importsCounts` und `switchesStorage`.
- `deathcounter_events` wird nicht aus dem JSON rekonstruiert und bleibt in der Preview leer.

Nicht geändert:

```text
data/deathcounter/deathcounter.v2.json bleibt produktive Single Source of Truth
keine Count-Migration
kein DB-Import
keine produktive DB-Schreib-/Leselogik fuer Counts
kein Overlay-Umbau
keine Streamer.bot-Aenderung
```
