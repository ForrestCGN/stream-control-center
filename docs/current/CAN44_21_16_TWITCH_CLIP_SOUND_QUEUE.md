# CAN-44.21.16 – Twitch-Clip-Playback über Sound-System-Queue

Stand: 2026-06-05
Projekt: ForrestCGN/stream-control-center
Branch-Ziel: dev
Live-Ziel: D:\Streaming\stramAssets

## Ziel

Clip-Shoutouts sollen nicht mehr scheitern, nur weil die direkte Node-seitige Twitch-MP4-/Playback-URL-Auflösung fehlschlägt. Die stabile Legacy-Logik wird übernommen: Clip-ID auswählen und den Clip im Browser/Overlay per Twitch-GQL auflösen. Gleichzeitig bleibt die neue Sound-System-/Bundle-/Queue-Architektur erhalten.

## Geänderte Dateien

- `backend/modules/clip_shoutout.js`
- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html`

## Technischer Ablauf

```text
!so / Auto-Shoutout
→ clip_shoutout Display-Queue
→ Clip suchen und auswählen
→ Bundle-Item type/mediaType "twitch_clip" mit clipId + durationMs bauen
→ /api/sound/bundle
→ Sound-System-Queue / Bundle-Lock
→ sound_system_overlay.html löst clipId im Overlay per Twitch-GQL auf
→ Clip läuft im bestehenden Clip-Card-Layout
→ Overlay meldet /client/audio-started und /client/audio-ended
→ Official Twitch Shoutout wird danach wie bisher geplant
→ nächster Queue-Eintrag
```

## Was bewusst erhalten bleibt

- Keine Rückkehr zu Streamer.bot `Wait`.
- Keine direkte OBS-Show/Hide-Steuerung aus Streamer.bot für Clip-Shoutouts.
- Sound-System-Queue und Bundle-Lock bleiben maßgeblich.
- Display-Queue, AutoShoutout, Dashboard-Queue, Retry/Remove und Official-Shoutout-Worker bleiben erhalten.
- Der direkte Playback-Weg bleibt im Code unterstützt, ist aber nicht mehr der sichere Default.
- Keine DB-Änderung.

## Design-/Dashboard-Merker

Spätere Vorgabe: Alle Overlays sollen im Dashboard designbar werden, damit andere Streamer eigene Looks erstellen können. Für Clip-Shoutout betrifft das mindestens:

- Panel-Größe und Position
- Avatar sichtbar/unsichtbar, Größe, Rahmen, Glow
- Video-Frame-Größe, Radius, Position
- Name/Subline sichtbar/unsichtbar, Text, Schrift, Farben
- Hintergrund/Gradient/Rahmen/Glow
- Intro-/Outro-Animation
- Theme-Presets, z. B. Forrest Neon / Neutral / Custom

CAN-44.21.16 baut diese Dashboard-Bearbeitung noch nicht aus. Die neue `twitch_clip`-Logik ist aber so angelegt, dass `visual.theme`, `visual.layout`, `visual.clipId`, `visual.displayName`, `visual.avatarUrl` und `visual.subline` später aus Config/Dashboard kommen können.

## Tests

Syntax lokal geprüft:

```powershell
node -c backend\modules\clip_shoutout.js
node -c backend\modules\sound_system.js
```

HTML-Script-Syntax wurde aus `sound_system_overlay.html` extrahiert und mit Node geprüft.

Empfohlene Live-Tests nach Installation:

```powershell
node -c D:\Streaming\stramAssets\backend\modules\clip_shoutout.js
node -c D:\Streaming\stramAssets\backend\modules\sound_system.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object moduleVersion,lastError,lastRun,lastClipSearch | ConvertTo-Json -Depth 50
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/clips?target=pretos1" | ConvertTo-Json -Depth 40
```

Live im Chat:

```text
!so pretos1 --force
```

Danach prüfen:

- Clip reiht sich in Sound-System-Queue ein.
- Während Clip läuft, startet kein zweiter Clip parallel.
- Clipdauer blockiert korrekt anhand `durationMs`.
- Overlay meldet Start/Ende.
- Official Twitch Shoutout folgt nach dem Display-Teil.
