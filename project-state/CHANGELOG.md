# CHANGELOG

## STEP274D
- Zentrale Media-Resolver-Schicht in `backend/modules/media.js` ergänzt.
- Neue API `GET /api/media/resolve` hinzugefügt.
- `commands_media.js` nutzt jetzt `media.mediaOptionFromAsset(...)` statt eigener Pfadlogik.
- Dashboard-Hinweise für Command-Media-Auswahl aktualisiert.
- Keine bestehende Command-Ausführung verändert.
- Keine Medien verschoben oder gelöscht.

## STEP274C
- Commands im Dashboard mit zentraler Medienverwaltung verbunden.
- `sound_play` und `video_play` laden Medienoptionen aus `media_assets`.
- Bestehende Command-Ausführung nicht verändert.
