# Modul-Doku: Shot-Alarm

Stand: 2026-06-19

## Zweck

Der Shot-Alarm verarbeitet Support-Events aus Twitch, Ko-fi und Tipeee und erzeugt daraus Shot-Auslosungen für Engel & Roxxy.

Es gibt pro Support-Event eine eigene Chat-/Overlay-/Sound-Ausgabe. Die daraus entstehenden Shots werden in einem gemeinsamen offenen Shot-Zähler gesammelt.

## Dashboard-Pfad

`Community → Event-System → Shot-Alarm`

Tabs:

- Status
- Logs
- Statistik
- Overlay
- Sounds

## Hauptdateien

- `backend/modules/shot_alarm.js`
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`

## Backend-Version

Aktuell dokumentierter Stand:

- Version `0.2.13`
- Build `STEP_SHOT_ALARM_2K2_AUTO_STREAM_SESSION_BINDING`

## Wichtige Routen

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/start`
- `POST /api/shot-alarm/stop`
- `POST /api/shot-alarm/new-session`
- `POST /api/shot-alarm/shot-done`
- `GET /api/shot-alarm/streams`
- `GET /api/shot-alarm/dashboard-audit`

Weitere Test-/Config-/Text-/History-Routen sind im Modul selbst zu prüfen, falls daran gearbeitet wird.

## Commands

- `!shotdone`
- Alias: `!shotgetrunken`

Zweck:

- offene Shots reduzieren.
- getrunkene Shots erhöhen.
- Chat-/Overlay-/Status aktualisieren.

Berechtigungen:

- Broadcaster
- Mods
- Engel/Roxxy gemäß Command-Konfiguration

## Eventquellen

Twitch/Communication-Bus:

- Subs
- Resubs
- GiftSubs
- Giftbombs
- Bits/Cheers

Payments:

- Ko-fi über `payment.kofi.received`
- Tipeee über `payment.tipeee.received`

Stream-Session:

- `twitch.stream.session.started`
- `twitch.stream.session.confirmed`
- `twitch.stream.session.resumed`
- `twitch.stream.session.ended`

## Grundregeln

- Einzel-Sub/Resub/GiftSub: 20 %
- jeder 5. einzelne Support-Zähler: 50/50
- jeder 10. einzelne Support-Zähler: sicherer Shot
- 5er Bombe: 50/50
- je 10 Subs in Bombe: 1 sicherer Shot
- Bits: je 1.000 Bits 50/50
- Bits: je 10.000 Bits sicherer Shot
- Ko-fi/Tipeee: je 10 € 50/50 gemäß Config

## Sound

Shot-Ergebnis-Sounds werden nicht direkt im Shot-Overlay abgespielt.

Ablauf:

Shot-Alarm → Media-System/Sound-Media-Bridge → Sound-System → Device/Discord

Produktive Parameter:

- `category=alert`
- `target=both`
- `outputTarget=device`
- `queueIfBusy=true`
- `dropIfBusy=false`
- `priority=80`

Mehrere zufällige Sounds können im Dashboard konfiguriert werden.

## Overlay

Overlay-Datei:

`htdocs/overlays/shot_alarm/shot_alarm_overlay.html`

Produktiv:

`/overlays/shot_alarm/shot_alarm_overlay.html`

Offline-Test:

`/overlays/shot_alarm/shot_alarm_overlay.html?force=1`

Debug:

`/overlays/shot_alarm/shot_alarm_overlay.html?debug=1`

Eigenschaften:

- Topbar im DeathCounter-/CGN-Stil.
- Ergebnis-Card mittig.
- Statusbar nur sichtbar, wenn Shot-Alarm aktiv und produktiv sichtbar sein darf.
- Direkter Heartbeat für Overlay-Monitor.
- Overlay-Bus bleibt eingebunden.
- Ergebnis bleibt Sounddauer + Puffer sichtbar.

## Stream-/Session-Verhalten

Shot-Alarm nutzt die zentrale Stream-Session aus `twitch_events`.

Ziel:

- Jeder echte Stream bekommt eigene `streamSessionId`.
- Runtime-Zähler laufen nicht streamübergreifend weiter.
- History/Logs bleiben erhalten.
- Statistik kann nach Stream/Event gefiltert werden.

Manueller Fallback:

- Button „Neue Shot-Session starten“
- Löscht keine History.
- Setzt nur Runtime für frische Session zurück.

## Bekannte nächste Arbeit

- Event-/Overlay-Queue für mehrere schnelle Support-Events absichern.
- Live-Abendstream mit echter Twitch-Stream-ID final prüfen.
- Statistik/History weiter ausbauen.
