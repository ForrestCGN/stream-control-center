# STEP193.3 - SoundAlerts Upload UX + Ignore Entries

Stand: 2026-05-06

## Ziel

Zwei Live-Punkte aus dem SoundAlerts-Test beheben:

1. Beim Dashboard-Upload grosser Dateien gab es keine klare Rueckmeldung zum Upload-Stand.
2. Automatisch erkannte Test-/Fehl-SoundAlerts erschienen nach dem Loeschen beim naechsten gleichen Trigger wieder.

## Geaenderte Dateien

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`

## Backend

### Version

- `soundalerts_bridge` von `0.1.7` auf `0.1.8` angehoben.

### Ignored-Status

- `soundalerts_bridge_entries` kann Eintraege mit `status = ignored` fuehren.
- Bestehende Auto-Create-Logik legt denselben SoundAlert nicht neu an, wenn bereits ein Eintrag mit gleichem SoundAlert-Namen existiert.
- Dadurch bleibt ein ignorierter Eintrag bestehen und verhindert erneutes Auto-Anlegen bei gleichem Chat-Trigger.
- `entriesStats` enthaelt jetzt `ignored`.
- `missingFile` zaehlt ignorierte Eintraege nicht mehr als offene fehlende Datei.

## Dashboard

### Upload-UX

- Upload-Button zeigt waehrend des Uploads `Upload laeuft…`.
- Upload-Button wird waehrend des Uploads deaktiviert.
- Upload-Statusbox zeigt:
  - Datei
  - Dateigroesse
  - Prozentfortschritt
  - Abschlussmeldung
  - Fehlerzustand
- Upload laeuft jetzt ueber `XMLHttpRequest`, damit Browser-Upload-Fortschritt angezeigt werden kann.
- `file_too_large` und andere Upload-Fehler werden weiter als lesbare Meldung angezeigt.

### Upload-Limits editierbar

- SoundAlerts Settings zeigen jetzt:
  - `Max. Audio-Upload (MB)`
  - `Max. Video-Upload (MB)`
- Speichern schreibt die Werte in `soundalerts_bridge_settings`:
  - `upload.maxAudioSizeBytes`
  - `upload.maxVideoSizeBytes`
- Werte werden intern wieder als Bytes gespeichert.
- Damit kann z. B. 1024 MB / 1 GB direkt im Dashboard gesetzt werden.

### Ignorieren statt Loeschen

- Offene/inaktive Eintraege koennen jetzt auf `Ignoriert` gesetzt werden.
- Ignorierte Eintraege erscheinen nicht mehr als offene Einrichtungsaufgabe.
- Loeschen bleibt weiterhin echtes Loeschen.
- Fachregel:
  - `Loeschen` entfernt den Eintrag. Kommt derselbe SoundAlert wieder rein, wird er erneut automatisch angelegt.
  - `Ignorieren` behaelt eine Sperr-/Merkliste als DB-Eintrag. Kommt derselbe SoundAlert wieder rein, wird kein neuer Eintrag erzeugt.

## Tests

Lokal ausgefuehrt:

```powershell
node -c backend/modules/soundalerts_bridge.js
node -c htdocs/dashboard/modules/soundalerts.js
```

## Nach Deploy testen

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Erwartung:

- `version = 0.1.8`
- `database.entriesStats.ignored` vorhanden
- `upload.maxVideoSizeBytes` bleibt auf dem aktuellen DB-Wert
- Dashboard zeigt Upload-Limits in MB
- Upload zeigt Fortschritt/Status
- Ignorierte Auto-Eintraege tauchen nicht mehr als offene Einrichtung auf

## Bewusst offen

- Kein kompletter Dashboard-Umbau.
- Kein neuer DB-Adapter.
- Kein Umbau der bestehenden Tabellen.
- Doku-Rollup in `CURRENT_SYSTEM_STATUS.md` und `project-state/*` separat als Doku-Sync moeglich.
