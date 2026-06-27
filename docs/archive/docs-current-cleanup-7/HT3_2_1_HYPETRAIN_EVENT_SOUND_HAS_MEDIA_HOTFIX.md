# HT3.2.1 – HypeTrain EventSound hasMedia Hotfix

Stand: 2026-06-22

## Zweck

Behebt den Fehler in der Route `/api/hypetrain/event-actions`:

```text
ReferenceError: eventSoundHasMedia is not defined
```

## Änderung

- `backend/modules/hypetrain.js` auf `0.2.3` / `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX` angehoben.
- Fehlender Helper `eventSoundHasMedia(soundCfg)` ergänzt.
- Keine DB-Änderung.
- Keine Dashboard-Änderung.
- Sound bleibt Owner beim bestehenden `sound_system`.

## Erwartung

`GET /api/hypetrain/event-actions` liefert wieder die öffentliche Event-Action-Config und zeigt `hasMedia=false`, solange keine `mediaId` oder `soundId` gesetzt ist.
