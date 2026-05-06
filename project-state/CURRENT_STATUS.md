# CURRENT STATUS - stream-control-center

Stand: 2026-05-06

## Aktueller SoundAlerts-Stand

SoundAlerts Bridge ist bis STEP193.7 im Backend/Dashboard vorbereitet und live getestet bzw. fuer den naechsten Deploy vorbereitet.

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
- Eintraege koennen im Dashboard nach `Alle`, `Aktiv`, `Inaktiv`, `Datei fehlt`, `Ignoriert` gefiltert werden.
- Inaktive vollstaendig konfigurierte Eintraege zaehlen nicht mehr als offene Einrichtung.
- Upload zeigt Status/Fortschritt.
- Loeschen/Ignorieren sind direkte Backend-Aktionen und brauchen kein Config-Speichern mehr.
- Uebersicht zeigt ab STEP193.7 kompakte Kennzahlen und die letzten 5 Events mit Schnellaktionen.

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

OBS Loader Standard:

```text
_SoundAlerts_Loader bleibt als 1x1 px OBS-Browserquelle aktiv geladen.
Audio ist im OBS-Mixer stumm.
Quelle nicht per Auge deaktivieren.
Bild/Ton-Ausgabe laeuft ueber das eigene Sound-System.
```

Fachregel:

```text
Loeschen = Eintrag wird entfernt. Kommt derselbe SoundAlert wieder rein, wird er neu erkannt und neu angelegt.
Ignorieren = Eintrag bleibt mit Status ignored bestehen. Kommt derselbe SoundAlert wieder rein, wird er nicht als neuer offener Eintrag angelegt.
```

## Bewusst offen

- Dashboard-Eintragsfilter fuer `active`, `missing_file`, `ignored`, `file_matched`.
- Upload-/Zuweisungsfluss weiter UX-seitig verbessern.
- Clip: echter Live-Test von `/api/clip/create`.
- Echten MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.
