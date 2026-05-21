# STEP272I2 – Sound-Pegel Dashboard Verwendungsprüfung

## Ziel

Der Boost-/Promote-Workflow darf nicht mehr nur nach gescannten Dateinamen arbeiten. Das Dashboard zeigt jetzt zusätzlich, ob eine Sounddatei wirklich in Alert-Regeln oder SoundAlerts/Kanalpunkten verwendet wird.

## Problem

`alerts/follow.mp3` wurde als Testdatei normalisiert, der echte Alert verweist aber auf eine andere Datei, z. B. `alerts/1779360860732_Follow.mp3`. Dadurch kann eine Datei angepasst werden, die live gar keinen Effekt hat.

## Änderungen

### Backend

- `backend/modules/sound_loudness_scanner.js`
  - Version: `0.1.11-step272i2-usage-check`
  - `GET /api/sound/loudness/usage/file?file=relative/path.mp3`
  - Boost-Preview ergänzt pro Datei:
    - `usage`
    - `usedByCount`
    - `activeUsedByCount`
    - `isUsed`
    - `isActivelyUsed`
    - `usageSummary`
  - Nutzung wird aus bestehenden DB-Tabellen ermittelt:
    - `alert_rules` + `alert_assets`
    - `soundalerts_bridge_entries`
  - Pfade aus `public_url`, `file_path`, `original_name` und `file` werden auf relative Soundpfade normalisiert.

### Dashboard

- `htdocs/dashboard/modules/sound_levelscan.js`
  - Boost-Kopien-Tabelle zeigt neue Spalte `Verwendung`.
  - Dateien ohne DB-Verwendung werden als `nicht aktiv verwendet` markiert.
  - `Als Original übernehmen` wird bei nicht verwendeten Dateien blockiert, damit keine Altdatei/Duplikat versehentlich produktiv ersetzt wird.
  - Genutzte Dateien zeigen Alert-/SoundAlert-Bezug als Tooltip/Label.

## Nicht geändert

- Keine Sounddateien geändert.
- Keine Alert-Regeln geändert.
- Keine SoundAlert-Einträge geändert.
- Kein `config/**` geändert.
- Keine Queue-/Discord-/TTS-Logik geändert.
- Keine automatische Normalisierung.

## Tests

```powershell
node --check backend\modules\sound_loudness_scanner.js
node --check htdocs\dashboard\modules\sound_levelscan.js
```

API-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/usage/file?file=alerts/follow.mp3" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/boost/preview" | ConvertTo-Json -Depth 100
```

## Erwartung

- `alerts/follow.mp3` wird als nicht verwendet oder mit tatsächlicher Verwendung angezeigt.
- Die echte Alert-Datei zeigt die zugehörige Alert-Regel.
- Übernahme wird nur bei Dateien angeboten, die in DB-Daten verwendet werden.
