# STEP272H - Sound-Pegel Boost-Kopie übernehmen mit Backup

## Ziel

Zu leise Dateien können weiterhin als Boost-Kopie unter `htdocs/assets/sounds/normalized/` getestet werden. Wenn eine Kopie passt, kann sie jetzt kontrolliert an die Originalstelle übernommen werden, ohne bestehende Alert-/SoundAlert-/VIP-Konfigurationen umzubauen.

## Neue Backend-Routen

- `GET /api/sound/loudness/promote/history`
  - Zeigt die Historie übernommener Boost-Kopien und Backups.
- `POST /api/sound/loudness/promote/one`
  - Erstellt ein Backup der Originaldatei unter `htdocs/assets/sounds/_backup_loudness/<timestamp>/<originalpfad>`.
  - Kopiert danach die vorhandene Boost-Kopie aus `normalized/<originalpfad>` auf den Originalpfad.
  - Protokolliert die Aktion in SQLite `sound_loudness_promotions`.
- `POST /api/sound/loudness/promote/rollback-one`
  - Stellt eine übernommene Datei aus dem Backup wieder her.
- `POST /api/sound/loudness/boost/create-one`
  - Unterstützt jetzt explizit `overwrite`, damit vorhandene Boost-Kopien bewusst neu erzeugt werden können.

## Dashboard

Im Bereich `System -> Sound-Pegel -> Boost-Kopien` gibt es jetzt:

- Checkbox `vorhandene Boost-Kopie überschreiben`.
- Button `Boost-Kopie erzeugen`.
- Button `Kopie übernehmen`, wenn eine Boost-Kopie existiert.
- Historie `Übernommene Kopien / Backups` mit Rollback-Button.

## Sicherheit

- Originaldateien werden beim Erzeugen einer Boost-Kopie nicht verändert.
- Beim Übernehmen wird vor dem Ersetzen immer ein Backup erstellt.
- Bestehende Alert-/SoundAlert-/VIP-Regeln bleiben unverändert, weil der Originalpfad erhalten bleibt.
- Rollback ist über die gespeicherte Promotion-Historie möglich.
- `config/**`, Queue, Discord-Routing und TTS-System bleiben unverändert.
