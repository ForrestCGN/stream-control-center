# STEP192.3 - SoundAlerts Doku-Sync

Stand: 2026-05-06

## Zweck

Dieser STEP synchronisiert die zentralen Projekt-Dokus nach den abgeschlossenen SoundAlerts-Schritten STEP192.1, STEP192.1.1, STEP192.2 und STEP192.2.1.

Keine Codeaenderung in diesem STEP.

## Abgeschlossener SoundAlerts-Stand

### STEP192.1 - SoundAlerts Entries in DB

- SoundAlert-Eintraege/Mappings liegen primaer in der SQLite-Datenbank.
- Haupttabelle: `soundalerts_bridge_entries`.
- `config/soundalerts_bridge.json` bleibt Seed/Fallback und wird nicht geloescht.
- Wenn DB nicht verfuegbar ist, bleibt JSON als Fallback nutzbar.

### STEP192.1.1 - Defaults/Save Cleanup

- `soundalerts_bridge` Version `0.1.3`.
- Leere/falsche Kategorien werden normalisiert.
- Standard fuer normale SoundAlerts: `channel_reward`.
- Video bekommt `outputTarget = overlay`.
- Audio bekommt `outputTarget = device`.
- `priority` bleibt leer/null, wenn kein Override gesetzt ist.
- Effektive Prioritaet kommt dann aus Kategorie/Default.

### STEP192.2 - SoundAlerts Settings in DB

- `soundalerts_bridge` Version `0.1.4`.
- Technische/dashboardfaehige Settings liegen in `soundalerts_bridge_settings`.
- Settings werden ueber `helper_settings.js` verwaltet.
- JSON bleibt Seed/Fallback.
- Neue/aktive Routen:
  - `GET /api/soundalerts/settings`
  - `POST /api/soundalerts/settings`
- Bestehende Config-Routen bleiben kompatibel:
  - `GET /api/soundalerts/config`
  - `POST /api/soundalerts/config`
- Live bestaetigt: `settingsStats.count = 33`, `source = database`.

### STEP192.2.1 - DB-Core-Portability

- `soundalerts_bridge` Version `0.1.5`.
- Direkter Import von `./sqlite_core` im SoundAlerts-Modul wurde entfernt.
- SoundAlerts nutzt fuer Entries, Events, Meta, Stats und Listen `backend/core/database.js`.
- Settings nutzen weiterhin `helper_settings.js`.
- Ziel: besser vorbereitet fuer spaetere MariaDB-Unterstuetzung.

Wichtig: MariaDB ist dadurch vorbereitet, aber noch nicht komplett aktiv/lauffaehig. Der echte MariaDB-Adapter in `backend/core/database.js` ist weiterhin ein spaeterer eigener Schritt.

## Aktueller Live-Stand

Live getestet am 2026-05-06:

```text
GET /api/soundalerts/status
module = soundalerts_bridge
version = 0.1.5
database.ok = true
entriesTable = soundalerts_bridge_entries
settingsTable = soundalerts_bridge_settings
settingsStats.count = 33
settingsStats.source = database
config.soundSystem.defaultCategory = channel_reward
```

```text
GET /api/soundalerts/entries
source = db
fahrstuhl_sound aktiv
category = channel_reward
outputTarget = overlay
volume = 100
priority leer/null, effektiv 70
```

## Aktueller Testeintrag

```json
{
  "id": "fahrstuhl_sound",
  "enabled": true,
  "status": "active",
  "soundAlertName": "Fahrstuhl Sound",
  "label": "Fahrstuhl Sound",
  "file": "soundalerts/video/3cgn.mp4",
  "mediaType": "video",
  "category": "channel_reward",
  "outputTarget": "overlay",
  "volume": 100
}
```

## Aktive SoundAlerts-DB-Strukturen

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

## Aktive SoundAlerts-Routen

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`

## Aktive SoundAlerts-Dateien

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `config/soundalerts_bridge.json`

## Regeln

- Keine bestehende Funktionalitaet entfernen.
- DB ist Hauptspeicher fuer dashboardfaehige Daten.
- JSON bleibt Bootstrap/Seed/Fallback/Notfall.
- `.env` bleibt fuer Secrets/Tokens/private Keys.
- Neue DB-Logik soll nach Moeglichkeit ueber `backend/core/database.js` oder vorhandene Helper laufen.
- Keine neuen Parallelstrukturen bauen.

## Noch offen

### STEP193 - SoundAlerts Inbox / Auto Entries

Ziel:

- Wenn ein SoundAlerts-Chateintrag kommt, der noch keinen DB-Eintrag hat, automatisch einen Eintrag anlegen.
- Status moeglichst sauber unterscheiden:
  - `new_detected`
  - `missing_file`
  - `file_matched`
  - `ready`
- Dashboard soll neue automatische Eintraege sichtbar anzeigen.
- Datei hochladen/zuweisen aus dem Eintrag heraus.

### Spaeter

- SoundAlerts Admin-Config UI sauber vom normalen Sound-System trennen.
- Upload-Limits dashboardfaehig anzeigen und bearbeiten.
- Grosse Video-Uploads optional erhoehen, z. B. `upload.maxVideoSizeBytes = 524288000`.
- Echter MariaDB-Adapter in `backend/core/database.js`.
- SQL-Dialekt-Unterschiede zentral kapseln, z. B. Upsert/Autoincrement/Migrationen.
