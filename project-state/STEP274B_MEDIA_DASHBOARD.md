# STEP274B – Media Dashboard

## Ziel
Zentrale Medienverwaltung im Dashboard als eigenes System-Modul.

## Inhalt
- `htdocs/dashboard/modules/media.js`
- `htdocs/dashboard/modules/media.css`
- `tools/easy/STEP274B_APPLY_MEDIA_DASHBOARD.cjs`

## Dashboard
Pfad: System → Medien

Tabs:
- Übersicht
- Audio
- Video
- Bilder
- Animationen
- Upload
- Diagnose

## Funktionen
- Medienstatus anzeigen
- Audio/Video/Bilder/Animationen getrennt listen
- Filter nach Suche/Kategorie/Status
- Browser-Vorschau per `<audio>`, `<video>` und `<img>`
- Upload per `/api/media/upload`
- Scan per `/api/media/scan`
- Metadaten speichern per `/api/media/update`
- Soft-Delete und optional endgültiges Dateilöschen per `/api/media/delete`

## Abgrenzung
Keine Command-Anbindung in diesem Step. Commands sollen Medien später über `media_assets` referenzieren.

## Test
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=audio"
```

Dashboard:
`http://127.0.0.1:8080/dashboard` → System → Medien
