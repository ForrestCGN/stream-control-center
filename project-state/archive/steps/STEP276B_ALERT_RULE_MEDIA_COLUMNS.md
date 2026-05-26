# STEP276B_ALERT_RULE_MEDIA_COLUMNS

## Ziel

Alert-Regeln bekommen optionale Media-Registry-Referenzen, damit das Alert-System in den nächsten Steps Sounds/Bilder aus der zentralen Media-Registry nutzen kann.

## Geändert

- `backend/modules/alert_system.js`
  - `SCHEMA_VERSION` von 5 auf 6 erhöht.
  - `MODULE_STEP` auf 276 gesetzt.
  - `alert_rules` bekommt bei frischer DB zusätzlich:
    - `sound_media_id INTEGER`
    - `image_media_id INTEGER`
  - Migration STEP 6 ergänzt:
    - `sound_media_id`
    - `image_media_id`
  - `saveRule()` akzeptiert und speichert zusätzlich:
    - `sound_media_id` / `soundMediaId`
    - `image_media_id` / `imageMediaId`

## Bewusst nicht geändert

- Keine Dashboard-Änderung.
- Kein MediaPicker-Umbau.
- Kein Upload-Ziel geändert.
- Keine Legacy-Ordner entfernt.
- Keine `alert_assets`-Funktion entfernt.
- Kein Playback per `mediaId` aktiviert.
- Keine alten Dateien gelöscht.

## Warum dieser Step klein bleibt

Das Alert-System nutzt aktuell noch `alert_assets`, `sound_asset_id`, `image_asset_id`, `public_url` und `file_path`.
Dieser Step legt nur das Backend-Fundament, damit der nächste Step `mediaId` bevorzugt nutzen kann, ohne bestehende Regeln zu brechen.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\alert_system.js
```

Backend/API nach Entpacken und Neustart:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/alerts/status"
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/alerts/rules"
```

Erwartung:

- Backend startet ohne Fehler.
- `schemaVersion` steht nach Migration auf 6.
- Bestehende Regeln bleiben sichtbar.
- Bestehende Sounds über `sound_asset_id` bleiben unverändert.
