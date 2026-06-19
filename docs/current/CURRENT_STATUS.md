# CURRENT_STATUS

Stand: 2026-06-19

## Projektbereich

`stream-control-center` / `Community → Event-System → Shot-Alarm`

Aktueller geprüfter Stand nach den heutigen Steps:

- Backend `shot_alarm`: **0.2.13**
- Build: **STEP_SHOT_ALARM_2K2_AUTO_STREAM_SESSION_BINDING**
- Dashboard-Stand aus den letzten Shot-Alarm-Steps: Subtabs, Logs, Statistik, Overlay und Sounds vorhanden.
- Overlay-Stand: **SHOT-ALARM-2K Overlay Heartbeat Fix**

## Aktueller Funktionsstand

Der Shot-Alarm ist als eigenes Untermodul im Event-System eingebunden:

`Community → Event-System → Shot-Alarm`

Dort gibt es die Bereiche:

- Status
- Logs
- Statistik
- Overlay
- Sounds

Zusätzlich sind die Shot-Alarm-Texte weiterhin im bestehenden Event-System-Textebereich eingebunden und die Shot-Alarm-Konfiguration bleibt getrennt von der normalen Event-System-Konfiguration.

## Heute abgeschlossene/freigegebene Themen

- `!shotdone` / `!shotgetrunken` über das bestehende Command-System angebunden.
- Berechtigungen für Broadcaster, Mods, Engel/Roxxy berücksichtigt.
- Dashboard-Audit/Safety für kritische Schreibaktionen ergänzt.
- Ko-fi/Tipeee senden Payment-Bus-Events, die vom Shot-Alarm verarbeitet werden können.
- History-ID-Konflikt behoben.
- Audit-Action-Namen bereinigt.
- Overlay optisch auf Topbar/DeathCounter-Stil umgebaut.
- Overlay zeigt Statusbar nur, wenn Shot-Alarm aktiv und produktiv sichtbar sein darf.
- Offline-Test über `?force=1` möglich.
- Shot-Alarm nutzt Overlay-/Communication-Bus und direkten Heartbeat.
- Dashboard zeigt Start/Stop, Logs, Statistik, Overlay-Status und Sound-Konfiguration.
- Sounds werden über Media-System/Sound-System eingebunden.
- Mehrere zufällige Shot-Sounds möglich.
- Shot-Sounds laufen über Sound-System mit Queue, `target=both`, `outputTarget=device`, `category=alert`.
- Overlay bleibt beim Ergebnis mindestens Sounddauer + Puffer sichtbar.
- Test-Auslösung hängt nicht mehr bei `draw_started`, sondern resolved wieder sauber.
- Frische Shot-Session kann manuell als Fallback gestartet werden.
- Shot-Alarm hört jetzt auf zentrale Twitch-Stream-Session-Events.

## Stream-Session-Stand

Die zentrale Quelle ist `backend/modules/twitch_events.js`.

Relevante Endpunkte:

- `GET /api/twitch/events/stream-state`
- `GET /api/twitch/events/stream-session`

Der Shot-Alarm liest den Stream-State und ist zusätzlich an diese Session-Events angebunden:

- `twitch.stream.session.started`
- `twitch.stream.session.confirmed`
- `twitch.stream.session.resumed`
- `twitch.stream.session.ended`

Getestet wurde per manuellem Stream-Override:

- `twitch_events` erzeugte eine aktive Session.
- Shot-Alarm übernahm dieselbe `streamSessionId`.
- Nach Clear Override ging `twitch_events` wieder auf offline.
- Shot-Alarm ging ebenfalls auf `streamLive: false`, `effectiveActive: false`, `visible: false`.

## Zielverhalten Shots

Mehrere Support-Events kurz hintereinander werden **nicht** zu einer Sammelmeldung verschmolzen.

Gewünschtes Verhalten:

- Pro User/Event eine eigene Chat-/Overlay-/Sound-Meldung.
- Shots werden in einen gemeinsamen offenen Gesamtzähler addiert.
- Beispiel: User A 100er Bombe, User B 50er Bombe, User C Ko-fi 50 € → drei einzelne Einblendungen, aber ein gemeinsamer offener Shot-Zähler.

## Aktuelle wichtige URLs

Produktives Overlay:

`http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html`

Offline-/Dashboard-Testfenster:

`http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?force=1`

Debug-Demo:

`http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?debug=1`

## Wichtig für den Abendstream

Vor dem echten Stream sollte kein manueller Twitch-Override aktiv sein.

Nach dem echten Streamstart prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-session" |
  ConvertTo-Json -Depth 10
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status" |
  Select-Object -ExpandProperty runtime |
  ConvertTo-Json -Depth 8
```

Erwartung:

- `twitch_events.streamSession.streamSessionId` ist gefüllt.
- `shot_alarm.runtime.currentStreamSessionId` passt dazu.
- `streamLive: true` nach echter Live-Erkennung.
- Alte Test-Shots laufen nicht in die neue Session weiter.

## Statusbewertung

Der aktuelle Entwicklungsstand ist für den nächsten Live-Test vorbereitet.

Noch nicht final durch echten Abendstream bestätigt ist nur die reale Twitch-Stream-ID-Übernahme unter Live-Bedingungen. Der manuelle Override-Test hat die 2K2-Anbindung aber grundsätzlich bestätigt.
