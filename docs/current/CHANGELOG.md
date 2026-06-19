# CHANGELOG

Stand: 2026-06-19

## SHOT-ALARM-2K2 Auto Stream Session Binding

- Shot-Alarm auf Backend-Version `0.2.13` aktualisiert.
- Build: `STEP_SHOT_ALARM_2K2_AUTO_STREAM_SESSION_BINDING`.
- Shot-Alarm abonniert zentrale Twitch-Stream-Session-Events:
  - `twitch.stream.session.started`
  - `twitch.stream.session.confirmed`
  - `twitch.stream.session.resumed`
  - `twitch.stream.session.ended`
- Override-Test bestätigt: Shot-Alarm übernimmt die von `twitch_events` erzeugte `streamSessionId`.
- Nach Clear Override geht die zentrale Session wieder offline und Shot-Alarm wird produktiv unsichtbar.

## SHOT-ALARM-2K1 Fresh Stream Session

- Backend auf `0.2.12` aktualisiert.
- Neuer Endpunkt `POST /api/shot-alarm/new-session`.
- Dashboard-Button „Neue Shot-Session starten“ ergänzt.
- Runtime kann für einen frischen Stream manuell zurückgesetzt werden.
- History/Logs werden dabei nicht gelöscht.
- Button bleibt Fallback, nicht Hauptlogik.

## SHOT-ALARM-2K Overlay Heartbeat Fix

- Shot-Overlay sendet jetzt echten direkten WebSocket-Heartbeat.
- Monitor-Warnung „nur angemeldet, aber ohne echten Heartbeat“ behoben.
- Overlay-Bus-Einbindung bleibt erhalten.

## SHOT-ALARM-2J5 Test Resolve Overlay Sound Fix

- Backend auf `0.2.11` aktualisiert.
- Test-Auslösung bleibt nicht mehr bei `draw_started` hängen.
- `Test sofort` resolved wieder sauber.
- `Test mit 10s Auslosung` resolved nach Ablauf zuverlässig.
- Ergebnis-Overlay und Ergebnis-Sound laufen wieder.
- Produktive Shot-Sounds werden als `category=alert` gesendet.

## SHOT-ALARM-2J4 Overlay Hold Until Sound End

- Backend auf `0.2.10` aktualisiert.
- Overlay-Hold wird anhand Sounddauer + Puffer berechnet.
- Ergebnis-Overlay bleibt bei langen Shot-Sounds sichtbar.

## SHOT-ALARM-2J3 Stream Session ID Crash Fix

- Backend auf `0.2.9` aktualisiert.
- Crash durch undefinierte Variable bei Stream-Session-Wechsel behoben.

## SHOT-ALARM-2J2 Random Sounds Device Discord Queue

- Backend auf `0.2.8` aktualisiert.
- Shot-Sounds laufen über Sound-System mit `target=both` und `outputTarget=device`.
- Device und Discord werden über Sound-System genutzt.

## SHOT-ALARM-2J1 Random Overlay Sounds Media Queue

- Mehrere zufällige Shot-Sounds über Media-System konfigurierbar.
- Sound-System-Queue wird genutzt.

## SHOT-ALARM-2J Overlay Sound Media System Queue

- Shot-Alarm-Sounds an Media-System/Sound-System angebunden.
- Shot-Overlay selbst spielt keinen Sound direkt ab.

## SHOT-ALARM-2I / 2I1 Dashboard Subtabs & Sounds

- Shot-Alarm-Subtabs für Status, Logs, Statistik, Overlay und Sounds ergänzt.
- Sounds-Tab auf die relevante Overlay-/Ergebnis-Soundliste reduziert.

## SHOT-ALARM-2H bis 2H3 Runtime/Overlay/Dashboard

- Persistenter Runtime-/Aktivzustand ergänzt.
- Start/Stop im Dashboard ergänzt.
- Overlay wird produktiv nur bei aktivem Shot-Alarm und Live-Status gezeigt.
- Offline-Testfenster per `?force=1` ergänzt.
- Dashboard-Zustand/Logs/Statistik bereinigt.

## SHOT-ALARM-2C bis 2F Basis-Fixes

- `!shotdone` / `!shotgetrunken` angebunden.
- Dashboard-Audit/Safety ergänzt.
- Ko-fi/Tipeee Payment-Bus ergänzt.
- History-ID-Konflikt behoben.
- Audit-Action-Namen bereinigt.
