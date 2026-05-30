# CHANGELOG-Snippet – STEP617C bis STEP618B

Dieses Snippet kann in `project-state/CHANGELOG.md` übernommen werden.

## 2026-05-30 – STEP617C/STEP618B Event-Bus Dashboard und Overlay-Client-Sichtbarkeit

### Geändert

- Event-Bus Settings-API direkt in `backend/modules/communication_bus.js` integriert.
- `GET/POST /api/communication/settings` nutzt DB-Speicherung über `backend/core/database.js`.
- Dashboard-Bus-Diagnose um Config-Tab und strukturierte Client-Sicht erweitert.
- Overlay-Clients im Clients-Tab gesondert sichtbar gemacht.
- Overlay-Erkennung in STEP618B korrigiert: nur `type=overlay`, `id=overlay:*` oder `mode=overlay`.

### Verworfen

- `communication_bus_settings.js` wird nicht verwendet.
- `STEP617B_event_bus_config_tab_hotfix_v0.1.1` ist verworfen.

### Status

- `communication_bus` meldet Version `0.8.2`.
- Settings-Speicher: `database`.
- Aktiver Adapter/Dialekt: `sqlite`.
- Tabelle: `communication_bus_settings`.
- Runtime-Übernahme: bewusst noch nicht sofort aktiv.

### Nächster Fokus

- Event-Bus Runtime-Config nicht automatisch weiter ausbauen.
- Neuer Fokus: Shoutout-System.
