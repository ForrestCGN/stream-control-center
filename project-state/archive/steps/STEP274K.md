# STEP274K - Media Module Categories + Recent Uploads

Stand: 2026-05-23

## Ziel

Die Medienverwaltung wird als zentrale Registry weiter vorbereitet:

- Grobe Kategorie = `moduleKey`, wird vom aufrufenden Modul fest vorgegeben.
- Zusatzkategorie = `categoryKey`, kann vom User gewählt oder neu angelegt werden.
- Neue Uploads landen künftig unter `htdocs/assets/media/<moduleKey>/<categoryKey>/`.
- „Neueste Uploads“ ist eine virtuelle Ansicht, keine echte Speicher-Kategorie.
- Bestehende Medien werden nicht verschoben oder gelöscht.

## Geänderte Dateien

- `backend/modules/media.js`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/STEP274K.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Neue / erweiterte API

### `GET /api/media/status`

Erweitert um:

- `step: STEP274K`
- `mediaRootDir`
- `categories`
- `recentUploads`
- `categoryRules`
- neue Routenliste

### `GET /api/media/categories?moduleKey=alerts`

Listet Kategorien. Ohne `moduleKey` werden alle aktiven Kategorien ausgegeben.

### `POST /api/media/category/upsert`

Legt eine Zusatzkategorie pro Modul an oder aktualisiert sie.

Beispiel:

```json
{
  "moduleKey": "soundalerts",
  "categoryKey": "test",
  "label": "SoundAlerts / Test"
}
```

### `GET /api/media/picker-options`

Vorbereitung für den späteren zentralen Media-Picker.

Beispiele:

```text
/api/media/picker-options?moduleKey=alerts&type=audio,video&limit=50
/api/media/picker-options?view=recent&limit=20
/api/media/picker-options?view=recent&moduleKey=commands&limit=10
```

### `POST /api/media/upload`

Unterstützt jetzt zusätzlich:

- `moduleKey`
- `categoryKey`

Beispiel-Ziel:

```text
htdocs/assets/media/commands/fun/datei.mp3
htdocs/assets/media/alerts/bits/datei.mp4
htdocs/assets/media/soundalerts/test/datei.mp3
```

## Datenbank

### `media_assets`

Sanfte Migration:

- `module_key TEXT NOT NULL DEFAULT ''`
- `category_key TEXT NOT NULL DEFAULT ''`

Bestehende Daten bleiben erhalten.

### `media_categories`

Neue Tabelle:

- `id`
- `module_key`
- `category_key`
- `label`
- `relative_dir`
- `allowed_types_json`
- `is_system`
- `is_active`
- `created_at`
- `updated_at`

## Wichtig

STEP274K baut nur die Struktur/API-Vorbereitung. Der zentrale Dashboard-Picker/Upload-Dialog folgt als eigener Step.
