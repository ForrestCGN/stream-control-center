# STEP276E – Alert Legacy-Sound einklappen

## Ziel

Der alte Alert-Sound-Weg bleibt vollständig erhalten, wird im Regel-Editor aber weniger prominent dargestellt.

## Änderung

- `Sound aus Media-Registry` bleibt die primäre sichtbare Auswahl.
- `Legacy-Sound / Fallback` wurde in `Alter Sound / Fallback` umbenannt.
- Der alte Soundbereich ist jetzt ein einklappbarer Bereich.
- Wenn kein Media-Registry-Sound gesetzt ist, bleibt der Fallback-Bereich offen.
- Wenn ein Media-Registry-Sound gesetzt ist, ist der Fallback-Bereich standardmäßig eingeklappt.

## Unverändert

- `sound_asset_id` bleibt erhalten.
- `sound_media_id` bleibt erhalten.
- Playback-Logik bleibt unverändert.
- Alert+TTS-Bundle bleibt unverändert.
- Bestehende Legacy-Sounds bleiben als Fallback nutzbar.

## Tests

- `node --check htdocs/dashboard/modules/alerts.js`
- Funktionsvergleich: keine vorhandene Funktion entfernt.
