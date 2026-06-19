# CURRENT_CHAT_HANDOFF_SHOT_ALARM_2K2_READY

Stand: 2026-06-19

## Kontext

Wir arbeiten am Projekt `stream-control-center` für ForrestCGN, Bereich `Community → Event-System → Shot-Alarm`.

Bitte auf Deutsch arbeiten, ruhig und strikt schrittweise.

Arbeitsregeln:

- Erst prüfen, dann planen, dann auf ausdrückliches `go` warten.
- Keine Umsetzung ohne `go`.
- Aktuelle echte Dateien/ZIPs sind Source of Truth.
- Nicht raten. Fehlende Dateien exakt anfordern.
- Keine Funktionalität entfernen.
- Vorhandene Systeme verwenden statt Parallelstrukturen: Communication/EventBus, Twitch-Events, Sound-System, Media-System, Dashboard-Struktur, Text-/Config-/DB-Helper.
- ZIPs immer mit echten Zielpfaden liefern.
- Nach ZIP-Einspielen: erst `stepdone.cmd`, dann testen.

## Aktueller Stand

Aktueller Backend-Stand:

- `backend/modules/shot_alarm.js`
- Version: `0.2.13`
- Build: `STEP_SHOT_ALARM_2K2_AUTO_STREAM_SESSION_BINDING`

Aktuelle wichtige Step-Stände:

- `SHOT_ALARM_2J5_test_resolve_overlay_sound_fix.zip`
- `SHOT_ALARM_2K_overlay_heartbeat_fix.zip`
- `SHOT_ALARM_2K1_fresh_stream_session.zip`
- `SHOT_ALARM_2K2_auto_stream_session_binding.zip`

## Funktionsstand

Shot-Alarm ist als Untermodul im Event-System eingebunden.

Dashboard:

- Status
- Logs
- Statistik
- Overlay
- Sounds

Sounds:

- Mehrere zufällige Shot-Ergebnis-Sounds konfigurierbar.
- Auswahl über Media-System.
- Wiedergabe über Sound-System.
- `target=both`, `outputTarget=device`, `category=alert`.
- Sound-System bleibt Playback-/Queue-Owner.

Overlay:

- Produktives Overlay: `/overlays/shot_alarm/shot_alarm_overlay.html`
- Offline-Testfenster: `/overlays/shot_alarm/shot_alarm_overlay.html?force=1`
- Debug: `/overlays/shot_alarm/shot_alarm_overlay.html?debug=1`
- Overlay sendet jetzt Heartbeat.
- Overlay bleibt beim Ergebnis Sounddauer + Puffer sichtbar.

Test-Auslösung:

- `Test sofort` und `Test mit 10s Auslosung` resolved wieder sauber.
- Chat-Startmeldung allein ist nicht mehr Endzustand.
- Ergebnis-Overlay und Ergebnis-Sound laufen.

Shot-Zählverhalten:

- Pro Support-Event/User eigene Chat-/Overlay-/Sound-Meldung.
- Shots werden gemeinsam in `shotsOpen` addiert.
- Beispiel: 100er Bombe, 50er Bombe, Ko-fi 50 € → drei Meldungen, ein Gesamtzähler.

## Stream-Session

Zentrale Quelle:

- `backend/modules/twitch_events.js`
- `GET /api/twitch/events/stream-state`
- `GET /api/twitch/events/stream-session`

Shot-Alarm hört auf:

- `twitch.stream.session.started`
- `twitch.stream.session.confirmed`
- `twitch.stream.session.resumed`
- `twitch.stream.session.ended`

Override-Test wurde erfolgreich geprüft:

- `twitch_events` erzeugte aktive manuelle Test-Session.
- Shot-Alarm übernahm dieselbe `streamSessionId`.
- Nach Clear Override ging `twitch_events` wieder offline.
- Shot-Alarm zeigte danach `streamLive: false`, `streamStatus: offline`, `effectiveActive: false`, `visible: false`.

## Wichtig für nächsten Chat / Abendstream

Noch live zu prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-session" |
  ConvertTo-Json -Depth 10
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status" |
  Select-Object -ExpandProperty runtime |
  ConvertTo-Json -Depth 8
```

Erwartet nach echtem Streamstart:

- zentrale `streamSessionId` ist gefüllt.
- Shot-Alarm übernimmt dieselbe ID.
- alte Test-Shots laufen nicht weiter.
- Shot-Alarm wird erst produktiv sichtbar, wenn im Dashboard gestartet und Stream live ist.

## Nächster sinnvoller Step nach Live-Check

`SHOT-ALARM-2L Event-/Overlay-Queue absichern`

Ziel:

- mehrere Support-Events kurz hintereinander sauber nacheinander anzeigen.
- keine Overlay-Meldung überschreiben.
- Sound-System-Queue respektieren.
- gemeinsame Shot-Zähler beibehalten.
