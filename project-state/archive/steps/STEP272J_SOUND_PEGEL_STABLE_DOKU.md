# STEP272J – Sound-Pegel Stable-Doku

## Ziel

Den nach STEP272I5 erreichten stabilen Sound-Pegel-Zwischenstand dokumentieren.

## Ausgangslage

Der Sound-Pegel-Workflow wurde in mehreren kleinen Schritten aufgebaut:

- Scanner
- Dashboard-Config
- Standard-Volumes 80 %
- Upload-/Playback-Defaults
- Alert-Missing-Volumes
- Boost-Kopien
- Referenz-basiertes Boost-Ziel
- Promote mit Backup/Rollback
- Dashboard-Testplay
- Usage-Check
- Dropdown-Auswahl
- Scan-Excludes
- `startedAt`-Hotfix

## Bestätigter Scan nach Hotfix

Der Scan lief nach STEP272I5 erfolgreich:

```json
{
  "discoveredFiles": 224,
  "scannedFiles": 224,
  "okFiles": 78,
  "warningFiles": 143,
  "errorFiles": 3
}
```

## Unkritische Scan-Fehler

```text
Timer_.mp4      -> loudness_input_i_missing
leer.mp3        -> audio_stream_missing
test_ping.wav   -> audio_stream_missing
```

Bewertung:

- `Timer_.mp4` ist Video und nicht Teil des aktuellen Audio-Boost-Workflows.
- `leer.mp3` ist praktisch leer/kaputt.
- `test_ping.wav` ist Test-/Dummy-Datei ohne auswertbaren Audio-Stream.

## Aktueller Boost-Preview-Stand

Nach Bearbeitung der lauten/leisen Sounds bleiben laut Preview nur noch wenige aktiv genutzte Kandidaten relevant:

- `soundalerts/video/putzen.webm` → Video, später separat
- `alerts/1778330139754_Miss_Wikiki.mp3` → aktiv, aber nahe am Peak-Limit

Viele weitere Einträge sind ungenutzte Alt-/Duplikatdateien.

## Wichtige Sicherheitsregeln

- Originaldateien niemals ohne Backup ersetzen.
- Produktive Übernahme nur über `promote/one`.
- Rollback nur über Promotion-Historie.
- Nicht aktiv genutzte Dateien nicht produktiv übernehmen.
- `normalized/`, `_backup_loudness/` und `generated/` werden vom normalen Scan ausgeschlossen.
- Video-Dateien separat behandeln.

## Standard-Workflow für einzelne Datei

1. Dashboard öffnen: `System -> Sound-Pegel -> Boost-Kopien`
2. Ausgabe wählen: Overlay / Audiogerät / Both
3. Aktiv genutzte Datei auswählen
4. Original abspielen
5. Boost per Slider/Dropdown einstellen
6. Testkopie erzeugen
7. Testkopie abspielen
8. Wenn ok: Als Original übernehmen
9. Falls nötig: Rollback

## Rollback

Backups liegen unter:

```text
htdocs/assets/sounds/_backup_loudness/<timestamp>/<originalpfad>
```

Originale können über die Promotion-Historie zurückgesetzt werden.

## Nicht enthalten

STEP272J ändert keinen Code und keine Sound-Dateien. Es ist ein Doku-/Stable-Zwischenstand.
