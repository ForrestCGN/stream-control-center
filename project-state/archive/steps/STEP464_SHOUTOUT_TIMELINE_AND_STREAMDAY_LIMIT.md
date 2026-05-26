# STEP464_SHOUTOUT_TIMELINE_AND_STREAMDAY_LIMIT

## Ziel

Clip-Shoutout / VSO bekommt eine nachvollziehbare Timeline pro Shouti und eine Streamtag-Regel.

## Runtime

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.7`
- Test-Command bleibt: `!vso`

## Änderungen

- Display-Queue speichert zusätzlich:
  - `stream_day_id`
  - `override_used`
  - `override_by_login`
  - `override_reason`
- Official-Shoutout-Queue und Official-History speichern zusätzlich:
  - `display_queue_id`
- Neue Streamtag-Tabelle:
  - `clip_shoutout_stream_days`
- Neue Diagnose-Route:
  - `GET /api/clip-shoutout/timeline`
- Pro Streamtag wird ein Zielkanal standardmäßig nur einmal angenommen.
- Override ist möglich über:
  - `!vso @user --force`

## Streamtag-Logik

Ein Streamtag ist keine reine Kalenderdatum-Regel. Das Modul versucht den aktuellen Stream über vorhandene Twitch-Live-State-Dateien zu erkennen:

- `htdocs/data/twitch_stream_raw.json`
- `htdocs/data/twitch_live_data.json`

Bei Streamneustarts wird eine Grace-Zeit genutzt:

- Default: `1800000 ms` = 30 Minuten

Wenn kein Live-State ermittelbar ist, nutzt das Modul einen Fallback-Streamtag, damit Tests nicht abbrechen.

## Bewusst nicht geändert

- Keine Umstellung von `!vso` auf `!so`.
- Keine Änderung am Sound-System.
- Keine Änderung am EventBus-Flow.
- Keine Dashboard-Änderung.
- Keine neuen Chatmeldungen für den offiziellen Twitch-Shoutout-Folgeprozess.
- Display-Queue und Official-Queue bleiben getrennt.

## Tests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,command,officialChatMessagesMuted

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline?limit=20"
$t.items | Select-Object id,targetLogin,streamDayId,overrideUsed,displayStartedAt,displayFinishedAt,officialSentAt,officialResult
```

Chat-Test:

```text
!vso @urlug
!vso @urlug
!vso @urlug --force
```

Erwartung:

- Erster Befehl wird angenommen.
- Zweiter Befehl wird wegen Streamtag-Duplikat blockiert.
- Dritter Befehl wird wegen `--force` angenommen.
