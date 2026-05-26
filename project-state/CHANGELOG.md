# CHANGELOG

## STEP464_SHOUTOUT_TIMELINE_AND_STREAMDAY_LIMIT

- `backend/modules/clip_shoutout.js` auf Runtime-Version `0.2.7` erhöht.
- Timeline-Route `GET /api/clip-shoutout/timeline` ergänzt.
- Display-Queue speichert jetzt `stream_day_id`, Override-Status und Override-Quelle.
- Official-Queue und Official-History speichern jetzt `display_queue_id` zur Zuordnung zum Display-Shouti.
- Neue Tabelle `clip_shoutout_stream_days` ergänzt.
- Streamtag-Limit ergänzt: Ein Zielkanal bekommt pro Streamtag standardmäßig nur einen Shouti.
- Override per `!vso @user --force` ergänzt.
- Keine Änderung am Sound-System, Dashboard oder EventBus-Flow.
