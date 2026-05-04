# STEP023 - VIP Streamer.bot -> Sound-System -> Overlay V2 getestet

Stand: 2026-05-04

## Ziel

Den echten Streamer.bot-Command `!vip` vom alten direkten VIP-Overlay-Trigger auf den neuen Backend-/Sound-System-Ablauf umstellen und testen.

## Ergebnis

STEP023 erfolgreich.

Der neue Ablauf funktioniert:

1. Twitch-Chat-Command `!vip @user`
2. Streamer.bot Fetch URL zu `/api/vip-sound/command`
3. VIP-Backend prueft Daily-Usage/Override/Sounddatei
4. VIP-Backend queued Sound ueber `/api/sound/play`
5. Sound-System startet Sound ueber AudioDeviceHelper
6. OBS-Browserquelle nutzt `vip_sound_overlay_v2.html`
7. VIP Overlay V2 zeigt die Visualdaten aus `sound_system.current.visual`
8. Nach Soundende ist alles wieder idle

## Streamer.bot-Umbau

Die alte VIP-Action hatte noch den direkten Legacy-Overlay-Weg genutzt und dadurch `/api/vip-sound/enqueue` bzw. den alten In-Memory-VIP-Overlay-State gestartet.

Neu aufgebaut:

- Neue/saubere Streamer.bot-Action fuer `!vip`
- Nur eine Fetch-URL-Subaction
- Zielroute: `/api/vip-sound/command`
- Keine eigene Chat-Ausgabe in Streamer.bot
- Keine direkte OBS-/Overlay-Subaction in Streamer.bot
- Keine alte VIP-Queue-/Overlay-Action mehr am `!vip`-Command

## OBS-Anpassung

Die VIP-Browserquelle muss auf Overlay V2 zeigen:

- `/overlays/vip_sound_overlay_v2.html`

Zum Debuggen wurde kurz `?debug=1` genutzt. Danach soll die Debug-Option wieder entfernt werden.

## Live-Test-Ergebnis

Vor dem Test:

- VIP-Status idle
- VIP Overlay State idle
- Sound-System current null
- Queue leer

Nach `!vip @araglor`:

- Sound-System `current` enthielt ein VIP-Item
- `current.source = streamerbot-vip-command`
- `current.file = vip/araglor.mp3`
- `current.visual.module = vip_sound_overlay`
- `stats.started` stieg
- `deviceStarted` stieg
- OBS zeigte das VIP Overlay V2 sichtbar an
- Chat-Ausgabe kam ueber Heimaufsicht/Bot

Nach Soundende:

- VIP-Status wieder idle
- VIP Overlay State wieder idle
- Sound-System `current = null`
- Queue leer
- `device.lastOk = true`
- AudioDeviceHelper meldete Playback beendet

## Wichtige Erkenntnis

`/api/vip-sound-overlay/state` bzw. der alte VIP-In-Memory-Overlay-State bleibt fuer Overlay V2 bewusst idle, weil Overlay V2 direkt auf `/api/sound/status` und Sound-System-WebSocket-Daten hoert.

Das ist korrekt, solange OBS `vip_sound_overlay_v2.html` nutzt.

## Keine Codeaenderung

In STEP023 wurde kein Backend-Code geaendert.

Geaendert/angepasst wurde nur:

- Streamer.bot Action fuer `!vip`
- OBS-Browserquelle fuer VIP Overlay V2
- Dokumentation

## Bewusst offen

- Debug-Parameter `?debug=1` in OBS wieder entfernen, wenn nicht mehr gebraucht.
- Alte VIP-Action in Streamer.bot deaktiviert lassen oder spaeter nach Backup sauber entfernen.
- Legacy-Routen `/api/vip-sound/enqueue` und `/api/vip-sound-overlay/enqueue` vorerst fuer Kompatibilitaet behalten, aber nicht mehr fuer den normalen `!vip`-Ablauf nutzen.
- VIP-Soundpfad spaeter konfigurierbar machen.
- VIP-Dashboard fuer Texte/Settings spaeter bauen.

## Sicherheit / Regeln

- Keine Funktionalitaet entfernt.
- Keine SQLite-Datei committed oder ersetzt.
- Keine Secrets, `.env`, Tokens, Backups oder temporaeren Dateien committed.
