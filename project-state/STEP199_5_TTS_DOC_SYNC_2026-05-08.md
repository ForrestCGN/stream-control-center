# STEP199.5 - TTS Doku-Sync

Stand: 2026-05-08

## Ziel

Nach Abschluss von STEP199.1 bis STEP199.4 werden die zentralen Projektdateien auf den tatsaechlichen TTS-Endstand gebracht.

## Geaenderte Dateien

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/FILES.md`
- `project-state/CHANGELOG.md`
- `project-state/STEP199_5_TTS_DOC_SYNC_2026-05-08.md`

## Dokumentierter Endstand

### Backend

- TTS liegt in `backend/modules/tts_system.js`.
- Keine separate Admin-Datei als Zielstand.
- Die temporaere `backend/modules/tts_admin_api.js` wurde entfernt.
- DB-Settings laufen ueber `tts_settings` und `helper_settings.js`.
- Events/Statistik laufen ueber `tts_events` und `tts_usage_daily`.

### Dashboard

- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`
- Einbindung in `htdocs/dashboard/index.html`
- TTS registriert sich selbst in `window.CGN.modules.tts` und `window.CGN.moduleCatalog.tts`.
- `htdocs/dashboard/app.js` wurde fuer TTS nicht geaendert.

### Routen

Dokumentiert wurden u. a.:

```text
GET /api/tts/config
GET /api/tts/voices
GET /api/tts/routes
GET /api/tts/admin/settings
POST /api/tts/admin/settings
GET /api/tts/stats/users
```

## Bewusst offen

- TTS-Texte spaeter in globales DB-basiertes Textvarianten-System migrieren.
- Settings-Tab spaeter von Raw-JSON auf fachliche Formulare aufteilen.
- Optional CSV-Export fuer TTS User-Statistik.
- Optional klickbare Tabellenkopf-Sortierung.

## Keine Code-Aenderung

Dieser STEP ist reine Dokumentation.
