# STEP276E_FIX2_ALERT_LEGACY_SOUND_NO_LAYOUT_SHIFT

Dashboard-only Fix für den Alert-Regel-Editor.

## Geändert

- `htdocs/dashboard/modules/alerts.js`

## Inhalt

Der geöffnete **Alter Sound / Fallback**-Bereich ist nun absolut positioniert und verschiebt den restlichen Medien-&-Design-Bereich nicht mehr nach unten.

## Unverändert

- Media-Registry-Sound hat weiter Vorrang.
- Alter Sound/Fallback bleibt als Sicherheitsfallback erhalten.
- Speicherlogik unverändert.
- Playback-Logik unverändert.
