# CAN-44.21.27 – SO Queue Contract + Official Shoutout Coupling

## Ziel
Dieser Step setzt die vereinbarte SO-Logik im Clip-Shoutout-Modul um:

- `!so` / `!vso` nutzt die bestehende Live-/Offline-/Override-Logik des Systems.
- `--force` umgeht nur das StreamDay-/Tageslimit, aber nicht Queue-Sicherheit, Cooldowns oder Twitch-Regeln.
- Jeder manuelle SO-Befehl bekommt eine passende Chatantwort.
- Chatantworten enthalten keine Uhrzeiten und keine Minuten-Schätzung, sondern Zustand und Position in der SO-Liste.
- Gleicher Streamer in aktiver/wartender DisplayQueue wird nicht doppelt eingereiht.
- Wenn derselbe Streamer schon wartet und erneut mit `--force` angefragt wird, bleibt der vorhandene Eintrag bestehen und es wird kein zusätzlicher offizieller Twitch-Shoutout vorgemerkt.
- Offizielle Twitch-Shoutouts bleiben über die vorhandene OfficialQueue gekoppelt und werden pro Streamer nicht doppelt erzeugt.
- Wenn Twitch den offiziellen `/shoutout` aktuell nicht erlaubt, bleibt der OfficialQueue-Eintrag erhalten und es wird eine passende Warteschlangenmeldung ausgegeben.

## Betroffene Datei

- `backend/modules/clip_shoutout.js`

## Modulversion

- `clip_shoutout` von `0.2.31` auf `0.2.32`

## Wichtiges Verhalten

### DisplayQueue

- Neuer SO für freien Streamer: wird eingereiht oder startet direkt.
- Bereits aktiver gleicher Streamer: kein zweiter Eintrag, Chatmeldung „läuft bereits“.
- Bereits wartender gleicher Streamer: kein zweiter Eintrag, Chatmeldung mit Position.
- Bereits wartender gleicher Streamer + `--force`: vorhandener Eintrag bleibt, kein zusätzlicher offizieller Twitch-Shoutout.

### OfficialQueue

- Ein offizieller Twitch-Shoutout pro Streamer in `queued`/`waiting`.
- Duplicate-Official-Queue-Einträge werden nicht neu erzeugt.
- Wenn Twitch offline/LiveGate/Cooldown/400 blockiert, bleibt der Eintrag in der OfficialQueue.
- Keine rohen Zeitversprechen im Chat.

## Nicht geändert

- Kein IFrame.
- Kein Twitch-Embed.
- Keine Player-/Overlay-Änderung.
- Keine Tabellen gelöscht.
- Keine Cooldowns entfernt.
- Keine produktive SQLite-Datenbank ersetzt.
