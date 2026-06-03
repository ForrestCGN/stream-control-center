# Media Modul

## Kurzbeschreibung

Das Modul `media` stellt die zentrale Medien-Registry bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/media.js
```

Das Modul verwaltet:

- Audio-Dateien
- Video-Dateien
- Bilder
- Animationen
- Modul-/Zusatzkategorien
- zentrale Picker-Optionen
- Recent-Uploads als virtuelle Ansicht
- Media-Auflösung für andere Module
- Upload-Pfade unter `htdocs/assets/media/<module>/<category>/`
- Scan bestehender Asset-Ordner
- optionale Namens-/Encoding-Reparatur

## Modulstand

- Backend-Datei: `backend/modules/media.js`
- Modulname: `media`
- Registry-Key: `media`
- Modulversion: `0.1.1`
- Build: `diagnostics-standard`
- Step: `STEP524`
- Schema-Version: `2`
- Hauptprefix: `/api/media`

## Wichtige Grundregel

Bestehende Assets werden nicht verschoben oder gelöscht.

Neue Uploads landen unter:

```text
htdocs/assets/media/<module>/<category>/
```

Bestehende Asset-Ordner werden nur gescannt und in `media_assets` registriert.

## Diagnose-Status CAN-43.11

CAN-43.11 hat das Modul nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Kategorien-Route vorhanden.
- Medienliste vorhanden.
- Picker-Optionen vorhanden.
- Repair-Namen-Check read-only geprüft.
- Registry-Coverage sauber.
- Live-Status sauber.
- Keine Diagnostics-Warnings/Errors.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/media/status`
- `GET /api/media/list`
- `GET /api/media/resolve`
- `GET /api/media/categories`
- `GET /api/media/picker-options`
- `GET /api/media/repair-names?apply=false&renameFiles=false`

## Produktive / ändernde Routen

Diese Routen sind produktiv oder können State/Dateien verändern und wurden im CAN-43.11 Review nicht ausgelöst:

- `GET/POST /api/media/scan`
- `POST /api/media/upload`
- `POST /api/media/update`
- `POST /api/media/delete`
- `POST /api/media/category/upsert`
- `GET/POST /api/media/repair-names?apply=true`
- `repair-names` mit `renameFiles=true`

## Bestätigte Live-Werte CAN-43.11

```text
ok=True
module=media
moduleVersion=0.1.1
moduleBuild=diagnostics-standard
version=1
diagnosticVersion=0.1.1
step=STEP524
initialized=True
schemaOk=True
routeCount=11
```

```text
counts:
total=334
recent=20
categories=32
audio=279
video=17
image=38
animation=0
```

```text
diagnostics:
ok=True
health=ok
module=media
version=0.1.1
build=diagnostics-standard
step=STEP524
schemaVersion=2
schemaReady=True
lastError=
```

```text
database:
ok=True
adapter=sqlite
path=D:\Streaming\stramAssets\data\sqlite\app.sqlite
schemaVersion=2
expectedSchemaVersion=2
error=
```

## Repair-Check

Read-only geprüft:

```text
apply=False
renameFiles=False
count=334
changed=2
```

Bewertung:

- Nur Analyse.
- Keine DB-Änderung.
- Keine Datei-Umbenennung.
- `changed=2` bedeutet nur, dass zwei potenzielle Namenskorrekturen erkannt wurden.

## Hinweise

- Die produktive SQLite-Datenbank bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- Keine Funktionalität entfernen.
- Scan/Upload/Update/Delete/Repair nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
