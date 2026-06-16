# TODO – Sound-System Dashboard Verlauf

Muss später ins Dashboard/Control-Center aufgenommen werden.

## Sound-System: Verlauf / Zuletzt gespielt

Dashboard-Bereich für:

- zuletzt gespielte Sounds
- Alerts
- UserSounds
- EventSound/Sound-Snippets
- Fehler
- übersprungene/gestoppte Sounds
- Dauer und 2s Gap sichtbar machen
- Filter nach Status, Source, Kategorie, Sound-ID

API-Basis ab SOUND-LOG-1:

```text
GET /api/sound/recent-playback
```

Wichtig: Diese Einstellung/Ansicht soll streamer-/modfreundlich werden und nicht nur technische Felder anzeigen.
