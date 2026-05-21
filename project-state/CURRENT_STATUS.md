# CURRENT_STATUS

## STEP272J – Sound-Pegel Stable-Doku

Der aktuelle Sound-Pegel-Stand ist stabil dokumentiert.

### Status

- Sound-System-Defaults: 80 %
- Upload-Default: 80 %
- Max Playback Volume: 100 %
- Playback-Korrektur: für Einpegelung deaktiviert
- Scan läuft wieder nach STEP272I5
- Backup-/Promote-Workflow vorhanden
- Dashboard-Dropdown für Boost-Kopien vorhanden
- Usage-Check vorhanden, damit nicht versehentlich ungenutzte Dateien bearbeitet werden
- Scan-Excludes für Test-/Backup-/Generated-Dateien vorhanden

### Produktiver Workflow

1. Sound-Pegel-Scan ausführen.
2. Boost-Preview öffnen.
3. Nur aktiv genutzte Datei auswählen.
4. Original abspielen.
5. Boost per Slider/Dropdown einstellen.
6. Boost-Testkopie erzeugen.
7. Testkopie abspielen.
8. Wenn ok: als Original übernehmen.
9. Bei Problemen: Rollback aus Historie.

### Backup-Pfad

`htdocs/assets/sounds/_backup_loudness/<timestamp>/<originalpfad>`

### Testkopien-Pfad

`htdocs/assets/sounds/normalized/<originalpfad>`

### Nicht scannen

- `normalized/`
- `_backup_loudness/`
- `generated/`
- TTS-/Cache-Pfade
