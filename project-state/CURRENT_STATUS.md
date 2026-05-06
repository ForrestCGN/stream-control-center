# CURRENT STATUS - stream-control-center

Stand: 2026-05-06

## Aktueller SoundAlerts-Stand

SoundAlerts Bridge ist bis STEP193.5 im Backend/Dashboard vorbereitet und live getestet.

Backend:

- `backend/modules/soundalerts_bridge.js`
- Version: `0.1.9`
- DB-Zugriffe laufen ueber `backend/core/database.js`.
- Settings laufen ueber `backend/modules/helpers/helper_settings.js`.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- SoundAlert-Eintraege koennen bearbeitet/gespeichert werden.
- Upload zeigt Status/Fortschritt.
- Loeschen/Ignorieren sind direkte Backend-Aktionen und brauchen kein Config-Speichern mehr.

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

Aktive SoundAlerts-Routen:

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `DELETE /api/soundalerts/entries/:entryKey`
- `POST /api/soundalerts/entries/:entryKey/delete`
- `POST /api/soundalerts/entries/:entryKey/ignore`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`
- `POST /api/soundalerts/test/chat`
- `GET /api/soundalerts/events`
- `GET /api/soundalerts/stats`

Live bestaetigt:

```text
GET /api/soundalerts/status
version: 0.1.9
database.ok: true
entriesTable: soundalerts_bridge_entries
settingsTable: soundalerts_bridge_settings
settingsStats.count: 33
settingsStats.source: database
config.soundSystem.defaultCategory: channel_reward
upload.maxVideoSizeBytes: 1073741824
```

STEP193 Live-Tests:

```text
Auto-Entry:
Neuer Test Sound -> autoEntry.created = true -> status missing_file

Ignore:
neuer_test_sound -> status ignored
Wiederkehr-Test -> autoEntry.created = false, reason = entry_exists

Delete:
loesch_test_sound wurde direkt im Dashboard geloescht
Nach Loeschen ohne Config-Speichern blieb nur fahrstuhl_sound
```

Fachregel:

```text
Loeschen = Eintrag wird entfernt. Kommt derselbe SoundAlert wieder rein, wird er neu erkannt und neu angelegt.
Ignorieren = Eintrag bleibt mit Status ignored bestehen. Kommt derselbe SoundAlert wieder rein, wird er nicht als neuer offener Eintrag angelegt.
```

## Bewusst offen

- Dashboard-Layout der Eintragskarten optisch aufraeumen.
- Filter/Ansichten fuer `active`, `missing_file`, `ignored`, `file_matched`.
- Upload-Zuweisung weiter UX-seitig verbessern.
- Clip: echter Live-Test von `/api/clip/create`.
- Echten MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.
