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
