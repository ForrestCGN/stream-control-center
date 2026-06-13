# FILES

Aktueller Stand: EVS-16c Texte Tab Module Filter Cleanup.

Geändert:
- Texte-Tab hat nun Dropdown-Filter nach Textbereich/Modul.
- Suche nach Key/Text vorbereitet.
- Keine Backend-/DB-/Runtime-Änderung.

Betroffene Dateien:
- htdocs/dashboard/modules/stream_events.js
- htdocs/dashboard/modules/stream_events.css


## EVS-17 Sound Chat Answer Prep

- Sound-Chat-Antwortauswertung vorbereitet.
- Neue Route: `POST /api/stream-events/sound-runtime/test-chat`.
- Korrekte Antworten lösen aktive Sound-Runde über bestehende Runtime.
- Prepared-only bleibt aktiv: keine direkte Twitch-Ausgabe, kein direktes Playback, keine Sound-System-Queue-Berührung.
