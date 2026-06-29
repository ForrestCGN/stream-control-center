# Current Status

Stand: 2026-06-29

Aktuell: `RDAP_0.2.24_MEDIA_READONLY_FOUNDATION` - Media-System im Remote-Modboard als read-only Grundlage vorbereitet.

## Neuer Fokus

```text
Media-System ins Remote-Modboard bringen.
```

Umgesetzt in 0.2.24:

```text
- Neuer Navigationsbereich Media vorbereitet.
- Seite Medienuebersicht / Media-System vorbereitet.
- Remote-Modboard und lokales dashboard-v2 bekommen dieselbe Media-UI-Grundlage.
- Neuer read-only Status-Endpunkt: GET /api/remote/media/status.
- Lokal/Online wird klar unterschieden.
- Online zeigt keine Fake-Dateien, weil der Webserver keinen direkten Zugriff auf Stream-PC-Medien hat.
- Upload, Bearbeiten und Loeschen bleiben deaktiviert.
- Permission-Zielmodell sichtbar: media.read, media.upload, media.edit, media.delete.
- Keine Dateiscans, keine Writes, keine DB-Migration, keine Agent-Actions.
```

## OBS-Stand beim Parken

```text
0.2.22E - Local/Online OBS Status Parity read-only, fast gut.
```

OBS bleibt geparkt in `project-state/PARKED_TODOS.md`.

## Naechster sinnvoller Schritt

```text
RDAP_0.2.25_MEDIA_LOCAL_INVENTORY_READONLY
```

Ziel danach:

```text
- Lokale Media-Ordner read-only inventarisieren.
- Keine Uploads.
- Keine Deletes.
- Safe-Path / Extension-Allowlist / Groessenlimits beachten.
- Online weiterhin ohne Fake-Daten; spaeter Agent-Sync separat planen.
```

Weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Media-Writes
keine Uploads ohne separaten Permission-/Audit-Step
keine Deletes ohne separaten Permission-/Audit-/Confirm-Step
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions ausser reine Node-read-only Routen im freigegebenen Step
keine Secrets in Logs, Status, UI oder Doku
```
