# CURRENT SYSTEM STATUS – STEP274Q

STEP274Q ist ein reiner Tool-Hotfix fuer die Media Registry Migration.

Behoben wird der Apply-Abbruch `UNIQUE constraint failed: media_assets.relative_path` durch:

- eindeutige Zielpfad-Reservierung im Plan,
- Vorab-Validierung gegen doppelte Zielpfade,
- zweiphasige DB-Updates ueber temporaere Unique-Pfade.

Commands bleiben auf `mediaId` stabil. Dateien werden weiterhin kopiert und nicht geloescht.
