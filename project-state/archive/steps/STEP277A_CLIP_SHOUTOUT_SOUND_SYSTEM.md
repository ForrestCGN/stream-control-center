# STEP277A - Clip-Shoutout über Sound-System

## Ziel

Video-/Clip-Shoutout ohne Streamer.bot-Auslöser integrieren.

Der Clip soll mit Bild und Ton über das Sound-System laufen. Optional kann danach eine TTS-Ausgabe folgen. Das bestehende Clip-Shoutout-Design bleibt erhalten.

## Technischer Ablauf

```text
Twitch Chat
→ twitch_presence
→ command_system
→ /api/clip-shoutout/run
→ Twitch User + Clips
→ MP4-Cache unter htdocs/assets/sounds/clip_shoutout
→ /api/sound/bundle
→ sound_system_overlay.html
```

## Routen

- `GET /api/clip-shoutout/status`
- `GET/POST /api/clip-shoutout/run`
- `GET/POST /api/clip/shoutout`

## Command

Beim Modulstart wird `!vso` vorbereitet, wenn der Trigger noch nicht in `command_definitions` existiert.

Aliases:

- `clipso`
- `videoso`

Standard-Rechte:

- `mod`

## Sound-System-Bundle

Das Modul sendet ein locked Bundle an `/api/sound/bundle`.

Item 1:
- Clip-Video mit Ton
- `mediaType: video`
- `visual.module: clip_shoutout`
- bestehendes VIP30/Altersheim-TV-Design

Item 2 optional:
- TTS-Datei aus `/api/tts/synthesize`
- läuft direkt nach dem Clip
- bleibt durch Bundle-Lock mit dem Clip verbunden

## Design

Das Design wird im Sound-System-Overlay gerendert, nicht mehr in einer eigenen OBS-URL-Umschaltung.

Genutzt wird der bestehende Aufbau:

- Avatar links
- Neon-Divider
- Video rechts
- Name unter dem Video
- Subline `🧓 Altersheim-TV`

## Bewusst nicht geändert

- Kein Streamer.bot-Auslöser.
- Keine eigene Clip-Queue.
- Kein direkter OBS-URL-Wechsel.
- Keine Entfernung vorhandener Clip-, TTS-, Sound-, Alert-, VIP- oder Mod-Sound-Funktionen.
