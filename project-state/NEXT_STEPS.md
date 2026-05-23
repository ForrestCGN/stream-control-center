# NEXT_STEPS

## Direkt nach STEP277A

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Ausführen:

```cmd
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP277A Clip-Shoutout über Sound-System"
```

3. Backend neu starten, weil ein neues Modul geladen wird.
4. Sound-System-Overlay in OBS prüfen:
   - Browserquelle sollte weiterhin `http://127.0.0.1:8080/overlays/sound_system_overlay.html` nutzen.
   - Optional einmal mit `?debug=1` laden und Audio aktivieren.

## Tests

### Status

```text
http://127.0.0.1:8080/api/clip-shoutout/status
```

Erwartet:
- `ok: true`
- `enabled: true`
- Command `vso`
- Route `/api/clip/shoutout`

### Manueller API-Test

```text
http://127.0.0.1:8080/api/clip-shoutout/run?target=KANALNAME
```

### Chat-Test

```text
!vso @KANALNAME
```

## Danach sinnvoll

- TTS nach Clip im Dashboard konfigurierbar machen.
- Clip-Shoutout-History in SQLite ergänzen.
- Optional: Auswahlregeln für Clips erweitern, z. B. Mindestdauer, Maximaldauer, keine doppelten Clips pro Stream.
- Optional: offizieller Twitch-Shoutout zusätzlich als eigener Backend-Schritt.
