# CURRENT SYSTEM STATUS

Aktueller Stand: STEP455 – Sound-System Overlay Bus Consumer Replacement.

## Zusammenfassung

- VIP ist produktiv über Node-Command-System + Sound-Bus angebunden.
- Alerts laufen produktiv Bus-First über `visual.alert` mit Legacy-Fallback.
- Das bestehende Sound-System-Overlay ist jetzt direkter Bus-Consumer für Sound-System-Events.

## Sound-System Overlay

Datei:

```text
htdocs/overlays/sound_system_overlay.html
```

Der bisherige produktive Playback-Client wurde erweitert, nicht ersetzt.

Aktive Wege:

```text
Communication-Bus sound.* Event
Legacy WebSocket op:sound_system
/api/sound/status Polling-Fallback
```

Das Overlay verarbeitet weiterhin:

- Audio
- Video
- Clip-Shoutout/VIP30
- Autoplay-Unlock
- Client-Started/Ended/Error Rückmeldungen

## Sound-System Backend

`backend/modules/sound_system.js` wurde in STEP455 nicht geändert.

Grund:

Die vorhandene Sound-Bus-Ausgabe reicht für den Overlay-Consumer aus. Dadurch bleibt die produktive Queue-/Priority-/Lock-/TTS-/Discord-Logik unberührt.

## Alerts

Aktueller Alert-Modus:

```text
bus_first mit Legacy-Fallback
```

Kein `bus_only`.

## Sicherheitsstand

- Keine bestehende Funktionalität entfernt.
- Legacy-Fallbacks bleiben erhalten.
- Polling-Fallback bleibt erhalten.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
