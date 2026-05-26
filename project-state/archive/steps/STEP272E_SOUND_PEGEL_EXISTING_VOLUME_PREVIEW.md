# STEP272E - Sound-Pegel bestehende Volume-Preview

## Ziel
Bestehende Sound-/Alert-/SoundAlert-/VIP-Lautstärke-Daten zunächst nur sichtbar machen, bevor eine Massenänderung gebaut wird.

## Backend
Neue Read-only Route:

- `GET /api/sound/loudness/config/mass-volume-preview`

Die Route liest die bestehende SQLite und liefert eine Vorschau für:

- Alert-Regeln, falls `alert_rules.sound_volume` vorhanden ist
- SoundAlerts/Kanalpunkte aus `soundalerts_bridge_entries.volume`
- VIP-/Mod-Default aus `vip_sound_settings.soundSystemVolume`
- Pegel-Scan-Bewertung für Boost-Kopie nötig / Runtime leiser möglich

## Dashboard
Unter `System -> Sound-Pegel -> Config` gibt es jetzt `Volume-Preview`.

Angezeigt werden:

- geprüfte Einträge
- Kandidaten für spätere Änderung
- Einträge mit 100 Prozent
- Boost-Kopie nötig
- Runtime leiser möglich
- Tabellen pro Bereich

## Sicherheit
Nur Vorschau. Keine bestehenden Daten, keine Dateien, keine Alert-Regeln und keine SoundAlert-Entries werden verändert.

## Geänderte Dateien

- `backend/modules/sound_loudness_scanner.js`
- `htdocs/dashboard/modules/sound_levelscan.js`
- `htdocs/dashboard/modules/sound_levelscan.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
