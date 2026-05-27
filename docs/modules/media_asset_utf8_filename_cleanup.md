# Media Asset UTF-8 / Dateinamen Cleanup

Stand: 2026-05-27

## Problem

Bei Uploads mit Umlauten/Sonderzeichen konnten Mojibake-/Encoding-Artefakte entstehen, z. B.:

```text
GewA_1_4rzGurke.mp3
```

## Ziel

Trennung zwischen Anzeige und technischem Dateinamen:

```text
Anzeige/DisplayName: lesbar, z. B. GewürzGurke
Technischer Dateiname: ASCII-sicher, z. B. GewuerzGurke.mp3
```

## Gültiger Fix

Verwenden:

```text
STEP524_MEDIA_ASSET_UTF8_FILENAME_CLEANUP_REAL_v0.1.0
```

Nicht verwenden:

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
```

Der zurückgezogene Stand wurde nicht nach der verbindlichen Arbeitsweise erstellt.

## Regeln

- Keine Dateien ohne Prüfung verschieben/löschen.
- DB nur über bestehende zentrale Helper/Module nutzen.
- Bestehende `media_assets`-Einträge vorsichtig reparieren.
- Technische Dateinamen nur umbenennen, wenn Datei existiert und Pfad sicher innerhalb `htdocs/assets` liegt.
