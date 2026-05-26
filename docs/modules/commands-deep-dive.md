# Commands Modul

Stand: v0.1.4 (`safe-modal-editor`)

## Zweck

Das Commands-Modul verwaltet Chat-Commands zentral im Backend und stellt ein Dashboard bereit, mit dem Commands erstellt, bearbeitet, gelöscht, gesucht und nach Kategorien angezeigt werden können.

## Aktueller Schwerpunkt v0.1.4

- Dashboard nutzt einen Modal-Editor für neue und bestehende Commands.
- Bearbeiten speichert bestehende Commands eindeutig per `id`/`originalTrigger`.
- Ein bearbeiteter Command darf nicht versehentlich als neuer Command angelegt werden.
- Löschen erfolgt mit Ja/Nein-Rückfrage.
- Kategorien, Suche und Direkt-Auswahl sind in der normalen UI vorhanden.
- `Nur Live` ist nicht mehr Teil der normalen Oberfläche. Das Backend-Feld bleibt aus Kompatibilitätsgründen erhalten und wird in der UI standardmäßig auf `false` gesetzt.
- Medien-Commands bleiben an die Media-Playback-Bridge angebunden: `mediaId -> /api/sound/play`.

## Backend-Version

- `MODULE_VERSION = 0.1.4`
- `MODULE_BUILD = safe-modal-editor`

## Wichtige Routen

- `GET /api/commands/status`
- `GET /api/commands/list`
- `GET /api/commands/catalog`
- `POST /api/commands/upsert`
- `POST /api/commands/delete`
- `GET|POST /api/commands/test`
- `GET|POST /api/commands/execute`
- `GET /api/commands/logs`
- `GET /api/commands/media-command-check`

## Sicheres Bearbeiten

`POST /api/commands/upsert` unterstützt ab v0.1.4 zusätzlich sichere Edit-Parameter:

```json
{
  "editMode": true,
  "id": 123,
  "originalId": 123,
  "originalTrigger": "test",
  "trigger": "test2"
}
```

Wenn ein bestehender Command bearbeitet wird, aktualisiert das Backend den Datensatz per ID. Falls der neue Trigger bereits von einem anderen Command belegt ist, wird `command_trigger_already_exists` zurückgegeben.

## UI-Regeln

Normale Nutzer sehen zuerst:

- Trigger
- Aliase
- Aktion auswählen
- Rechte
- Cooldowns
- Aktiv

Technische Felder liegen im Bereich `Erweitert / technische Details`.
