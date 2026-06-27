# CAN-44.21.21 - Twitch-Clip direkt im Sound-System-Overlay

## Ziel

Der echte `!vso`-/Clip-Shoutout-Weg soll Twitch-Clips direkt im vorhandenen Sound-System-Overlay abspielen, ohne IFrame und ohne offiziellen Twitch-Embed.

## Hintergrund

CAN-44.21.20 hat gezeigt, dass `_overlay-clip_player.html` mit aktualisierter GQL-Logik wieder direkte Clip-Playback-URLs auflösen und abspielen kann.
CAN-44.21.19 nutzte den ClipPlayer jedoch als IFrame im Sound-Overlay. Dadurch entstand ein doppeltes Overlay im Overlay mit falscher Skalierung und unzuverlässiger Avatar-/Name-Übergabe.

## Geänderte Datei

- `htdocs/overlays/sound_system_overlay.html`

## Änderungen

- Entfernt die IFrame-Nutzung für `twitch_clip` vollständig.
- `twitch_clip` wird direkt im bestehenden Clip-Videoelement des Sound-System-Overlays abgespielt.
- Übernimmt die reparierte direkte Twitch-GQL-/MP4-Auflösung aus CAN-44.21.20:
  - zuerst explizite Query `ClipPlayerAccessTokenQuery`
  - danach persisted query Version 1
  - danach persisted query Version 2
- Keine Twitch-Embed-Seite als Standard, damit kein Mature-/FSK18-Gate im Overlay entsteht.
- Avatar-/Name-Auflösung im Clip-Card-Setup robuster gemacht:
  - `visual.*`
  - `meta.*`
  - Top-Level-Fallbacks
  - Avatar-Lookup über same-origin `/userinfo`
- Bottom-Status bleibt nur bei `?debug=1` sichtbar.
- Bus-Hello-Version auf `CAN44.21.21` angehoben.

## Nicht geändert

- Keine Queue-Logik entfernt.
- Kein Streamer.bot-Wait-System wieder eingeführt.
- Keine direkte OBS-Steuerung eingeführt.
- Kein Twitch-Embed/IFrame als Standard eingeführt.
- Backend-Dateien bleiben unverändert.

## Tests

Intern geprüft:

```powershell
node --check overlay_step460.js
```

Zusätzlich geprüft:

- Datei enthält keinen `<iframe>`-Tag mehr.
- `twitch_clip`-Handler bleibt vorhanden.
- `node --check` des extrahierten Overlay-Scripts erfolgreich.

## Live-Test

Nach Entpacken:

```powershell
.\stepdone.cmd "CAN-44.21.21 Twitch Clip Direct Sound Overlay"
```

Danach im Chat/Streamer.bot:

```text
!vso @pretos1 --force
```

Wenn der Clip nicht startet, mit Debug-Overlay testen:

```text
http://127.0.0.1:8080/overlays/sound_system_overlay.html?debug=1
```

und anschließend Eventbus-Auszug prüfen:

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status"
$e.recentEvents | Select-Object -Last 12 | ConvertTo-Json -Depth 10
```
