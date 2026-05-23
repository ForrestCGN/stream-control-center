# Alert-System MediaId Integration - STEP276 Zusammenfassung

## Zweck

Das Alert-System nutzt nun die zentrale Media-Registry, ohne bestehende Alert-Assets zu entfernen.

## Datenbankfelder

`alert_rules` enthält zusätzlich:

- `sound_media_id INTEGER`
- `image_media_id INTEGER`

Diese Spalten werden idempotent sichergestellt.

## Sound-Playback

Wenn `sound_media_id` gesetzt ist, baut das Alert-System ein Sound-System-Item mit:

```json
{
  "mediaId": 1234
}
```

Wenn keine `sound_media_id` gesetzt ist, bleibt der alte Weg aktiv:

```text
sound_asset_id -> sound_url -> file
```

## Sound + TTS

Das Alert-System baut ein gemeinsames Sound-System-Bundle:

1. Main-Sound
2. TTS-Item

Der Fehler, dass das Main-Sound-Item nicht zurückgegeben wurde, ist behoben.

## Media-Details in Rules-API

Die Rules-API liefert bei gesetzten MediaIds zusätzliche Details, unter anderem Label, Dauer und URL. Das Dashboard kann dadurch korrekte Media-Registry-Daten anzeigen.

## Fallback-Regel

Media-Registry hat Vorrang. Legacy bleibt Fallback.

Keine bestehende Funktionalität entfernen.
